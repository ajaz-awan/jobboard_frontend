"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import apiFetch, {
  apiUrl,
  clearSession,
  errorMessage,
  json,
  passwordError,
} from "@/lib/api";
import { Session, User } from "@/types";
import {
  Workspace,
  PageHeading,
  Field,
  Alert,
  Confirm,
  useResource,
  date,
  Spinner,
} from "@/components/UI";
import Icon from "@/components/Icon";
export default function Settings() {
  return (
    <Workspace>
      <Account />
    </Workspace>
  );
}
function Account() {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const [name, setName] = useState(user?.name || "");
  const [company, setCompany] = useState(user?.company_name || "");
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState("");
  const [confirm, setConfirm] = useState<{
    id: string;
    all?: boolean;
    current?: boolean;
  } | null>(null);
  const [savedLogo, setSavedLogo] = useState(false);
  const sessions = useResource<{ data: Session[] }>("/api/auth/sessions");
  const employer = user?.role === "employer";
  async function run(label: string, fn: () => Promise<void>) {
    setError("");
    setMessage("");
    setBusy(label);
    try {
      await fn();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy("");
    }
  }
  function change(e: FormEvent) {
    e.preventDefault();
    if (passwordError(password)) {
      setError(passwordError(password));
      return;
    }
    if (password !== confirmPassword) {
      setError("Your new passwords do not match.");
      return;
    }
    void run("password", async () => {
      await apiFetch(
        "/api/auth/change-password",
        json("POST", { current_password: current, new_password: password }),
      );
      clearSession();
      router.replace("/login");
    });
  }
  return (
    <>
      <PageHeading
        eyebrow="YOUR ACCOUNT"
        title="A workspace that’s yours."
        description="Keep your details current and your account protected."
      />
      <Alert>{error}</Alert>
      <Alert success>{message}</Alert>
      <div className="settings-grid">
        <section className="panel">
          <h2>A good introduction.</h2>
          <p>Your account details.</p>
          <form
            className="form-stack"
            onSubmit={(e) => {
              e.preventDefault();
              void run("profile", async () => {
                const d = await apiFetch<{ data: User }>(
                  "/api/users/me",
                  json("PATCH", {
                    name: name.trim(),
                    ...(employer ? { company_name: company.trim() } : {}),
                  }),
                );
                updateUser(d.data);
                setMessage("Your profile is up to date.");
              });
            }}
          >
            <Field label="Your name">
              <input
                required
                minLength={2}
                maxLength={100}
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
            <Field
              label="Email address"
              hint={
                user?.email_verified
                  ? "Your email is verified."
                  : "Verify your email to unlock all features."
              }
            >
              <input value={user?.email || ""} readOnly type="email" />
            </Field>
            {employer && (
              <Field label="Company name">
                <input
                  required
                  minLength={2}
                  maxLength={150}
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </Field>
            )}
            <button disabled={!!busy} className="btn primary">
              {busy === "profile" ? "Saving…" : "Save profile"}
            </button>
          </form>
          {employer && (
            <div className="logo-upload">
              <h3>Company logo</h3>
              {user?.logo_url && (
                <div
                  className="current-logo"
                  style={{
                    backgroundImage: `url("${apiUrl(user.logo_url).replace(/["\\\n\r]/g, "")}")`,
                  }}
                  role="img"
                  aria-label="Your company logo"
                />
              )}
              <Field label="Upload PNG, JPEG, or WebP (up to 5 MB)">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  disabled={!!busy || !user?.email_verified}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (
                      !["image/png", "image/jpeg", "image/webp"].includes(
                        file.type,
                      ) ||
                      file.size > 5 * 1024 * 1024 ||
                      !file.size
                    ) {
                      setError(
                        "Choose a non-empty PNG, JPEG, or WebP up to 5 MB.",
                      );
                      return;
                    }
                    void run("logo", async () => {
                      const form = new FormData();
                      form.set("logo", file);
                      const d = await apiFetch<{ data: User }>(
                        "/api/users/me/logo",
                        { method: "PATCH", body: form },
                      );
                      updateUser(d.data);
                      setSavedLogo(true);
                      setMessage("Company logo updated.");
                    });
                  }}
                />
              </Field>
              {busy === "logo" ? (
                <small>Uploading logo…</small>
              ) : (
                savedLogo && <small>Logo saved.</small>
              )}
            </div>
          )}
        </section>
        <section className="panel">
          <h2>Keep your account secure.</h2>
          <p>Changing your password signs you out on every device.</p>
          <form className="form-stack" onSubmit={change}>
            <Field label="Current password">
              <input
                type="password"
                required
                maxLength={1024}
                autoComplete="current-password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
              />
            </Field>
            <Field
              label="New password"
              hint="At least 12 characters; at most 72 UTF-8 bytes."
            >
              <input
                type="password"
                required
                minLength={12}
                maxLength={72}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
            <Field label="Confirm new password">
              <input
                type="password"
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </Field>
            <button disabled={!!busy} className="btn secondary">
              {busy === "password" ? "Updating…" : "Change password"}
            </button>
          </form>
        </section>
      </div>
      <section className="panel sessions-panel">
        <div className="row-between">
          <div>
            <h2>Where you’re signed in.</h2>
            <p>
              Review active sessions and sign out devices you don’t recognize.
            </p>
          </div>
          <button
            className="btn secondary"
            onClick={() => setConfirm({ id: "all", all: true })}
          >
            Sign out all devices
          </button>
        </div>
        <Alert>{sessions.error}</Alert>
        {sessions.loading ? (
          <Spinner />
        ) : (
          sessions.data?.data.map((s) => (
            <article className="session-row" key={s.id}>
              <Icon name="globe" />
              <div>
                <strong>
                  {s.current
                    ? "This device"
                    : s.user_agent || "Browser session"}
                </strong>
                {s.current && <span className="badge">Current</span>}
                <p>{s.user_agent || "Browser information unavailable"}</p>
                <small>
                  Last active {date(s.last_used_at)} · Expires{" "}
                  {date(s.expires_at)}
                </small>
              </div>
              <button
                className="text-link danger-text"
                onClick={() => setConfirm({ id: s.id, current: s.current })}
              >
                Sign out
              </button>
            </article>
          ))
        )}
      </section>
      {confirm && (
        <Confirm
          title={
            confirm.all ? "Sign out every device?" : "Sign out this device?"
          }
          description={
            confirm.all || confirm.current
              ? "You will need to log in again to continue."
              : "This session will lose access to your account."
          }
          onClose={() => setConfirm(null)}
          onConfirm={async () => {
            await apiFetch(
              confirm.all
                ? "/api/auth/logout-all"
                : `/api/auth/sessions/${confirm.id}`,
              confirm.all ? json("POST") : { method: "DELETE" },
            );
            if (confirm.all || confirm.current) {
              clearSession();
              router.replace("/login");
            } else sessions.reload();
          }}
        />
      )}
    </>
  );
}
