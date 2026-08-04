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

export default function JobApplicationsPage() {
  const { id } = useParams<{ id: string }>(); // yeh actually job ki id hai (URL ka [id] part)
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [applications, setApplications] = useState<ApplicationWithCandidate[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");

  // login zaroori
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  // sirf employer yahan aa sakta hai
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
        const res = await apiFetch<JobApplicationsResponse>(
          `/api/applications/job/${id}`
        );
        setApplications(res.data);
      } catch (err) {
        // agar yeh employer is job ka owner nahi hai, backend 403 dega — wahi message yahan dikhega
        setError(err instanceof Error ? err.message : "Failed to load applications");
      } finally {
        setDataLoading(false);
      }
    }

    fetchApplications();
  }, [user, id]);

  if (authLoading || !user || user.role !== "employer" || dataLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Applicants</h1>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded">
          {error}
        </div>
      )}

      {!error && applications.length === 0 ? (
        <p className="text-gray-500">No applications yet for this job.</p>
      ) : (
        <div className="grid gap-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-white border border-gray-200 rounded-lg p-5"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {app.users.name}
                  </h2>
                  <p className="text-sm text-gray-500">{app.users.email}</p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    app.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : app.status === "accepted"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {app.status}
                </span>
              </div>

              {app.cover_letter && (
                <p className="text-sm text-gray-600 mt-3 whitespace-pre-line">
                  {app.cover_letter}
                </p>
              )}
            <a>
              
                href={app.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline mt-3 inline-block"
              
                View Resume
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}