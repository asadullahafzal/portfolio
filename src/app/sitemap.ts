import type { MetadataRoute } from "next";
import { featuredProjects, site } from "@/data/profile";
import { getPosts } from "@/lib/blog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const posts = await getPosts();
  const latestPost = posts[0]?.updated ?? posts[0]?.date;
  return [
    { url: site.url, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${site.url}/blog`, lastModified: latestPost ? new Date(latestPost) : now, changeFrequency: "weekly", priority: 0.9 },
    ...posts.map((p) => ({
      url: `${site.url}/blog/${p.slug}`,
      lastModified: new Date(p.updated ?? p.date),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...featuredProjects.map((p) => ({
      url: `${site.url}/projects/${p.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
