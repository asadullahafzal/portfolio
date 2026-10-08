import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { formatDate, getPost, getPosts } from "@/lib/blog";
import { profile } from "@/data/profile";

// Share card for each blog post, rendered at build time.
export const alt = "Blog post by Asadullah Afzal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const post = await getPost((await params).slug);
  const icon = await readFile(join(process.cwd(), "scripts", "icon.svg"));
  const iconSrc = `data:image/svg+xml;base64,${icon.toString("base64")}`;
  const title = post?.title ?? "Blog";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "#05070f",
          backgroundImage:
            "radial-gradient(circle at 15% 10%, rgba(47,123,255,0.35), transparent 45%), radial-gradient(circle at 90% 100%, rgba(34,211,238,0.25), transparent 45%)",
          color: "#e8eeff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders plain <img> */}
          <img src={iconSrc} width={56} height={56} alt="" />
          <span style={{ fontSize: 26, color: "#8d9bc0" }}>asadullahafzal.com/blog</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: title.length > 70 ? 54 : 64, fontWeight: 700, lineHeight: 1.12, letterSpacing: -1.5, maxWidth: 1040 }}>{title}</div>
          {post && (
            <div style={{ display: "flex", gap: 12, marginTop: 30 }}>
              {post.tags.slice(0, 4).map((t) => (
                <span
                  key={t}
                  style={{ fontSize: 22, color: "#a5f3fc", border: "1px solid rgba(120,160,255,0.35)", borderRadius: 999, padding: "6px 18px" }}
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: "#8d9bc0" }}>
          <span>{profile.name}</span>
          {post && (
            <span>
              {formatDate(post.date)} · {post.readingMinutes} min read
            </span>
          )}
        </div>
      </div>
    ),
    size,
  );
}
