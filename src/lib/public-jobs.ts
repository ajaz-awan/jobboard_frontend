import { cache } from "react";
import type { Job, PaginatedJobs } from "@/types";
export const siteOrigin = new URL(process.env.SITE_URL || "http://localhost:3000").origin;
const apiOrigin = (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
async function readPublic<T>(path: string): Promise<T | undefined> {
  // Server-only public requests never forward cookies or access tokens.
  if (process.env.SITES_STATIC_EXPORT === "1") return;
  try {
    const response = await fetch(`${apiOrigin}${path}`, { cache: "no-store", signal: AbortSignal.timeout(5000) });
    if (!response.ok) return;
    return await response.json() as T;
  } catch { return; }
}
export const publicJob = cache(async (id: string): Promise<Job | undefined> => {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) return;
  return (await readPublic<{ job: Job }>(`/api/jobs/${id}`))?.job;
});
export function publicJobs(search: Record<string, string | string[] | undefined> = {}) {
  const params = new URLSearchParams({ page: "1", limit: "9", sort: "newest" });
  for (const name of ["q", "location", "work_mode"]) {
    const value = search[name];
    if (typeof value === "string" && value.trim()) params.set(name, value.trim());
  }
  return readPublic<PaginatedJobs>(`/api/jobs?${params}`);
}
