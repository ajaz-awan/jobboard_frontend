import { Suspense } from "react";
import type { Metadata } from "next";
import { JobDetail as Page } from "@/features/Jobs";
import { publicJob } from "@/lib/public-jobs";
type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  if (process.env.SITES_STATIC_EXPORT === "1") return { title: "Job details", robots: { index: false } };
  const { id } = await searchParams;
  const job = typeof id === "string" ? await publicJob(id) : undefined;
  if (!job) return { title: "Job details", robots: { index: false, follow: true } };
  const description = job.description.replace(/\s+/g, " ").slice(0, 160);
  return { title: job.title, description, alternates: { canonical: `/jobs/detail?id=${job.id}` },
    openGraph: { title: job.title, description, url: `/jobs/detail?id=${job.id}`, type: "website" } };
}
export default async function Route({ searchParams }: Props) {
  const id = process.env.SITES_STATIC_EXPORT === "1" ? undefined : (await searchParams).id;
  const initialJob = typeof id === "string" ? await publicJob(id) : undefined;
  return <Suspense fallback={<div className="loading">Loading…</div>}><Page initialJob={initialJob} /></Suspense>;
}
