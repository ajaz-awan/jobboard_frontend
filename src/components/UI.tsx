"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { Role, User } from "@/types";
import apiFetch, { errorMessage } from "@/lib/api";
import Icon from "./Icon";
export function Alert({
  children,
  success = false,
}: {
  children: ReactNode;
  success?: boolean;
}) {
  return children ? (
    <div
      className={`alert ${success ? "success" : ""}`}
      role={success ? "status" : "alert"}
    >
      {children}
    </div>
  ) : null;
}
export function Spinner({
  text = "Loading your workspace…",
}: {
  text?: string;
}) {
  return (
    <div className="loading" role="status">
      <span className="spinner" />
      {text}
    </div>
  );
}
export function Empty({
  title,
  description,
  href,
  label,
}: {
  title: string;
  description: string;
  href?: string;
  label?: string;
}) {
  return (
    <div className="empty">
      <span className="empty-icon">
        <Icon name="bag" size={28} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {href && (
        <Link className="btn primary" href={href}>
          {label || "Explore jobs"}
          <Icon name="arrow" size={16} />
        </Link>
      )}
    </div>
  );
}
export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className={`badge badge-${String(children).toLowerCase()}`}>
      {children}
    </span>
  );
}
export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (n: number) => void;
}) {
  return totalPages > 1 ? (
    <div className="pagination">
      <button
        className="btn secondary"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        ← Previous
      </button>
      <span>
        Page {page} of {totalPages}
      </span>
      <button
        className="btn secondary"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        Next →
      </button>
    </div>
  ) : null;
}
export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}
export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}
export function useResource<T>(path: string | null, initialData?: T) {
  const { user, loading: sessionLoading } = useAuth();
  const identity = user?.id ?? "guest";
  const [version, setVersion] = useState(0);
  const [result, setResult] = useState<{
    path: string | null; version: number; identity: string; data: T | null; error: string;
  } | null>(() => initialData === undefined ? null : { path, version: 0, identity, data: initialData, error: "" });
  useEffect(() => {
    if (!path || sessionLoading) return;
    const controller = new AbortController();
    apiFetch<T>(path, { signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) setResult({ path, version, identity, data, error: "" });
      })
      .catch((e) => {
        if (!controller.signal.aborted)
          setResult({ path, version, identity, data: null, error: errorMessage(e) });
      });
    return () => controller.abort();
  }, [path, version, identity, sessionLoading]);
  const current = result?.path === path && result?.version === version && result?.identity === identity ? result : null;
  return {
    data: current?.data ?? null,
    error: current?.error ?? "",
    loading: !!path && !current,
    reload: () => setVersion((v) => v + 1),
  };
}
export function Confirm({
  title,
  description,
  onConfirm,
  onClose,
  danger = false,
}: {
  title: string;
  description: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
  danger?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const d = ref.current;
    d?.showModal();
    return () => d?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onClose();
      }}
      className="modal"
    >
      <h2>{title}</h2>
      <p>{description}</p>
      <Alert>{error}</Alert>
      <div className="actions">
        <button className="btn secondary" disabled={busy} onClick={onClose}>
          Cancel
        </button>
        <button
          className={`btn ${danger ? "danger" : "primary"}`}
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await onConfirm();
              onClose();
            } catch (e) {
              setError(errorMessage(e));
              setBusy(false);
            }
          }}
        >
          {busy ? "Working…" : "Confirm"}
        </button>
      </div>
    </dialog>
  );
}
const links = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: "grid",
    roles: ["candidate", "employer", "admin"],
  },
  {
    href: "/jobs",
    label: "Discover jobs",
    icon: "search",
    roles: ["candidate", "employer"],
  },
  {
    href: "/dashboard/applications",
    label: "My applications",
    icon: "bag",
    roles: ["candidate"],
  },
  {
    href: "/dashboard/saved",
    label: "Saved jobs",
    icon: "bookmark",
    roles: ["candidate"],
  },
  {
    href: "/dashboard/my-jobs",
    label: "Manage jobs",
    icon: "bag",
    roles: ["employer"],
  },
  {
    href: "/dashboard/post-job",
    label: "Post a job",
    icon: "plus",
    roles: ["employer"],
  },
  {
    href: "/dashboard/notifications",
    label: "Notifications",
    icon: "bell",
    roles: ["candidate", "employer", "admin"],
  },
  {
    href: "/dashboard/reports",
    label: "My reports",
    icon: "flag",
    roles: ["candidate"],
  },
  { href: "/admin", label: "Administration", icon: "shield", roles: ["admin"] },
  {
    href: "/dashboard/settings",
    label: "Account & security",
    icon: "user",
    roles: ["candidate", "employer", "admin"],
  },
];
export function Workspace({
  children,
  roles,
  allowPublic = false,
}: {
  children: ReactNode;
  roles?: Role[];
  allowPublic?: boolean;
}) {
  const { user, loading } = useAuth();
  const pathname = usePathname().replace(/\/$/, "") || "/";
  const router = useRouter();
  useEffect(() => {
    if (!allowPublic && !loading && !user)
      router.replace(
        `/login?next=${encodeURIComponent(pathname + window.location.search)}`,
      );
  }, [allowPublic, loading, user, pathname, router]);
  if (allowPublic && !user) return <main id="main" className="container public-jobs">{children}</main>;
  if (loading || !user) return <Spinner />;
  if (roles && !roles.includes(user.role))
    return (
      <main id="main" className="container">
        <Empty
          title="This page belongs to another workspace"
          description="Use the pages available for your account."
          href="/dashboard"
          label="Go to overview"
        />
      </main>
    );
  return (
    <div className="workspace">
      <aside className="sidebar">
        <div className="workspace-label">
          YOUR WORKSPACE <span>{user.role}</span>
        </div>
        <nav aria-label="Workspace">
          {links
            .filter((x) => x.roles.includes(user.role))
            .map((x) => (
              <Link
                key={x.href}
                href={x.href}
                className={pathname === x.href ? "active" : ""}
              >
                <Icon name={x.icon} size={18} />
                {x.label}
              </Link>
            ))}
        </nav>
        <div className="sidebar-tip">
          <Icon name="spark" />
          <strong>A little progress, every day.</strong>
          <p>
            {user.role === "candidate"
              ? "Your next chapter starts with one good opportunity."
              : "Great teams start with the right people."}
          </p>
        </div>
        <div className="sidebar-person">
          <div className="avatar">{user.name[0]}</div>
          <div>
            <strong>{user.name}</strong>
            <small>{user.company_name || "Your personal workspace"}</small>
          </div>
        </div>
      </aside>
      <main id="main" className="workspace-main">
        {!user.email_verified && <Verification user={user} />} {children}
      </main>
    </div>
  );
}
function Verification({ user }: { user: User }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div className="verification">
      <Icon name="shield" />
      <div>
        <strong>One last step: verify your email.</strong>
        <p>Verify {user.email} to apply, save jobs, or publish listings.</p>
        {message && <small role="status">{message}</small>}
      </div>
      <button
        className="btn secondary small"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            const d = await apiFetch<{ message: string }>(
              "/api/auth/resend-verification",
              { method: "POST", body: JSON.stringify({ email: user.email }) },
            );
            setMessage(d.message);
          } catch (e) {
            setMessage(errorMessage(e));
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Sending…" : "Resend email"}
      </button>
    </div>
  );
}
export function date(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
}
export function salary(min?: number | null, max?: number | null) {
  if (min == null && max == null) return "Salary not specified";
  const f = (n: number) => new Intl.NumberFormat("en-PK").format(n);
  return `PKR ${min != null ? f(min) : "Up to"}${max != null ? `${min != null ? " – " : " "}${f(max)}` : "+"}`;
}
