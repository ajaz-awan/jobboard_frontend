import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/public-jobs";
export const dynamic = "force-static";
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/dashboard", "/admin", "/login", "/register", "/verify-email", "/reset-password", "/forgot-password"] }, sitemap: `${siteOrigin}/sitemap.xml` };
}
