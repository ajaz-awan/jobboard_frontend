// src/types/index.ts

// backend ke "users" table se match — password_hash kabhi frontend pe nahi aata
export interface User {
  id: string; // O(1) — UUID string
  name: string;
  email: string;
  role: "candidate" | "employer" | "admin"; // backend ke enum se match
  company_name: string | null; // sirf employer ke paas hota hai
  logo_url: string | null;
  created_at: string;
}

// backend ke "jobs" table se match
export interface Job {
  id: string;
  employer_id: string;
  title: string;
  description: string;
  location: string;
  job_type: string; // default "full-time" backend se aata hai
  salary_min: number | null;
  salary_max: number | null;
  status: "open" | "closed";
  created_at: string;
}

// backend ke "applications" table se match
export interface Application {
  id: string;
  job_id: string;
  candidate_id: string;
  resume_url: string;
  cover_letter: string | null;
  status: string; // default "pending"
  created_at: string;
  jobs?: Job; // nested select jab /applications/my call hoti hai
}

// backend ka paginated response format (Day 8 mein banaya tha)
export interface PaginatedJobs {
  success: boolean;
  count: number;
  total: number;
  page: number;
  totalPages: number;
  jobs: Job[]; // "data" nahi — "jobs" hai backend response mein
}

// backend ka error response format (errorHandler.js se match)
export interface ApiErrorResponse {
  status: string;
  message: string;
  errors?: { path: string; message: string }[]; // Zod field-wise errors
}

export interface ApplicationWithCandidate {
  id: string;
  candidate_id: string;
  resume_url: string;
  cover_letter: string | null;
  status: string;
  created_at: string;
  users: {
    name: string;
    email: string;
  };
}