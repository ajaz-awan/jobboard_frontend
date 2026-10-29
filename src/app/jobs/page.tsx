import { Suspense } from "react";
import type { Metadata } from "next";
import Page from "@/features/Jobs";
import { publicJobs } from "@/lib/public-jobs";
export const metadata: Metadata = {
  title: "Find jobs", description: "Browse approved opportunities by role, location, work style and salary. Sign in when you are ready to apply.",
  alternates: { canonical: "/jobs" },
};
export default async function Route({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const initialData = process.env.SITES_STATIC_EXPORT === "1" ? undefined : await publicJobs(await searchParams);
  return <Suspense fallback={<div className="loading">Loading…</div>}><Page initialData={initialData} /></Suspense>;
}
