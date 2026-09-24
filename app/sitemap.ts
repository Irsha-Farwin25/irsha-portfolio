import type { MetadataRoute } from "next";
import { site } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: site.url, changeFrequency: "monthly", priority: 1 },
    { url: `${site.url}/projects`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${site.url}/research`, changeFrequency: "monthly", priority: 0.7 },
  ];

  // Case-study pages (/projects/[slug]) are built but intentionally unlinked for now —
  // restore their sitemap entries (filter projects by `caseStudy`) when they go live.
  return staticRoutes;
}
