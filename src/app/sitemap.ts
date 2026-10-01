import type { MetadataRoute } from "next";
import { site } from "@/data/profile";

// Project case-study pages get added here in Phase 4.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: site.url, lastModified: new Date(), changeFrequency: "monthly", priority: 1 }];
}
