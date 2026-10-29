export type Role = "candidate" | "employer" | "admin";
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  company_name?: string | null;
  logo_url?: string | null;
  email_verified: boolean;
  status?: string;
  created_at: string;
}
export interface Job {
  id: string;
  employer_id: string;
  title: string;
  description: string;
  location?: string | null;
  job_type: string;
  salary_min: number | null;
  salary_max: number | null;
  status: "open" | "closed";
  work_mode?: string;
  experience_level?: string;
  skills?: string[];
  moderation_status?: string;
  revision: number;
  expires_at?: string | null;
  created_at: string;
}
export interface Application {
  id: string;
  job_id: string;
  candidate_id: string;
  cover_letter?: string | null;
  status: string;
  created_at: string;
  jobs?: Job | null;
  users?: { name: string; email: string } | null;
}
export interface PageData<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  count: number;
}
export interface PaginatedJobs {
  success: boolean;
  jobs: Job[];
  total: number;
  page: number;
  totalPages: number;
  count: number;
}
export interface SavedJob {
  id: string;
  job_id: string;
  jobs: Job | null;
}
export interface Notice {
  id: string;
  title: string;
  message: string;
  read_at: string | null;
  created_at: string;
  resource_type?: string;
  resource_id?: string;
}
export interface Report {
  id: string;
  job_id: string;
  reason: string;
  details: string;
  status: string;
  created_at: string;
  jobs?: Job | null;
}
export interface Session {
  id: string;
  current: boolean;
  user_agent: string;
  created_at: string;
  last_used_at: string;
  expires_at: string;
}
export interface Audit {
  id: string;
  action: string;
  actor_id: string;
  target_id: string;
  outcome: string;
  created_at: string;
  details: Record<string, unknown>;
}
