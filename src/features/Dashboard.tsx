"use client";
import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import apiFetch, { downloadResume, errorMessage, json } from "@/lib/api";
import {
  Application,
  Job,
  Notice,
  Report,
  PageData,
  PaginatedJobs,
} from "@/types";
import {
  Workspace,
  PageHeading,
  Alert,
  Spinner,
  Empty,
  Pagination,
  Badge,
  Confirm,
  useResource,
  date,
  salary,
} from "@/components/UI";
import Icon from "@/components/Icon";
interface Summary {
  role: string;
  applications: { _id: string; total: number }[];
  saved_jobs?: number;
  jobs?: {
    _id: { status: string; moderation_status: string };
    total: number;
  }[];
  unread_notifications: number;
}
export default function Dashboard() {
  return (
    <Workspace>
      <Overview />
    </Workspace>
  );
}
function Overview() {
  const { user } = useAuth();
  const admin = user?.role === "admin";
  const { data, error, loading, reload } = useResource<{ data: Summary }>(
    admin ? null : "/api/dashboard",
  );
  if (admin)
    return (
      <>
        <PageHeading
          eyebrow="TRUST & SAFETY"
          title="Keep good opportunities moving."
          description="Review listings, reports, and account activity."
        />
        <Link href="/admin" className="btn primary">
          Open administration <Icon name="arrow" size={18} />
        </Link>
      </>
    );
  const summary = data?.data;
  const candidate = user?.role === "candidate";
  const total = summary?.applications.reduce((a, b) => a + b.total, 0) || 0;
  const pending =
    summary?.applications.find((x) => x._id === "pending")?.total || 0;
  const metrics = candidate
    ? [
        ["Applications sent", total, "bag"],
        ["In review", pending, "clock"],
        ["Saved opportunities", summary?.saved_jobs || 0, "bookmark"],
        ["Unread updates", summary?.unread_notifications || 0, "bell"],
      ]
    : [
        [
          "Your job listings",
          summary?.jobs?.reduce((a, b) => a + b.total, 0) || 0,
          "bag",
        ],
        ["Applications received", total, "user"],
        ["Awaiting a decision", pending, "clock"],
        ["Unread updates", summary?.unread_notifications || 0, "bell"],
      ];
  return (
    <>
      <PageHeading
        eyebrow="YOUR WORKSPACE"
        title={`Your next era, ${user?.name.split(" ")[0]}.`}
        description={
          candidate
            ? "Every small step brings your next chapter closer."
            : "Your next great team starts here."
        }
        action={
          <Link
            className="btn primary"
            href={candidate ? "/jobs" : "/dashboard/post-job"}
          >
            {candidate ? "Discover opportunities" : "Post an opportunity"}
            <Icon name={candidate ? "arrow" : "plus"} size={17} />
          </Link>
        }
      />
      <Alert>{error}</Alert>
      {error && (
        <button className="btn secondary" onClick={reload}>
          Reload overview
        </button>
      )}
      {loading ? (
        <Spinner />
      ) : (
        !error && (
          <div className="metric-grid">
            {metrics.map(([label, value, icon]) => (
              <div className="metric" key={String(label)}>
                <span>
                  {label}
                  <Icon name={String(icon)} />
                </span>
                <strong>{value}</strong>
                <small>Your workspace, at a glance</small>
              </div>
            ))}
          </div>
        )
      )}
      <section className="dashboard-banner">
        <div>
          <div className="eyebrow">A FRESH PERSPECTIVE</div>
          <h2>
            {candidate ? "Your skills." : "The right people make"}
            <br />
            <span className="serif">
              {candidate ? "Your next big thing." : "all the difference."}
            </span>
          </h2>
          <p>
            {candidate
              ? "A new role could be the beginning of something good."
              : "Write a thoughtful listing and give your next teammate a reason to join."}
          </p>
          <Link
            href={candidate ? "/jobs" : "/dashboard/post-job"}
            className="text-link"
          >
            {candidate ? "Find your next move" : "Create your listing"}
            <Icon name="arrow" size={18} />
          </Link>
        </div>
        <span aria-hidden="true">✳</span>
      </section>
      <div className="dashboard-columns">
        <section className="panel">
          <h2>Your application journey</h2>
          <p>A clear view of where things stand.</p>
          {!summary?.applications.length ? (
            <p className="muted">Your application activity will appear here.</p>
          ) : (
            summary.applications.map((a) => (
              <div key={a._id} className="summary-row">
                <Badge>{a._id}</Badge>
                <strong>{a.total}</strong>
              </div>
            ))
          )}
          <Link
            className="text-link"
            href={candidate ? "/dashboard/applications" : "/dashboard/my-jobs"}
          >
            View details <Icon name="arrow" size={17} />
          </Link>
        </section>
        <section className="panel next-steps">
          <h2>Make yourself at home.</h2>
          <Link href="/dashboard/settings">
            <Icon name="user" />
            <div>
              <strong>Keep your profile up to date</strong>
              <small>Make a good first introduction.</small>
            </div>
            <Icon name="arrow" size={17} />
          </Link>
          <Link href="/dashboard/notifications">
            <Icon name="bell" />
            <div>
              <strong>Keep the conversation moving</strong>
              <small>Check your latest application updates.</small>
            </div>
            <Icon name="arrow" size={17} />
          </Link>
        </section>
      </div>
    </>
  );
}
export function ApplicationsPage({ employer = false }: { employer?: boolean }) {
  return (
    <Workspace roles={[employer ? "employer" : "candidate"]}>
      <Applications employer={employer} />
    </Workspace>
  );
}
function Applications({ employer }: { employer: boolean }) {
  const params = useSearchParams();
  const jobId = params.get("id");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [download, setDownload] = useState("");
  const [confirm, setConfirm] = useState<{ id: string; status: string } | null>(
    null,
  );
  const path = employer
    ? jobId
      ? `/api/applications/job/${encodeURIComponent(jobId)}`
      : null
    : "/api/applications/my";
  const resource = useResource<PageData<Application>>(
    path
      ? `${path}?page=${page}&limit=10${status ? `&status=${status}` : ""}`
      : null,
  );
  return (
    <>
      <PageHeading
        eyebrow={employer ? "YOUR HIRING PIPELINE" : "YOUR PROGRESS"}
        title={
          employer
            ? "Good people. New possibilities."
            : "Every application is a step forward."
        }
        description={
          employer
            ? "Review applications and choose your next teammate. Final decisions cannot be changed."
            : "Follow your applications from your first introduction to the next step."
        }
      />
      {employer && (
        <Link href="/dashboard/my-jobs" className="back-link">
          ← Back to your listings
        </Link>
      )}
      <div className="results-toolbar">
        <span>{resource.data?.total || 0} applications</span>
        <select
          aria-label="Filter application status"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          {["pending", "accepted", "rejected", "withdrawn"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      <Alert>{error || resource.error}</Alert>
      {employer && !jobId ? (
        <Empty
          title="Choose a listing first"
          description="Open your listings and select View applicants."
          href="/dashboard/my-jobs"
          label="View your jobs"
        />
      ) : resource.loading ? (
        <Spinner />
      ) : (
        !resource.error &&
        (!resource.data?.data.length ? (
          <Empty
            title="Nothing here just yet."
            description={
              employer
                ? "Applications for this listing will appear here."
                : "Your next opportunity is waiting. Send your first application."
            }
            href={employer ? undefined : "/jobs"}
          />
        ) : (
          <div className="list-panel">
            {resource.data.data.map((a) => (
              <article key={a.id} className="application-row">
                <div className="application-identity">
                  <span className="avatar">
                    {(employer ? a.users?.name : a.jobs?.title)?.[0] || "A"}
                  </span>
                  <div>
                    <h3>
                      {employer
                        ? a.users?.name || "Candidate"
                        : a.jobs?.title || "Listing unavailable"}
                    </h3>
                    <p>
                      {employer
                        ? a.users?.email
                        : a.jobs?.location || "Application history"}
                    </p>
                    <small>Applied {date(a.created_at)}</small>
                  </div>
                </div>
                <div className="application-actions">
                  <Badge>{a.status}</Badge>
                  <button
                    disabled={download === a.id}
                    className="text-link"
                    onClick={async () => {
                      setDownload(a.id);
                      setError("");
                      try {
                        await downloadResume(a.id);
                      } catch (e) {
                        setError(errorMessage(e));
                      } finally {
                        setDownload("");
                      }
                    }}
                  >
                    <Icon name="download" size={16} />
                    {download === a.id ? "Downloading…" : "Resume"}
                  </button>
                  {a.status === "pending" &&
                    (employer ? (
                      <>
                        <button
                          className="btn primary small"
                          onClick={() =>
                            setConfirm({ id: a.id, status: "accepted" })
                          }
                        >
                          Accept
                        </button>
                        <button
                          className="btn secondary small"
                          onClick={() =>
                            setConfirm({ id: a.id, status: "rejected" })
                          }
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <button
                        className="text-link muted"
                        onClick={() =>
                          setConfirm({ id: a.id, status: "withdrawn" })
                        }
                      >
                        Withdraw
                      </button>
                    ))}
                </div>
                {a.cover_letter && (
                  <details className="cover-letter">
                    <summary>Read cover letter</summary>
                    <p className="preserve-lines">{a.cover_letter}</p>
                  </details>
                )}
              </article>
            ))}
          </div>
        ))
      )}
      <Pagination
        page={page}
        totalPages={resource.data?.totalPages || 0}
        onChange={setPage}
      />
      {confirm && (
        <Confirm
          title={
            confirm.status === "withdrawn"
              ? "Withdraw this application?"
              : `${confirm.status === "accepted" ? "Accept" : "Reject"} this candidate?`
          }
          description={
            confirm.status === "withdrawn"
              ? "You cannot reapply to the same listing after withdrawing."
              : "This is a final decision and cannot be reversed. The candidate will receive an update."
          }
          danger={confirm.status !== "accepted"}
          onClose={() => setConfirm(null)}
          onConfirm={async () => {
            await apiFetch(
              `/api/applications/${confirm.id}/${employer ? "status" : "withdraw"}`,
              json("PATCH", employer ? { status: confirm.status } : {}),
            );
            resource.reload();
          }}
        />
      )}
    </>
  );
}
export function MyJobsPage() {
  return (
    <Workspace roles={["employer"]}>
      <MyJobs />
    </Workspace>
  );
}
function MyJobs() {
  const [page, setPage] = useState(1);
  const { data, error, loading, reload } = useResource<PaginatedJobs>(
    `/api/jobs/mine?page=${page}&limit=10`,
  );
  const [confirm, setConfirm] = useState<{ job: Job; action: string } | null>(
    null,
  );
  return (
    <>
      <PageHeading
        eyebrow="YOUR OPPORTUNITIES"
        title="Great teams start with an invitation."
        description="Manage your listings and meet the people behind each application."
        action={
          <Link href="/dashboard/post-job" className="btn primary">
            <Icon name="plus" size={18} />
            Post a job
          </Link>
        }
      />
      <Alert>{error}</Alert>
      {loading ? (
        <Spinner />
      ) : (
        !error &&
        (!data?.jobs.length ? (
          <Empty
            title="Let’s find your next teammate."
            description="Publish your first opportunity. New and edited listings are reviewed before they go live."
            href="/dashboard/post-job"
            label="Create a listing"
          />
        ) : (
          <div className="list-panel">
            {data.jobs.map((j) => (
              <article className="employer-row" key={j.id}>
                <div>
                  <div className="row-inline">
                    <Badge>{j.status}</Badge>
                    <Badge>{j.moderation_status || "approved"}</Badge>
                  </div>
                  <Link className="job-title" href={`/jobs/detail?id=${j.id}`}>
                    {j.title}
                  </Link>
                  <p>
                    {j.location || "Location not specified"} · {j.job_type} ·{" "}
                    {salary(j.salary_min, j.salary_max)}
                  </p>
                  <small>
                    Posted {date(j.created_at)}
                    {j.expires_at ? ` · Deadline ${date(j.expires_at)}` : ""}
                  </small>
                </div>
                <div className="actions">
                  <Link
                    className="btn primary small"
                    href={`/dashboard/applicants?id=${j.id}`}
                  >
                    View applicants
                  </Link>
                  <Link
                    className="btn secondary small"
                    href={`/dashboard/edit-job?id=${j.id}`}
                  >
                    Edit
                  </Link>
                  <button
                    className="text-link"
                    onClick={() =>
                      setConfirm({
                        job: j,
                        action: j.status === "open" ? "closed" : "open",
                      })
                    }
                  >
                    {j.status === "open" ? "Close" : "Reopen"}
                  </button>
                  <button
                    className="text-link danger-text"
                    onClick={() => setConfirm({ job: j, action: "delete" })}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        ))
      )}
      <Pagination
        page={page}
        totalPages={data?.totalPages || 0}
        onChange={setPage}
      />
      {confirm && (
        <Confirm
          title={
            confirm.action === "delete"
              ? "Delete this listing?"
              : `${confirm.action === "closed" ? "Close" : "Reopen"} this listing?`
          }
          description={
            confirm.action === "delete"
              ? "This removes the listing. Existing application history is preserved."
              : confirm.action === "closed"
                ? "Candidates will no longer be able to apply."
                : "The listing must have a future deadline and admin approval to appear in search."
          }
          danger={confirm.action === "delete"}
          onClose={() => setConfirm(null)}
          onConfirm={async () => {
            await apiFetch(
              `/api/jobs/${confirm.job.id}`,
              confirm.action === "delete"
                ? { method: "DELETE" }
                : json("PATCH", { status: confirm.action }),
            );
            reload();
          }}
        />
      )}
    </>
  );
}
export function NotificationsPage() {
  return (
    <Workspace>
      <Notifications />
    </Workspace>
  );
}
function Notifications() {
  const [page, setPage] = useState(1);
  const [read, setRead] = useState("all");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const {
    data,
    error: loadError,
    loading,
    reload,
  } = useResource<PageData<Notice>>(
    `/api/notifications?page=${page}&limit=10&read=${read}`,
  );
  async function mark(path: string, id: string) {
    setBusy(id);
    setError("");
    try {
      await apiFetch(path, json("PATCH"));
      reload();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy("");
    }
  }
  return (
    <>
      <PageHeading
        eyebrow="STAY IN THE LOOP"
        title="A little news. A little momentum."
        description="Your application, listing, and account updates, in one place."
        action={
          <button
            className="btn secondary"
            disabled={!!busy}
            onClick={() => mark("/api/notifications/read-all", "all")}
          >
            Mark all as read
          </button>
        }
      />
      <div className="tab-bar">
        {["all", "unread"].map((t) => (
          <button
            className={read === t ? "active" : ""}
            key={t}
            onClick={() => {
              setRead(t);
              setPage(1);
            }}
          >
            {t === "all" ? "All updates" : "Unread"}
          </button>
        ))}
      </div>
      <Alert>{error || loadError}</Alert>
      {loading ? (
        <Spinner />
      ) : (
        !loadError &&
        (!data?.data.length ? (
          <Empty
            title="You’re all caught up."
            description="Your next update will be right here."
          />
        ) : (
          <div className="list-panel">
            {data.data.map((n) => (
              <article
                key={n.id}
                className={`notification-row ${!n.read_at ? "unread" : ""}`}
              >
                <span className="notification-icon">
                  <Icon name="bell" />
                </span>
                <div>
                  <h3>{n.title}</h3>
                  <p>{n.message}</p>
                  <small>{date(n.created_at)}</small>
                </div>
                {!n.read_at && (
                  <button
                    disabled={!!busy}
                    className="text-link"
                    onClick={() =>
                      mark(`/api/notifications/${n.id}/read`, n.id)
                    }
                  >
                    {busy === n.id ? "Updating…" : "Mark read"}
                  </button>
                )}
              </article>
            ))}
          </div>
        ))
      )}
      <Pagination
        page={page}
        totalPages={data?.totalPages || 0}
        onChange={setPage}
      />
    </>
  );
}
export function ReportsPage() {
  return (
    <Workspace roles={["candidate"]}>
      <Reports />
    </Workspace>
  );
}
function Reports() {
  const [page, setPage] = useState(1);
  const { data, error, loading } = useResource<PageData<Report>>(
    `/api/reports/my?page=${page}&limit=10`,
  );
  return (
    <>
      <PageHeading
        eyebrow="A BETTER COMMUNITY"
        title="Your voice helps keep this place safe."
        description="Follow the reports you’ve submitted about job listings."
      />
      <Alert>{error}</Alert>
      {loading ? (
        <Spinner />
      ) : (
        !error &&
        (!data?.data.length ? (
          <Empty
            title="No reports submitted."
            description="If a listing looks suspicious, use Report this listing on its detail page."
          />
        ) : (
          <div className="list-panel">
            {data.data.map((r) => (
              <article className="report-row" key={r.id}>
                <div>
                  <h3>{r.reason}</h3>
                  <p className="preserve-lines">
                    {r.details || "No additional details provided."}
                  </p>
                  <small>
                    Submitted {date(r.created_at)} · Listing {r.job_id}
                  </small>
                </div>
                <Badge>{r.status}</Badge>
              </article>
            ))}
          </div>
        ))
      )}
      <Pagination
        page={page}
        totalPages={data?.totalPages || 0}
        onChange={setPage}
      />
    </>
  );
}
