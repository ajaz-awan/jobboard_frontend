// src/app/jobs/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import apiFetch from "@/lib/api";
import { PaginatedJobs, Job } from "@/types";
import Link from "next/link";

export default function JobsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;

    async function fetchJobs() {
      setDataLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();
        if (title) params.append("title", title);
        if (location) params.append("location", location);
        if (jobType) params.append("job_type", jobType);
        params.append("page", String(page));
        params.append("limit", "10");

        const data = await apiFetch<PaginatedJobs>(`/api/jobs?${params.toString()}`);

        setJobs(data.jobs);
        setTotalPages(data.totalPages);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load jobs");
      } finally {
        setDataLoading(false);
      }
    }

    fetchJobs();
  }, [user, page, title, location, jobType]);

  if (authLoading || !user) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-[var(--ink-muted)]">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="font-display text-2xl font-bold text-[var(--ink)] mb-6">
        Browse Jobs
      </h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by title..."
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setPage(1);
          }}
          className="border border-[var(--line)] bg-[var(--paper-raised)] rounded-md px-3 py-2 text-sm flex-1 min-w-[180px] text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        />
        <input
          type="text"
          placeholder="Location..."
          value={location}
          onChange={(e) => {
            setLocation(e.target.value);
            setPage(1);
          }}
          className="border border-[var(--line)] bg-[var(--paper-raised)] rounded-md px-3 py-2 text-sm flex-1 min-w-[180px] text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        />
        <select
          value={jobType}
          onChange={(e) => {
            setJobType(e.target.value);
            setPage(1);
          }}
          className="border border-[var(--line)] bg-[var(--paper-raised)] rounded-md px-3 py-2 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        >
          <option value="">All Types</option>
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="contract">Contract</option>
          <option value="internship">Internship</option>
        </select>
      </div>

      {error && (
        <div className="bg-[var(--danger-bg)] text-[var(--danger)] text-sm px-4 py-2 rounded-md mb-4">
          {error}
        </div>
      )}

      {dataLoading ? (
        <p className="text-[var(--ink-muted)]">Loading jobs...</p>
      ) : jobs.length === 0 ? (
        <p className="text-[var(--ink-muted)]">No jobs found.</p>
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
                {(job.salary_min || job.salary_max) && (
                  <p className="font-mono text-xs text-[var(--ink-muted)] mt-2">
                    {job.salary_min && `Rs ${job.salary_min}`}
                    {job.salary_min && job.salary_max && " – "}
                    {job.salary_max && `Rs ${job.salary_max}`}
                  </p>
                )}
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

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm border border-[var(--line)] rounded-md text-[var(--ink)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--paper-raised)] transition-colors"
          >
            Previous
          </button>
          <span className="font-mono text-xs text-[var(--ink-muted)]">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 text-sm border border-[var(--line)] rounded-md text-[var(--ink)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--paper-raised)] transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}