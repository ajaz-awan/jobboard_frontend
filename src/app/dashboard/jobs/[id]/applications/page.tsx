// src/app/dashboard/jobs/[id]/applications/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import apiFetch from "@/lib/api";
import { ApplicationWithCandidate } from "@/types";

interface JobApplicationsResponse {
  success: boolean;
  count: number;
  data: ApplicationWithCandidate[];
}

interface UpdateStatusResponse {
  success: boolean;
  message: string;
}

export default function JobApplicationsPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [applications, setApplications] = useState<ApplicationWithCandidate[]>([]);
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

    async function fetchApplications() {
      setDataLoading(true);
      setError("");
      try {
        const res = await apiFetch<JobApplicationsResponse>(`/api/applications/job/${id}`);
        setApplications(res.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load applications");
      } finally {
        setDataLoading(false);
      }
    }

    fetchApplications();
  }, [user, id]);

  async function handleStatusChange(applicationId: string, newStatus: string) {
    try {
      await apiFetch<UpdateStatusResponse>(`/api/applications/${applicationId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      setApplications((prev) =>
        prev.map((app) => (app.id === applicationId ? { ...app, status: newStatus } : app))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    }
  }

  if (authLoading || !user || user.role !== "employer" || dataLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-[var(--ink-muted)]">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="font-display text-2xl font-bold text-[var(--ink)] mb-6">Applicants</h1>

      {error && (
        <div className="bg-[var(--danger-bg)] text-[var(--danger)] text-sm px-4 py-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {!error && applications.length === 0 ? (
        <p className="text-[var(--ink-muted)]">No applications yet for this job.</p>
      ) : (
        <div className="grid gap-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-[var(--paper-raised)] border border-[var(--line)] rounded-lg p-5"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-display text-lg font-semibold text-[var(--ink)]">
                    {app.users.name}
                  </h2>
                  <p className="text-sm text-[var(--ink-muted)]">{app.users.email}</p>
                </div>

                <select
                  value={app.status}
                  onChange={(e) => handleStatusChange(app.id, e.target.value)}
                  className={`font-mono text-[10px] tracking-wide uppercase px-2 py-1 rounded-full border-0 cursor-pointer ${
                    app.status === "pending"
                      ? "bg-[var(--warning-bg)] text-[var(--warning)]"
                      : app.status === "accepted"
                      ? "bg-[var(--success-bg)] text-[var(--success)]"
                      : "bg-[var(--danger-bg)] text-[var(--danger)]"
                  }`}
                >
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
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