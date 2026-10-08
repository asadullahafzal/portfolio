import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";

// Blog posts are Markdown files in content/blog/<slug>.md with YAML frontmatter:
//
//   ---
//   title: "Post title"
//   description: "One or two sentences for Google and share cards."
//   date: 2026-10-09
//   tags: [Three.js, React]
//   draft: false        # optional; drafts only show in development
//   ---
//
// Everything is read and rendered at build time, so posts are static HTML.

const BLOG_DIR = join(process.cwd(), "content", "blog");
const WORDS_PER_MINUTE = 220;

export type PostMeta = {
  slug: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  updated?: string;
  tags: string[];
  readingMinutes: number;
  draft: boolean;
};

export type Post = PostMeta & {
  html: string;
  headings: { id: string; text: string }[];
};

const markdown = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeSlug)
  .use(rehypeAutolinkHeadings, { behavior: "wrap", properties: { className: ["heading-anchor"] } })
  .use(rehypePrettyCode, { theme: "github-dark-default", keepBackground: false })
  .use(rehypeStringify);

function splitFrontmatter(source: string) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(source);
  if (!match) throw new Error("Blog post is missing its --- frontmatter --- block");
  return { data: (parseYaml(match[1]) ?? {}) as Record<string, unknown>, body: match[2] };
}

const toDate = (v: unknown) => (v instanceof Date ? v.toISOString().slice(0, 10) : String(v ?? ""));

function toMeta(slug: string, data: Record<string, unknown>, body: string): PostMeta {
  if (!data.title || !data.description || !data.date) throw new Error(`content/blog/${slug}.md needs title, description and date`);
  const count = (s: string) => s.split(/\s+/).filter(Boolean).length;
  const codeWords = count((body.match(/```[\s\S]*?```/g) ?? []).join(" "));
  // Code is skimmed rather than read word by word, so it counts at a reduced rate
  const words = count(body.replace(/```[\s\S]*?```/g, "")) + codeWords * 0.4;
  return {
    slug,
    title: String(data.title),
    description: String(data.description),
    date: toDate(data.date),
    updated: data.updated ? toDate(data.updated) : undefined,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    readingMinutes: Math.max(1, Math.round(words / WORDS_PER_MINUTE)),
    draft: data.draft === true,
  };
}

const visible = (p: PostMeta) => !p.draft || process.env.NODE_ENV === "development";

async function loadAll() {
  const files = (await readdir(BLOG_DIR).catch(() => [])).filter((f) => f.endsWith(".md"));
  const posts = await Promise.all(
    files.map(async (file) => {
      const slug = file.replace(/\.md$/, "");
      const { data, body } = splitFrontmatter(await readFile(join(BLOG_DIR, file), "utf8"));
      return { meta: toMeta(slug, data, body), body };
    }),
  );
  return posts.filter((p) => visible(p.meta)).sort((a, b) => b.meta.date.localeCompare(a.meta.date));
}

/** All published posts, newest first */
export async function getPosts(): Promise<PostMeta[]> {
  return (await loadAll()).map((p) => p.meta);
}

export async function getPost(slug: string): Promise<Post | null> {
  const found = (await loadAll()).find((p) => p.meta.slug === slug);
  if (!found) return null;
  const html = String(await markdown.process(found.body));
  // Table of contents from the rendered <h2 id="…"> tags, so ids always match the anchors
  const headings = [...html.matchAll(/<h2 id="([^"]+)">([\s\S]*?)<\/h2>/g)].map((m) => ({
    id: m[1],
    text: m[2].replace(/<[^>]+>/g, "").replace(/&#x26;/g, "&").replace(/&amp;/g, "&").trim(),
  }));
  return { ...found.meta, html, headings };
}

export const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
