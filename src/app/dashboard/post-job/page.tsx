// src/app/dashboard/post-job/page.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import apiFetch from "@/lib/api";
import { Job } from "@/types";

interface CreateJobResponse {
  success: boolean;
  job: Job;
}

export default function PostJobPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("full-time");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");

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
      };
      if (salaryMin) body.salary_min = Number(salaryMin);
      if (salaryMax) body.salary_max = Number(salaryMax);

      const data = await apiFetch<CreateJobResponse>("/api/jobs", {
        method: "POST",
        body: JSON.stringify(body),
      });

      router.push(`/jobs/${data.job.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create job");
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading || !user || user.role !== "employer") {
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-[var(--ink-muted)]">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="font-display text-2xl font-bold text-[var(--ink)] mb-6">Post a New Job</h1>

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
            placeholder="e.g. Frontend Developer"
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
            placeholder="Role responsibilities, requirements, etc."
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
            placeholder="e.g. Faisalabad, Pakistan"
          />
        </div>

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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--ink)] mb-1">
              Salary Min (optional)
            </label>
            <input
              type="number"
              value={salaryMin}
              onChange={(e) => setSalaryMin(e.target.value)}
              className="w-full border border-[var(--line)] rounded-md px-3 py-2 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              placeholder="30000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--ink)] mb-1">
              Salary Max (optional)
            </label>
            <input
              type="number"
              value={salaryMax}
              onChange={(e) => setSalaryMax(e.target.value)}
              className="w-full border border-[var(--line)] rounded-md px-3 py-2 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              placeholder="60000"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[var(--accent)] text-white py-2 rounded-md font-medium hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? "Posting..." : "Post Job"}
        </button>
      </form>
    </div>
  );
}