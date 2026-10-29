"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import apiFetch, { ApiError, errorMessage, json } from "@/lib/api";
import { Job, Report, User, Audit, PageData } from "@/types";
import {
  Workspace,
  PageHeading,
  Field,
  Alert,
  Badge,
  Spinner,
  Pagination,
  Empty,
  useResource,
  date,
} from "@/components/UI";
type Tab = "jobs" | "reports" | "users" | "audit-logs";
type Item = Job | Report | User | Audit;
interface AdminSummary {
  users: { _id: string; total: number; suspended: number }[];
  jobs: { _id: string; total: number }[];
  applications: number;
  open_reports: number;
}
export default function Admin() {
  return (
    <Workspace roles={["admin"]}>
      <Console />
    </Workspace>
  );
}
function Console() {
  const [tab, setTab] = useState<Tab>("jobs");
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("pending");
  const [review, setReview] = useState<{ item: Item; kind: Tab } | null>(null);
  const [revisionError, setRevisionError] = useState("");
  const summary = useResource<{ data: AdminSummary }>("/api/admin/dashboard");
  const param =
    tab === "jobs"
      ? "moderation_status"
      : tab === "users" || tab === "reports"
        ? "status"
        : "outcome";
  const list = useResource<PageData<Item>>(
    `/api/admin/${tab}?page=${page}&limit=10${filter ? `&${param}=${filter}` : ""}`,
  );
  const counts = summary.data?.data;
  return (
    <>
      <PageHeading
        eyebrow="TRUST & SAFETY"
        title="Good opportunities deserve a good community."
        description="Review carefully. Every administrative change is recorded in the audit log."
      />
      <Alert>{summary.error || revisionError}</Alert>
      <div className="metric-grid">
        <div className="metric">
          <span>Registered users</span>
          <strong>
            {counts ? counts.users.reduce((a, b) => a + b.total, 0) : "—"}
          </strong>
        </div>
        <div className="metric">
          <span>Pending listings</span>
          <strong>
            {counts?.jobs.find((j) => j._id === "pending")?.total ?? "—"}
          </strong>
        </div>
        <div className="metric">
          <span>Applications</span>
          <strong>{counts?.applications ?? "—"}</strong>
        </div>
        <div className="metric">
          <span>Open reports</span>
          <strong>{counts?.open_reports ?? "—"}</strong>
        </div>
      </div>
      <div className="tab-bar">
        {(["jobs", "reports", "users", "audit-logs"] as Tab[]).map((t) => (
          <button
            key={t}
            className={tab === t ? "active" : ""}
            onClick={() => {
              setTab(t);
              setPage(1);
              setFilter(
                t === "jobs" ? "pending" : t === "reports" ? "open" : "",
              );
            }}
          >
            {t.replace("-", " ")}
          </button>
        ))}
      </div>
      <div className="results-toolbar">
        <span>{list.data?.total ?? 0} records</span>
        <select
          aria-label="Filter records"
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All {tab.replace("-", " ")}</option>
          {(tab === "jobs"
            ? ["pending", "approved", "blocked"]
            : tab === "users"
              ? ["active", "suspended"]
              : tab === "reports"
                ? ["open", "resolved", "dismissed"]
                : ["attempted", "completed", "failed"]
          ).map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      <Alert>{list.error}</Alert>
      {list.error && (
        <button className="btn secondary" onClick={list.reload}>
          Reload records
        </button>
      )}
      {list.loading ? (
        <Spinner />
      ) : (
        !list.error &&
        (!list.data?.data.length ? (
          <Empty
            title="All clear here."
            description="No records match this filter."
          />
        ) : (
          <div className="list-panel">
            {list.data.data.map((item) => {
              if (tab === "jobs") {
                const j = item as Job;
                return (
                  <article key={j.id} className="admin-row">
                    <div>
                      <Link
                        className="job-title"
                        href={`/jobs/detail?id=${j.id}`}
                      >
                        {j.title}
                      </Link>
                      <p>
                        {j.location} · {j.work_mode} · {j.job_type}
                      </p>
                      <small>
                        Revision {j.revision} · {date(j.created_at)}
                      </small>
                    </div>
                    <Badge>{j.moderation_status || "approved"}</Badge>
                    <button
                      className="btn secondary small"
                      onClick={() => setReview({ item: j, kind: tab })}
                    >
                      Review listing
                    </button>
                  </article>
                );
              }
              if (tab === "reports") {
                const r = item as Report;
                return (
                  <article key={r.id} className="admin-row">
                    <div>
                      <h3>
                        {r.reason} · {r.jobs?.title || "Job report"}
                      </h3>
                      <p>{r.details || "No additional details."}</p>
                      <Link
                        className="text-link"
                        href={`/jobs/detail?id=${r.job_id}`}
                      >
                        View reported job →
                      </Link>
                      <small>{date(r.created_at)}</small>
                    </div>
                    <Badge>{r.status}</Badge>
                    {r.status === "open" && (
                      <button
                        className="btn secondary small"
                        onClick={() => setReview({ item: r, kind: tab })}
                      >
                        Review report
                      </button>
                    )}
                  </article>
                );
              }
              if (tab === "users") {
                const u = item as User;
                return (
                  <article key={u.id} className="admin-row">
                    <div>
                      <h3>{u.name}</h3>
                      <p>
                        {u.email} · {u.role}
                      </p>
                      <small>
                        {u.email_verified
                          ? "Email verified"
                          : "Email unverified"}
                      </small>
                    </div>
                    <Badge>{u.status || "active"}</Badge>
                    {u.role !== "admin" && (
                      <button
                        className="btn secondary small"
                        onClick={() => setReview({ item: u, kind: tab })}
                      >
                        Manage account
                      </button>
                    )}
                  </article>
                );
              }
              const a = item as Audit;
              return (
                <article className="audit-row" key={a.id}>
                  <div className="row-between">
                    <h3>{a.action.replaceAll("_", " ")}</h3>
                    <Badge>{a.outcome}</Badge>
                  </div>
                  <p>
                    Actor {a.actor_id} · Target {a.target_id}
                  </p>
                  <small>{date(a.created_at)}</small>
                  <details>
                    <summary>Action details</summary>
                    <pre>{JSON.stringify(a.details, null, 2)}</pre>
                  </details>
                </article>
              );
            })}
          </div>
        ))
      )}
      <Pagination
        page={page}
        totalPages={list.data?.totalPages || 0}
        onChange={setPage}
      />
      {review && (
        <Review
          key={review.item.id}
          review={review}
          onClose={() => setReview(null)}
          onDone={() => {
            setReview(null);
            list.reload();
            summary.reload();
          }}
          onStale={() => {
            setReview(null);
            list.reload();
            setRevisionError(
              "This job changed during review. Open its latest revision and review the content again.",
            );
          }}
        />
      )}
    </>
  );
}
function Review({
  review,
  onClose,
  onDone,
  onStale,
}: {
  review: { item: Item; kind: Tab };
  onClose: () => void;
  onDone: () => void;
  onStale: () => void;
}) {
  const job = review.item as Job;
  const isJob = review.kind === "jobs";
  const isReport = review.kind === "reports";
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState(
    isJob
      ? "approved"
      : isReport
        ? "resolved"
        : (review.item as User).status === "suspended"
          ? "active"
          : "suspended",
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [relogin, setRelogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, user } = useAuth();
  const reauth = async () => {
    setBusy(true);
    try {
      if (email.trim().toLowerCase() !== user?.email.toLowerCase())
        throw new Error("Reauthenticate using your current admin account.");
      await login(email.trim(), password);
      setRelogin(false);
      setPassword("");
      setError("");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="panel action-panel" aria-label="Administrative review">
      <div className="row-between">
        <h2>
          {isJob
            ? `Review: ${job.title}`
            : isReport
              ? "Review this report"
              : "Manage account access"}
        </h2>
        <button
          className="btn secondary small"
          disabled={busy}
          onClick={onClose}
        >
          Close review
        </button>
      </div>
      {isJob && (
        <div className="review-content">
          <p>
            <strong>
              {job.location} · {job.job_type} · {job.work_mode} ·{" "}
              {job.experience_level}
            </strong>
          </p>
          <p className="preserve-lines">{job.description}</p>
          <p>Skills: {job.skills?.join(", ") || "Not specified"}</p>
          <p>
            Salary: {job.salary_min ?? "—"} – {job.salary_max ?? "—"} PKR ·
            Deadline: {date(job.expires_at)}
          </p>
          <small>Reviewed revision: {job.revision}</small>
        </div>
      )}
      {isReport && (
        <p className="preserve-lines">{(review.item as Report).details}</p>
      )}
      <Alert>{error}</Alert>
      {relogin ? (
        <form
          className="form-stack"
          onSubmit={(e) => {
            e.preventDefault();
            void reauth();
          }}
        >
          <p>
            This action requires a login within the last 15 minutes.
            Reauthenticate, then submit your review again.
          </p>
          <Field label="Admin email">
            <input
              required
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field label="Password">
            <input
              required
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          <button disabled={busy} className="btn primary">
            Reauthenticate
          </button>
        </form>
      ) : (
        <form
          className="form-stack"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            try {
              const endpoint = isJob
                ? `/api/admin/jobs/${job.id}/moderation`
                : isReport
                  ? `/api/admin/reports/${review.item.id}`
                  : `/api/admin/users/${review.item.id}/status`;
              const body = isJob
                ? { status, reason: reason.trim(), revision: job.revision }
                : isReport
                  ? { status, note: reason.trim() }
                  : { status, reason: reason.trim() };
              await apiFetch(endpoint, json("PATCH", body));
              onDone();
            } catch (e) {
              if (e instanceof ApiError && e.status === 409 && isJob) onStale();
              else {
                setError(errorMessage(e));
                if (
                  e instanceof ApiError &&
                  e.status === 403 &&
                  /recent|login|log in|15 minute/i.test(e.message)
                ) {
                  setRelogin(true);
                  setEmail(user?.email || "");
                }
              }
            } finally {
              setBusy(false);
            }
          }}
        >
          <Field label="Decision">
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {(isJob
                ? ["approved", "blocked"]
                : isReport
                  ? ["resolved", "dismissed"]
                  : ["active", "suspended"]
              ).map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label={isReport ? "Review note" : "Reason"}>
            <textarea
              required
              rows={3}
              minLength={3}
              maxLength={isReport ? 1000 : 500}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </Field>
          {isReport && (
            <p className="muted">
              Resolving a report does not block the job. Review the listing
              separately if needed.
            </p>
          )}
          <label className="checkbox-label">
            <input key={status} type="checkbox" required />
            <span>I have reviewed the record and confirm this decision.</span>
          </label>
          <button disabled={busy} className="btn primary">
            {busy ? "Saving…" : "Save decision"}
          </button>
        </form>
      )}
    </section>
  );
}
