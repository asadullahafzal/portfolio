import { LIMITS, validateContact } from "@/lib/contact";

// Contact form endpoint. Validates, filters spam, then forwards the message to
// an n8n webhook that emails it. The webhook URL and shared secret only exist on
// the server (env vars), so they never reach the browser:
//   N8N_CONTACT_WEBHOOK_URL  e.g. https://n8n.example.com/webhook/portfolio-contact
//   N8N_CONTACT_SECRET       sent as the X-Contact-Secret header (checked by n8n)

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 3;
const hits = new Map<string, number[]>();

// Simple per-IP limit; enough for a single-server portfolio
function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear(); // keep memory bounded
  return false;
}

// Lets the page show the form only once delivery is configured (otherwise it shows an email button)
export async function GET() {
  return Response.json({ enabled: Boolean(process.env.N8N_CONTACT_WEBHOOK_URL) }, { headers: { "Cache-Control": "no-store" } });
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }

  // Honeypot: real visitors never see or fill this field. Pretend it worked.
  if (str(body.company, 200).trim()) return Response.json({ ok: true });

  // Bots submit instantly; people take a few seconds to type
  const elapsed = Number(body.elapsedMs);
  if (Number.isFinite(elapsed) && elapsed < 2500) return Response.json({ ok: true });

  const input = {
    name: str(body.name, LIMITS.name.max + 20),
    email: str(body.email, LIMITS.email.max + 20),
    message: str(body.message, LIMITS.message.max + 200),
  };
  const errors = validateContact(input);
  if (Object.keys(errors).length) return Response.json({ error: "invalid_fields", fields: errors }, { status: 422 });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) return Response.json({ error: "rate_limited" }, { status: 429 });

  const webhook = process.env.N8N_CONTACT_WEBHOOK_URL;
  if (!webhook) {
    console.error("[contact] N8N_CONTACT_WEBHOOK_URL is not set; message not delivered");
    return Response.json({ error: "not_configured" }, { status: 503 });
  }

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Contact-Secret": process.env.N8N_CONTACT_SECRET ?? "",
      },
      body: JSON.stringify({
        name: input.name.trim(),
        email: input.email.trim(),
        message: input.message.trim(),
        source: "asadullahafzal.com",
        submittedAt: new Date().toISOString(),
        userAgent: str(request.headers.get("user-agent"), 300),
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`n8n responded ${res.status}`);
  } catch (err) {
    console.error("[contact] delivery to n8n failed:", err);
    return Response.json({ error: "delivery_failed" }, { status: 502 });
  }

  return Response.json({ ok: true });
}
