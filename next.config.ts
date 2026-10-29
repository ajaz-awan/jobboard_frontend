import type { NextConfig } from "next";
const staticExport = process.env.SITES_STATIC_EXPORT === "1";
const apiOrigin = process.env.NEXT_PUBLIC_API_URL
  ? new URL(process.env.NEXT_PUBLIC_API_URL).origin
  : "";
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${process.env.NODE_ENV === "development" ? "'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${apiOrigin}`,
  "font-src 'self'",
  `connect-src 'self' ${apiOrigin} ${process.env.NODE_ENV === "development" ? "ws: http://localhost:5000" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");
const nextConfig: NextConfig = {
  // Avoid reusing a corrupt persistent compiler cache across local/export builds.
  experimental: { turbopackFileSystemCacheForBuild: false },
  ...(staticExport ? { output: "export" as const, trailingSlash: true } : {}),
  poweredByHeader: false,
  ...(staticExport
    ? {}
    : {
        async rewrites() {
          return [
            {
              source: "/api/:path*",
              destination: `${process.env.BACKEND_URL || "http://localhost:5000"}/api/:path*`,
            },
          ];
        },
        async headers() {
          return [
            {
              source: "/:path*",
              headers: [
                { key: "Content-Security-Policy", value: csp },
                { key: "X-Content-Type-Options", value: "nosniff" },
                { key: "Referrer-Policy", value: "no-referrer" },
                { key: "X-Frame-Options", value: "DENY" },
                {
                  key: "Permissions-Policy",
                  value: "camera=(), microphone=(), geolocation=()",
                },
              ],
            },
            ...["/dashboard/:path*", "/admin", "/login", "/register", "/verify-email", "/forgot-password", "/reset-password"].map(source => ({
              source, headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
            })),
          ];
        },
      }),
};
export default nextConfig;
