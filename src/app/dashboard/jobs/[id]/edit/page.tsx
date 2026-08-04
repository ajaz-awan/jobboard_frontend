// src/app/dashboard/jobs/[id]/edit/page.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import apiFetch from "@/lib/api";
import { Job } from "@/types";

interface JobDetailResponse {
  success: boolean;
  job: Job;
}

interface UpdateJobResponse {
  success: boolean;
  message: string;
  job: Job;
}

export default function EditJobPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("full-time");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [status, setStatus] = useState("open");

  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

    async function fetchJob() {
      setDataLoading(true);
      setError("");
      try {
        const data = await apiFetch<JobDetailResponse>(`/api/jobs/${id}`);

        if (data.job.employer_id !== user!.id) {
          router.push("/dashboard/my-jobs");
          return;
        }

        setTitle(data.job.title);
        setDescription(data.job.description);
        setLocation(data.job.location);
        setJobType(data.job.job_type);
        setSalaryMin(data.job.salary_min ? String(data.job.salary_min) : "");
        setSalaryMax(data.job.salary_max ? String(data.job.salary_max) : "");
        setStatus(data.job.status);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load job");
      } finally {
        setDataLoading(false);
      }
    }

    fetchJob();
  }, [user, id, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const body: Record<string, unknown> = {
        title,
        description,
        location,
        job_type: jobType,
        status,
      };
      if (salaryMin) body.salary_min = Number(salaryMin);
      if (salaryMax) body.salary_max = Number(salaryMax);

      await apiFetch<UpdateJobResponse>(`/api/jobs/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });

      router.push(`/jobs/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update job");
    } finally {
      setSubmitting(false);
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
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="font-display text-2xl font-bold text-[var(--ink)] mb-6">Edit Job</h1>

      {error && (
        <div className="bg-[var(--danger-bg)] text-[var(--danger)] text-sm px-4 py-2 rounded-md mb-4">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-[var(--paper-raised)] border border-[var(--line)] rounded-lg p-6"
      >
        <div>
          <label className="block text-sm font-medium text-[var(--ink)] mb-1">Job Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full border border-[var(--line)] rounded-md px-3 py-2 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--ink)] mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={5}
            className="w-full border border-[var(--line)] rounded-md px-3 py-2 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--ink)] mb-1">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            className="w-full border border-[var(--line)] rounded-md px-3 py-2 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--ink)] mb-1">Job Type</label>
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="w-full border border-[var(--line)] rounded-md px-3 py-2 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--ink)] mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-[var(--line)] rounded-md px-3 py-2 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--ink)] mb-1">Salary Min</label>
            <input
              type="number"
              value={salaryMin}
              onChange={(e) => setSalaryMin(e.target.value)}
              className="w-full border border-[var(--line)] rounded-md px-3 py-2 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--ink)] mb-1">Salary Max</label>
            <input
              type="number"
              value={salaryMax}
              onChange={(e) => setSalaryMax(e.target.value)}
              className="w-full border border-[var(--line)] rounded-md px-3 py-2 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[var(--accent)] text-white py-2 rounded-md font-medium hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}