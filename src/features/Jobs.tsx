"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import apiFetch, { errorMessage, json } from "@/lib/api";
import { Job, PaginatedJobs, PageData, SavedJob } from "@/types";
import {
  Workspace,
  PageHeading,
  Field,
  Alert,
  Spinner,
  Empty,
  Pagination,
  Badge,
  useResource,
  salary,
  date,
} from "@/components/UI";
import Icon from "@/components/Icon";
export function JobCard({ job, extra }: { job: Job; extra?: React.ReactNode }) {
  return (
    <article className="job-card">
      <div className="job-card-main">
        <div className="job-emblem">
          {job.title?.[0] || "J"}
          <span>↗</span>
        </div>
        <div className="job-card-content">
          <div className="row-between">
            <span className="job-category">
              {job.work_mode || "Opportunity"}{" "}
              {job.experience_level && job.experience_level !== "any"
                ? `· ${job.experience_level} level`
                : ""}
            </span>
            {job.moderation_status && <Badge>{job.moderation_status}</Badge>}
          </div>
          <Link className="job-title" href={`/jobs/detail?id=${job.id}`}>
            {job.title}
          </Link>
          <div className="job-meta">
            <span>
              <Icon name="pin" size={14} />
              {job.location || "Location not specified"}
            </span>
            <span>
              <Icon name="clock" size={14} />
              {job.job_type}
            </span>
          </div>
        </div>
      </div>
      <div className="job-card-footer">
        <div className="tag-list">
          {(job.skills || []).slice(0, 3).map((s) => (
            <span key={s}>{s}</span>
          ))}
        </div>
        <strong>{salary(job.salary_min, job.salary_max)}</strong>
        {extra || (
          <Link
            aria-label={`View ${job.title}`}
            href={`/jobs/detail?id=${job.id}`}
            className="icon-btn"
          >
            <Icon name="arrow" />
          </Link>
        )}
      </div>
    </article>
  );
}
export default function JobsPage({ initialData }: { initialData?: PaginatedJobs }) {
  return (
    <Workspace allowPublic>
      <Directory initialData={initialData} />
    </Workspace>
  );
}
function Directory({ initialData }: { initialData?: PaginatedJobs }) {
  const search = useSearchParams();
  const [q, setQ] = useState(search.get("q") || "");
  const [location, setLocation] = useState(search.get("location") || "");
  const [type, setType] = useState("");
  const [work, setWork] = useState(search.get("work_mode") || "");
  const [level, setLevel] = useState("");
  const [min, setMin] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [searchKey, setSearchKey] = useState({ q, location });
  const params = new URLSearchParams({ page: String(page), limit: "9", sort });
  Object.entries({
    q: searchKey.q,
    location: searchKey.location,
    job_type: type,
    work_mode: work,
    experience_level: level,
    salary_min: min,
  }).forEach(([k, v]) => {
    if (v.trim()) params.set(k, v.trim());
  });
  const { data, error, loading, reload } = useResource<PaginatedJobs>(
    `/api/jobs?${params}`,
    initialData,
  );
  return (
    <>
      <PageHeading
        eyebrow="YOUR NEXT CHAPTER"
        title="Find your kind of work."
        description="Good opportunities. A clear path forward."
      />
      <form
        className="directory-search"
        onSubmit={(e) => {
          e.preventDefault();
          setSearchKey({ q, location });
          setPage(1);
        }}
      >
        <label>
          <Icon name="search" />
          <input
            aria-label="Search jobs"
            placeholder="Job title, skill, or keyword"
            maxLength={100}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>
        <label>
          <Icon name="pin" />
          <input
            aria-label="Location"
            placeholder="Location"
            maxLength={150}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </label>
        <button className="btn primary">
          Find jobs <Icon name="arrow" size={16} />
        </button>
      </form>
      <div className="directory-layout">
        <aside className="filter-panel">
          <div className="row-between">
            <h3>
              <Icon name="sliders" size={17} />
              Refine your search
            </h3>
            <button
              className="text-link"
              onClick={() => {
                setType("");
                setWork("");
                setLevel("");
                setMin("");
                setQ("");
                setLocation("");
                setSearchKey({ q: "", location: "" });
                setSort("newest");
                setPage(1);
              }}
            >
              Reset
            </button>
          </div>
          <Field label="Job type">
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All job types</option>
              {["full-time", "part-time", "contract", "internship"].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Work style">
            <select
              value={work}
              onChange={(e) => {
                setWork(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All work styles</option>
              {["remote", "hybrid", "onsite"].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Experience">
            <select
              value={level}
              onChange={(e) => {
                setLevel(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All experience levels</option>
              {["entry", "mid", "senior", "any"].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field
            label="Minimum advertised salary (PKR)"
            hint="Matches the upper end of the advertised range."
          >
            <input
              type="number"
              min={0}
              max={1000000000}
              step={1}
              value={min}
              onChange={(e) => {
                const n = e.target.value;
                if (n === "" || (/^\d+$/.test(n) && Number(n) <= 1000000000)) {
                  setMin(n);
                  setPage(1);
                }
              }}
              placeholder="Any salary"
            />
          </Field>
          <div className="filter-note">
            <Icon name="shield" />
            <p>
              Listings are reviewed before appearing here. Always use care when
              sharing personal information.
            </p>
          </div>
        </aside>
        <div>
          <div className="results-toolbar">
            <span>
              {loading
                ? "Finding opportunities…"
                : `${data?.total ?? 0} opportunities to explore`}
            </span>
            <select
              aria-label="Sort jobs"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="salary">Highest salary</option>
            </select>
          </div>
          <Alert>{error}</Alert>
          {error && (
            <button className="btn secondary" onClick={reload}>
              Try again
            </button>
          )}
          {loading ? (
            <Spinner text="Finding your next move…" />
          ) : (
            !error &&
            (!data?.jobs.length ? (
              <Empty
                title="Your next move is still out there."
                description="Try a broader search or a different work style."
              />
            ) : (
              <div className="jobs-grid">
                {data.jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            ))
          )}
          <Pagination
            page={page}
            totalPages={data?.totalPages || 0}
            onChange={setPage}
          />
        </div>
      </div>
    </>
  );
}
export function JobDetail({ initialJob }: { initialJob?: Job }) {
  return (
    <Workspace allowPublic>
      <Detail initialJob={initialJob} />
    </Workspace>
  );
}
function Detail({ initialJob }: { initialJob?: Job }) {
  const params = useSearchParams();
  const id = params.get("id");
  const { user } = useAuth();
  const { data, error, loading } = useResource<{ job: Job }>(
    id ? `/api/jobs/${encodeURIComponent(id)}` : null,
    initialJob?.id === id ? { job: initialJob } : undefined,
  );
  const [saveBusy, setSaveBusy] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [view, setView] = useState<"apply" | "report" | null>(null);
  if (!id)
    return (
      <Empty
        title="Choose an opportunity first"
        description="Open a job from the directory to see its details."
        href="/jobs"
      />
    );
  if (loading) return <Spinner />;
  if (error) return <Alert>{error}</Alert>;
  const job = data?.job;
  if (!job) return null;
  const owner = user?.id === job.employer_id;
  return (
    <>
      <Link className="back-link" href={owner ? "/dashboard/my-jobs" : "/jobs"}>
        ← {owner ? "Your job listings" : "All opportunities"}
      </Link>
      <div className="detail-top">
        <div className="job-emblem large">
          {job.title[0]}
          <span>↗</span>
        </div>
        <div>
          <div className="eyebrow">YOUR NEXT OPPORTUNITY</div>
          <h1>{job.title}</h1>
          <div className="job-meta">
            <span>
              <Icon name="pin" size={16} />
              {job.location || "Location not specified"}
            </span>
            <span>{job.job_type}</span>
            <span>{job.work_mode}</span>
          </div>
        </div>
        <Badge>{job.status}</Badge>
      </div>
      <Alert success>{saveMessage}</Alert>
      <div className="detail-grid">
        <article className="panel job-description">
          <h2>The opportunity</h2>
          <p className="preserve-lines">{job.description}</p>
          {!!job.skills?.length && (
            <>
              <h2>Skills you’ll bring</h2>
              <div className="tag-list">
                {job.skills.map((s) => (
                  <span key={s}>{s}</span>
                ))}
              </div>
            </>
          )}
        </article>
        <aside>
          <div className="panel summary-card">
            <div className="eyebrow">THE DETAILS</div>
            <h3>{salary(job.salary_min, job.salary_max)}</h3>
            <dl>
              <dt>Job type</dt>
              <dd>{job.job_type}</dd>
              <dt>Work style</dt>
              <dd>{job.work_mode || "Not specified"}</dd>
              <dt>Experience</dt>
              <dd>{job.experience_level || "Any"}</dd>
              <dt>Posted</dt>
              <dd>{date(job.created_at)}</dd>
              <dt>Apply before</dt>
              <dd>{date(job.expires_at)}</dd>
            </dl>
            {user?.role === "candidate" && job.status === "open" && (
              <>
                <button
                  className="btn primary full"
                  disabled={!user.email_verified}
                  onClick={() => setView("apply")}
                >
                  Make your move <Icon name="arrow" size={18} />
                </button>
                <button
                  className="btn secondary full"
                  disabled={saveBusy || !user.email_verified}
                  onClick={async () => {
                    setSaveBusy(true);
                    try {
                      await apiFetch(`/api/jobs/${job.id}/save`, json("PUT"));
                      setSaveMessage(
                        "Saved to your shortlist. Find it in Saved jobs.",
                      );
                    } catch (e) {
                      setSaveMessage(errorMessage(e));
                    } finally {
                      setSaveBusy(false);
                    }
                  }}
                >
                  <Icon name="bookmark" size={17} />
                  {saveBusy ? "Saving…" : "Save to shortlist"}
                </button>
              </>
            )}
            {!user && (
              <Link className="btn primary full" href={`/login?next=${encodeURIComponent(`/jobs/detail?id=${job.id}`)}`}>
                Sign in to apply <Icon name="arrow" size={18} />
              </Link>
            )}
            {owner && (
              <>
                <Link
                  className="btn primary full"
                  href={`/dashboard/edit-job?id=${job.id}`}
                >
                  Edit listing
                </Link>
                <Link
                  className="btn secondary full"
                  href={`/dashboard/applicants?id=${job.id}`}
                >
                  View applicants
                </Link>
              </>
            )}
          </div>
          <div className="detail-safety">
            <Icon name="shield" size={20} />
            <p>
              Never pay to apply for a job. Keep banking details and identity
              documents private.
            </p>
          </div>
          {user?.role === "candidate" && (
            <button
              className="text-link muted"
              disabled={!user.email_verified}
              onClick={() => setView("report")}
            >
              <Icon name="flag" size={16} />
              Report this listing
            </button>
          )}
        </aside>
      </div>
      {view && (
        <JobAction type={view} job={job} onClose={() => setView(null)} />
      )}
    </>
  );
}
function JobAction({
  type,
  job,
  onClose,
}: {
  type: "apply" | "report";
  job: Job;
  onClose: () => void;
}) {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [letter, setLetter] = useState("");
  const [reason, setReason] = useState("scam");
  const [file, setFile] = useState<File | null>(null);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (
      type === "apply" &&
      (!file ||
        file.size > 5 * 1024 * 1024 ||
        !file.size ||
        !file.name.toLowerCase().endsWith(".pdf") ||
        (file.type && file.type !== "application/pdf"))
    ) {
      setError("Choose a non-empty PDF resume up to 5 MB.");
      return;
    }
    setBusy(true);
    try {
      if (type === "apply") {
        const form = new FormData();
        form.set("job_id", job.id);
        form.set("cover_letter", letter.trim());
        form.set("resume", file!);
        await apiFetch("/api/applications", { method: "POST", body: form });
        setMessage(
          "Your application is on its way. Track it in My applications.",
        );
      } else {
        await apiFetch(
          `/api/jobs/${job.id}/report`,
          json("POST", { reason, details: letter.trim() }),
        );
        setMessage(
          "Report submitted. You can follow its status in My reports.",
        );
      }
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      className="panel action-panel"
      aria-label={
        type === "apply" ? "Apply for this job" : "Report this listing"
      }
    >
      <div className="row-between">
        <h2>
          {type === "apply"
            ? "Let’s make your introduction."
            : "Help keep opportunities trustworthy."}
        </h2>
        <button
          disabled={busy}
          className="icon-btn"
          onClick={onClose}
          aria-label="Close form"
        >
          <Icon name="close" />
        </button>
      </div>
      <p>{job.title}</p>
      <Alert>{error}</Alert>
      <Alert success>{message}</Alert>
      {!message && (
        <form className="form-stack" onSubmit={submit}>
          {type === "apply" ? (
            <Field
              label="Your resume (PDF)"
              hint="Up to 5 MB. Only you and the hiring employer can download it."
            >
              <input
                type="file"
                required
                accept="application/pdf,.pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </Field>
          ) : (
            <Field label="Reason">
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                {["scam", "spam", "discrimination", "misleading", "other"].map(
                  (r) => (
                    <option key={r}>{r}</option>
                  ),
                )}
              </select>
            </Field>
          )}
          <Field
            label={
              type === "apply"
                ? "Cover letter (optional)"
                : "What should we know? (optional)"
            }
            hint={`${letter.length}/2000 characters`}
          >
            <textarea
              rows={5}
              maxLength={2000}
              value={letter}
              onChange={(e) => setLetter(e.target.value)}
            />
          </Field>
          <button disabled={busy} className="btn primary">
            {busy
              ? "Submitting…"
              : type === "apply"
                ? "Send my application"
                : "Submit report"}
            <Icon name="arrow" size={17} />
          </button>
        </form>
      )}
    </section>
  );
}
export function SavedJobs() {
  return (
    <Workspace roles={["candidate"]}>
      <Saved />
    </Workspace>
  );
}
function Saved() {
  const [page, setPage] = useState(1);
  const { data, error, loading, reload } = useResource<PageData<SavedJob>>(
    `/api/jobs/saved?page=${page}&limit=9`,
  );
  const [busy, setBusy] = useState("");
  const [actionError, setActionError] = useState("");
  return (
    <>
      <PageHeading
        eyebrow="YOUR SHORTLIST"
        title="Good possibilities, kept close."
        description="Come back to the opportunities that caught your eye."
      />
      <Alert>{error || actionError}</Alert>
      {loading ? (
        <Spinner />
      ) : (
        !error &&
        (!data?.data.length ? (
          <Empty
            title="Room for your next big possibility."
            description="Save a job from its detail page and you’ll find it here."
            href="/jobs"
          />
        ) : (
          <div className="jobs-grid saved-grid">
            {data.data.map((s) => (
              <div key={s.id}>
                {s.jobs ? (
                  <JobCard
                    job={s.jobs}
                    extra={
                      <button
                        disabled={busy === s.id}
                        className="text-link"
                        onClick={async () => {
                          setBusy(s.id);
                          setActionError("");
                          try {
                            await apiFetch(`/api/jobs/${s.job_id}/save`, {
                              method: "DELETE",
                            });
                            reload();
                          } catch (e) {
                            setActionError(errorMessage(e));
                          } finally {
                            setBusy("");
                          }
                        }}
                      >
                        {busy === s.id ? "Removing…" : "Remove"}
                      </button>
                    }
                  />
                ) : (
                  <div className="panel">
                    <h3>Listing no longer available</h3>
                    <button
                      className="btn secondary"
                      disabled={busy === s.id}
                      onClick={async () => {
                        setBusy(s.id);
                        try {
                          await apiFetch(`/api/jobs/${s.job_id}/save`, {
                            method: "DELETE",
                          });
                          reload();
                        } catch (e) {
                          setActionError(errorMessage(e));
                        } finally {
                          setBusy("");
                        }
                      }}
                    >
                      Remove from saved
                    </button>
                  </div>
                )}
              </div>
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
