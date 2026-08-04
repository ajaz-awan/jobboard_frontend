// src/app/jobs/[id]/page.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import apiFetch from "@/lib/api";
import { Job } from "@/types";
import Link from "next/link";

interface JobDetailResponse {
  success: boolean;
  job: Job;
}

interface ApplyResponse {
  success: boolean;
  message: string;
}

interface DeleteJobResponse {
  success: boolean;
  message: string;
}

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [job, setJob] = useState<Job | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState("");
  const [applySuccess, setApplySuccess] = useState(false);

  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;

    async function fetchJob() {
      setDataLoading(true);
      setError("");
      try {
        const data = await apiFetch<JobDetailResponse>(`/api/jobs/${id}`);
        setJob(data.job);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load job");
      } finally {
        setDataLoading(false);
      }
    }

    fetchJob();
  }, [user, id]);

  async function handleApply(e: FormEvent) {
    e.preventDefault();
    setApplyError("");

    if (!resumeFile) {
      setApplyError("Resume file is required");
      return;
    }

    setApplying(true);

    try {
      const formData = new FormData();
      formData.append("job_id", id);
      formData.append("resume", resumeFile);
      if (coverLetter) formData.append("cover_letter", coverLetter);

      await apiFetch<ApplyResponse>("/api/applications", {
        method: "POST",
        body: formData,
      });

      setApplySuccess(true);
    } catch (err) {
      setApplyError(err instanceof Error ? err.message : "Failed to apply");
    } finally {
      setApplying(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm("Kya aap sach mein is job ko delete karna chahte hain?");
    if (!confirmed) return;

    setDeleting(true);
    try {
      await apiFetch<DeleteJobResponse>(`/api/jobs/${id}`, { method: "DELETE" });
      router.push("/dashboard/my-jobs");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete job");
      setDeleting(false);
    }
  }

  if (authLoading || !user || dataLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-[var(--ink-muted)]">
        Loading...
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="bg-[var(--danger-bg)] text-[var(--danger)] text-sm px-4 py-3 rounded-md">
          {error || "Job not found"}
        </div>
      </div>
    );
  }

  const isOwner = user.role === "employer" && user.id === job.employer_id;

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="bg-[var(--paper-raised)] border border-[var(--line)] rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-2">
          <h1 className="font-display text-2xl font-bold text-[var(--ink)]">{job.title}</h1>
          <span
            className={`font-mono text-[10px] tracking-wide uppercase px-2 py-1 rounded-full ${
              job.status === "open"
                ? "bg-[var(--success-bg)] text-[var(--success)]"
                : "bg-[var(--line)] text-[var(--ink-muted)]"
            }`}
          >
            {job.status}
          </span>
        </div>
        <p className="text-sm text-[var(--ink-muted)] mb-4">
          {job.location} · {job.job_type}
        </p>
        {(job.salary_min || job.salary_max) && (
          <p className="font-mono text-sm text-[var(--ink)] mb-4">
            Rs. {job.salary_min ?? "—"} - Rs. {job.salary_max ?? "—"}
          </p>
        )}
        <p className="text-[var(--ink)] whitespace-pre-line leading-relaxed">{job.description}</p>
      </div>

      {isOwner && (
        <div className="bg-[var(--paper-raised)] border border-[var(--line)] rounded-lg p-6 mb-6 flex flex-wrap gap-3">
          <Link
            href={`/dashboard/jobs/${job.id}/applications`}
            className="bg-[var(--primary)] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors"
          >
            View Applicants
          </Link>
          <Link
            href={`/dashboard/jobs/${job.id}/edit`}
            className="bg-[var(--paper)] border border-[var(--line)] text-[var(--ink)] px-4 py-2 rounded-md text-sm font-medium hover:bg-[var(--line)] transition-colors"
          >
            Edit Job
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="bg-[var(--danger-bg)] text-[var(--danger)] px-4 py-2 rounded-md text-sm font-medium hover:opacity-80 disabled:opacity-50 transition-opacity"
          >
            {deleting ? "Deleting..." : "Delete Job"}
          </button>
        </div>
      )}

      {user.role === "candidate" && job.status === "open" && (
        <div className="bg-[var(--paper-raised)] border border-[var(--line)] rounded-lg p-6">
          <h2 className="font-display text-lg font-semibold text-[var(--ink)] mb-4">
            Apply for this job
          </h2>

          {applySuccess ? (
            <div className="bg-[var(--success-bg)] text-[var(--success)] text-sm px-4 py-3 rounded-md">
              Application submitted! Track it under &quot;My Applications&quot;.
            </div>
          ) : (
            <form onSubmit={handleApply} className="space-y-4">
              {applyError && (
                <div className="bg-[var(--danger-bg)] text-[var(--danger)] text-sm px-4 py-2 rounded-md">
                  {applyError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[var(--ink)] mb-1">
                  Resume (PDF/DOC/DOCX)
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
                  required
                  className="w-full border border-[var(--line)] rounded-md px-3 py-2 text-sm text-[var(--ink)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--ink)] mb-1">
                  Cover Letter (optional)
                </label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={4}
                  className="w-full border border-[var(--line)] rounded-md px-3 py-2 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  placeholder="Why are you a good fit for this role?"
                />
              </div>

              <button
                type="submit"
                disabled={applying}
                className="w-full bg-[var(--accent)] text-white py-2 rounded-md font-medium hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {applying ? "Submitting..." : "Submit Application"}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}