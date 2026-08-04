// src/app/dashboard/applications/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import apiFetch from "@/lib/api";
import { Application } from "@/types";
import Link from "next/link";

interface MyApplicationsResponse {
  success: boolean;
  count: number;
  data: Application[];
}

export default function MyApplicationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [applications, setApplications] = useState<Application[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!authLoading && user && user.role !== "candidate") {
      router.push("/jobs");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user || user.role !== "candidate") return;

    async function fetchApplications() {
      setDataLoading(true);
      setError("");
      try {
        const res = await apiFetch<MyApplicationsResponse>("/api/applications/my");
        setApplications(res.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load applications");
      } finally {
        setDataLoading(false);
      }
    }

    fetchApplications();
  }, [user]);

  if (authLoading || !user || dataLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-[var(--ink-muted)]">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="font-display text-2xl font-bold text-[var(--ink)] mb-6">My Applications</h1>

      {error && (
        <div className="bg-[var(--danger-bg)] text-[var(--danger)] text-sm px-4 py-2 rounded-md mb-4">
          {error}
        </div>
      )}

      {applications.length === 0 ? (
        <p className="text-[var(--ink-muted)]">
          You haven&apos;t applied to any jobs yet.{" "}
          <Link href="/jobs" className="text-[var(--primary)] hover:underline">
            Browse jobs
          </Link>
        </p>
      ) : (
        <div className="grid gap-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-[var(--paper-raised)] border border-[var(--line)] rounded-lg p-5"
            >
              <div className="flex justify-between items-start">
                <div>
                  <Link
                    href={`/jobs/${app.job_id}`}
                    className="font-display text-lg font-semibold text-[var(--ink)] hover:text-[var(--primary)] hover:underline"
                  >
                    {app.jobs?.title ?? "Job details unavailable"}
                  </Link>
                  <p className="text-sm text-[var(--ink-muted)] mt-1">
                    {app.jobs?.location} · {app.jobs?.job_type}
                  </p>
                </div>
                <span
                  className={`font-mono text-[10px] tracking-wide uppercase px-2 py-1 rounded-full ${
                    app.status === "pending"
                      ? "bg-[var(--warning-bg)] text-[var(--warning)]"
                      : app.status === "accepted"
                      ? "bg-[var(--success-bg)] text-[var(--success)]"
                      : "bg-[var(--danger-bg)] text-[var(--danger)]"
                  }`}
                >
                  {app.status}
                </span>
              </div>

              {app.cover_letter && (
                <p className="text-sm text-[var(--ink-muted)] mt-3 whitespace-pre-line">
                  {app.cover_letter}
                </p>
              )}
            <a>
              
                href={app.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[var(--primary)] hover:underline mt-3 inline-block"
              
                View Resume
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}