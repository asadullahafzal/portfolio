import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { profile, stats } from "@/data/profile";

// The preview card shown when the site is shared on LinkedIn, WhatsApp, X, Slack…
// Rendered once at build time.
export const alt = `${profile.name}: ${profile.roles.join(" · ")}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const [photo, icon] = await Promise.all([
    readFile(join(process.cwd(), "public", profile.photo)),
    readFile(join(process.cwd(), "scripts", "icon.svg")),
  ]);
  const photoSrc = `data:image/jpeg;base64,${photo.toString("base64")}`;
  const iconSrc = `data:image/svg+xml;base64,${icon.toString("base64")}`;
  const shown = stats.filter((s) => !/countries/i.test(s.label)).slice(0, 3);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#121110",
          backgroundImage:
            "radial-gradient(circle at 18% 12%, rgba(242,163,58,0.14), transparent 45%), radial-gradient(circle at 70% 95%, rgba(242,163,58,0.08), transparent 40%)",
          color: "#edebe4",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 0 56px 72px", width: 800 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders plain <img> */}
            <img src={iconSrc} width={64} height={64} alt="" />
            <span style={{ fontSize: 28, color: "#a39f94" }}>asadullahafzal.com</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 86, fontWeight: 700, lineHeight: 1, letterSpacing: -2 }}>Asadullah</div>
            <div style={{ fontSize: 86, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2, color: "#f2a33a" }}>Afzal</div>
            <div style={{ marginTop: 26, fontSize: 32, color: "#edebe4" }}>{profile.roles.join("  ·  ")}</div>
            <div style={{ marginTop: 14, fontSize: 28, color: "#a39f94" }}>{profile.tagline}</div>
          </div>

          <div style={{ display: "flex", gap: 44 }}>
            {shown.map((s) => (
              <div key={s.label} style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 44, fontWeight: 700 }}>
                  {s.value.toLocaleString("en-US")}
                  {s.suffix}
                </span>
                <span style={{ fontSize: 20, color: "#a39f94", maxWidth: 200 }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", position: "relative", width: 400, height: 630, overflow: "hidden" }}>
          {/* Zoomed in on the portrait (photo is 1086×1448) */}
          {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders plain <img> */}
          <img src={photoSrc} width={600} height={800} alt="" style={{ position: "absolute", left: -110, top: -40 }} />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 400,
              height: 630,
              display: "flex",
              backgroundImage: "linear-gradient(90deg, #121110 0%, rgba(18,17,16,0.55) 30%, rgba(18,17,16,0.15) 65%, rgba(18,17,16,0.35) 100%)",
            }}
          />
        </div>
      </div>
    ),
    size,
  );
}
