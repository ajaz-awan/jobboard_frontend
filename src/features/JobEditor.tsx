"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import apiFetch, { errorMessage, json } from "@/lib/api";
import { Job } from "@/types";
import {
  Workspace,
  PageHeading,
  Field,
  Alert,
  Spinner,
  useResource,
} from "@/components/UI";
import Icon from "@/components/Icon";
export default function JobEditor({ edit = false }: { edit?: boolean }) {
  return (
    <Workspace roles={["employer"]}>
      <Editor edit={edit} />
    </Workspace>
  );
}
function Editor({ edit }: { edit: boolean }) {
  const id = useSearchParams().get("id");
  const { user } = useAuth();
  const {
    data,
    error: loadError,
    loading,
  } = useResource<{ job: Job }>(
    edit && id ? `/api/jobs/${encodeURIComponent(id)}` : null,
  );
  if (edit && loading) return <Spinner />;
  if (loadError) return <Alert>{loadError}</Alert>;
  if (edit && (!id || data?.job.employer_id !== user?.id))
    return <Alert>This listing is unavailable or belongs to another employer.</Alert>;
  return <EditorForm key={`${id}:${data?.job.revision ?? 0}`} job={edit ? data?.job : undefined} />;
}
function EditorForm({ job }: { job?: Job }) {
  const { user } = useAuth();
  const router = useRouter();
  const edit = !!job;
  const id = job?.id;
  const [title, setTitle] = useState(job?.title ?? "");
  const [description, setDescription] = useState(job?.description ?? "");
  const [location, setLocation] = useState(job?.location ?? "");
  const [type, setType] = useState(job?.job_type ?? "full-time");
  const [work, setWork] = useState(job?.work_mode ?? "onsite");
  const [level, setLevel] = useState(job?.experience_level ?? "any");
  const [min, setMin] = useState(job?.salary_min == null ? "" : String(job.salary_min));
  const [max, setMax] = useState(job?.salary_max == null ? "" : String(job.salary_max));
  const [skills, setSkills] = useState(job?.skills?.join(", ") ?? "");
  const [deadline, setDeadline] = useState(() => job?.expires_at
    ? new Date(new Date(job.expires_at).getTime() - new Date(job.expires_at).getTimezoneOffset() * 60000).toISOString().slice(0, 16)
    : "");
  const [status, setStatus] = useState<string>(job?.status ?? "open");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const skillList = skills
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
    if (skillList.length > 20 || skillList.some((x) => x.length > 40)) {
      setError("Add at most 20 skills, with no more than 40 characters each.");
      return;
    }
    if (min !== "" && max !== "" && Number(max) < Number(min)) {
      setError("Maximum salary must be at least minimum salary.");
      return;
    }
    if (deadline && new Date(deadline).getTime() <= Date.now()) {
      setError("Choose a future application deadline, or clear it.");
      return;
    }
    const payload = {
      title: title.trim(),
      description: description.trim(),
      ...(edit ? { location: location.trim() || null } : location.trim() ? { location: location.trim() } : {}),
      job_type: type,
      work_mode: work,
      experience_level: level,
      status,
      skills: [...new Set(skillList)],
      expires_at: deadline ? new Date(deadline).toISOString() : null,
      ...(min !== "" ? { salary_min: Number(min) } : edit ? { salary_min: null } : {}),
      ...(max !== "" ? { salary_max: Number(max) } : edit ? { salary_max: null } : {}),
    };
    setBusy(true);
    try {
      await apiFetch(
        edit ? `/api/jobs/${id}` : "/api/jobs",
        json(edit ? "PATCH" : "POST", payload),
      );
      router.push("/dashboard/my-jobs");
    } catch (e) {
      setError(errorMessage(e));
      setBusy(false);
    }
  }
  return (
    <>
      <Link href="/dashboard/my-jobs" className="back-link">
        ← Your listings
      </Link>
      <PageHeading
        eyebrow="INVITE POSSIBILITY"
        title={
          edit
            ? "Make your opportunity shine."
            : "Your next teammate starts here."
        }
        description="A thoughtful listing helps the right people see themselves on your team."
      />
      <div className="editor-layout">
        <form className="panel form-stack" onSubmit={submit}>
          <Alert>{error}</Alert>
          <h2>The essentials</h2>
          <Field label="Job title">
            <input
              required
              minLength={3}
              maxLength={150}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Frontend Developer"
            />
          </Field>
          <Field label="Location">
            <input
              maxLength={150}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Faisalabad, Pakistan"
            />
          </Field>
          <div className="form-grid">
            <Field label="Job type">
              <select value={type} onChange={(e) => setType(e.target.value)}>
                {["full-time", "part-time", "contract", "internship"].map(
                  (x) => (
                    <option key={x}>{x}</option>
                  ),
                )}
              </select>
            </Field>
            <Field label="Work style">
              <select value={work} onChange={(e) => setWork(e.target.value)}>
                {["onsite", "hybrid", "remote"].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
            <Field label="Experience level">
              <select value={level} onChange={(e) => setLevel(e.target.value)}>
                {["entry", "mid", "senior", "any"].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
            <Field label="Listing status">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </Field>
          </div>
          <h2>Give people the full picture</h2>
          <Field
            label="Job description"
            hint={`${description.length}/20000 characters. Plain text is supported.`}
          >
            <textarea
              required
              rows={10}
              minLength={10}
              maxLength={20000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell candidates about the role, responsibilities, requirements, and what makes your team a good place to work."
            />
          </Field>
          <Field
            label="Skills"
            hint="Separate skills with commas. Up to 20 skills."
          >
            <input
              value={skills}
              maxLength={820}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="React, TypeScript, CSS"
            />
          </Field>
          <h2>Salary & timing</h2>
          <p className="muted">
            Enter the advertised salary range in PKR. Mention its period
            (monthly or yearly) in your description.
          </p>
          <div className="form-grid">
            <Field label="Minimum salary (PKR)">
              <input
                type="number"
                min={0}
                max={1000000000}
                step={1}
                value={min}
                onChange={(e) => setMin(e.target.value)}
              />
            </Field>
            <Field label="Maximum salary (PKR)">
              <input
                type="number"
                min={0}
                max={1000000000}
                step={1}
                value={max}
                onChange={(e) => setMax(e.target.value)}
              />
            </Field>
          </div>
          {edit && (
            <small className="muted">
              Clear a salary field to remove that value from the listing.
            </small>
          )}
          <Field label="Application deadline (optional)">
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </Field>
          <div className="actions">
            <button
              disabled={busy || !user?.email_verified}
              className="btn primary"
            >
              {busy
                ? "Saving…"
                : edit
                  ? "Save for review"
                  : "Submit for review"}
              <Icon name="arrow" size={17} />
            </button>
            <Link className="btn secondary" href="/dashboard/my-jobs">
              Cancel
            </Link>
          </div>
        </form>
        <aside className="panel editor-tips">
          <Icon name="spark" size={28} />
          <h3>A good listing opens doors.</h3>
          <p>
            Be specific about the work, honest about expectations, and clear
            about the salary.
          </p>
          <hr />
          <Icon name="shield" />
          <h3>A little care goes a long way.</h3>
          <p>
            New listings and content edits go through admin review before
            appearing in search.
          </p>
          <p>
            Closing a listing stops new applications. Your existing applications
            stay in your workspace.
          </p>
        </aside>
      </div>
    </>
  );
}
