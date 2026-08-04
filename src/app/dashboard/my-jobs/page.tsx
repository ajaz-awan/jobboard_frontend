// src/app/dashboard/my-jobs/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import apiFetch from "@/lib/api";
import { PaginatedJobs, Job } from "@/types";
import Link from "next/link";

export default function MyJobsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!authLoading && user && user.role !== "employer") {
      router.push("/jobs");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user || user.role !== "employer") return;

    async function fetchMyJobs() {
      setDataLoading(true);
      setError("");
      try {
        const data = await apiFetch<PaginatedJobs>("/api/jobs?limit=50");
        const myJobs = data.jobs.filter((job) => job.employer_id === user!.id);
        setJobs(myJobs);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load jobs");
      } finally {
        setDataLoading(false);
      }
    }

    fetchMyJobs();
  }, [user]);

  if (authLoading || !user || user.role !== "employer" || dataLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-[var(--ink-muted)]">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-2xl font-bold text-[var(--ink)]">My Posted Jobs</h1>
        <Link
          href="/dashboard/post-job"
          className="bg-[var(--primary)] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors"
        >
          + Post New Job
        </Link>
      </div>

      {error && (
        <div className="bg-[var(--danger-bg)] text-[var(--danger)] text-sm px-4 py-2 rounded-md mb-4">
          {error}
        </div>
      )}

      {jobs.length === 0 ? (
        <p className="text-[var(--ink-muted)]">You haven&apos;t posted any jobs yet.</p>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={`/jobs/${job.id}`}
              className="ticket-card flex flex-col md:flex-row hover:shadow-md transition-shadow"
            >
              <div className="flex-1 p-5">
                <h2 className="font-display text-lg font-semibold text-[var(--ink)]">
                  {job.title}
                </h2>
                <p className="text-sm text-[var(--ink-muted)] mt-1">{job.location}</p>
              </div>
              <div className="ticket-stub w-full md:w-36 flex flex-row md:flex-col items-center justify-between md:justify-center gap-2 p-4 bg-[var(--paper)]">
                <span
                  className={`font-mono text-[10px] tracking-wide uppercase px-2 py-1 rounded-full ${
                    job.status === "open"
                      ? "bg-[var(--success-bg)] text-[var(--success)]"
                      : "bg-[var(--line)] text-[var(--ink-muted)]"
                  }`}
                >
                  {job.status}
                </span>
                <span className="font-mono text-[10px] tracking-wide uppercase text-[var(--ink-muted)]">
                  {job.job_type}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}