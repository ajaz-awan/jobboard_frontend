import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/public-jobs";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/jobs", "/for-employers", "/about", "/privacy", "/terms"].map(path => ({ url: `${siteOrigin}${path}`, changeFrequency: path === "/jobs" ? "daily" : "monthly", priority: path === "" ? 1 : path === "/jobs" ? 0.9 : 0.5 }));
}
