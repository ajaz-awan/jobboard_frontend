"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import apiFetch, {
  ApiError,
  clearSession,
  errorMessage,
  json,
  passwordError,
  safeReturnPath,
} from "@/lib/api";
import { Alert, Field } from "@/components/UI";
import Icon from "@/components/Icon";
type Mode =
  "login" | "register" | "forgot-password" | "reset-password" | "verify-email";
export default function AuthPage({ mode }: { mode: Mode }) {
  const auth = useAuth();
  const params = useSearchParams();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState<"candidate" | "employer">(
    params.get("role") === "employer" ? "employer" : "candidate",
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [show, setShow] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [codeSent, setCodeSent] = useState(false);
  const token = useRef("");
  const [hasToken, setHasToken] = useState(false);
  const captured = useRef(false);
  useEffect(() => {
    if (
      (mode === "reset-password" || mode === "verify-email") &&
      !captured.current
    ) {
      captured.current = true;
      token.current =
        new URLSearchParams(window.location.hash.slice(1)).get("token") || "";
      setHasToken(/^[a-f0-9]{64}$/i.test(token.current));
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [mode]);
  const title = {
    login: "Welcome back.",
    register: "A whole new chapter starts here.",
    "forgot-password": "Let’s get you back in.",
    "reset-password": "A fresh password.",
    "verify-email": "Make it official.",
  }[mode];
  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    if (["register", "reset-password"].includes(mode)) {
      const issue = passwordError(password);
      if (issue) {
        setError(issue);
        return;
      }
      if (password !== confirm) {
        setError("Your passwords do not match.");
        return;
      }
    }
    setBusy(true);
    try {
      if (mode === "login") {
        await auth.login(email.trim(), password);
        const next = params.get("next");
        router.replace(safeReturnPath(next));
      } else if (mode === "register") {
        const signupEmail = await auth.register(
          name.trim(),
          email.trim(),
          password,
          role,
          company.trim(),
        );
        setPendingEmail(signupEmail);
        setCodeSent(true);
        setPassword("");
        setConfirm("");
      } else if (mode === "forgot-password") {
        const d = await apiFetch<{ message: string }>(
          "/api/auth/forgot-password",
          json("POST", { email: email.trim() }),
        );
        setMessage(d.message);
      } else if (mode === "reset-password") {
        await apiFetch(
          "/api/auth/reset-password",
          json("POST", { token: token.current, password }),
        );
        token.current = "";
        clearSession();
        setMessage("Password updated. Sign in with your new password.");
        setPassword("");
        setConfirm("");
      } else {
        await apiFetch(
          "/api/auth/verify-email",
          json("POST", { token: token.current }),
        );
        token.current = "";
        setMessage("Email verified. You’re ready to make your next move.");
        if (auth.user) {
          const d = await apiFetch<{ data: typeof auth.user }>("/api/users/me");
          auth.updateUser(d.data);
        }
      }
    } catch (e) {
      if (mode === "login" && e instanceof ApiError && e.status === 403 && /verify your email/i.test(e.message)) {
        setPendingEmail(email.trim().toLowerCase());
        setCodeSent(false);
        setPassword("");
      } else setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <main id="main" className="auth-layout">
      <aside className="auth-story">
        <div className="eyebrow">YOUR NEXT CHAPTER STARTS HERE.</div>
        <h2>
          A little courage.
          <br />
          A whole new
          <br />
          <span className="serif">chapter.</span>
        </h2>
        <span className="auth-star" aria-hidden="true">
          ✳
        </span>
        <p>
          Find a role that fits. Build a team that matters.
          <br />
          Make your next chapter a good one.
        </p>
        <span className="auth-footnote">
          <Icon name="shield" size={18} /> Thoughtfully built around your
          journey.
        </span>
      </aside>
      <section className="auth-form-wrap">
        <Link href="/" className="back-link">
          ← Back to jobboard
        </Link>
        {pendingEmail !== null ? (
          <SignupVerification
            initialEmail={pendingEmail}
            codeSent={codeSent}
            onBack={() => { setPendingEmail(null); setError(""); setMessage(""); }}
            onVerified={() => {
              setPendingEmail(null);
              setPassword("");
              setConfirm("");
              router.replace("/login?verified=1");
            }}
          />
        ) : (
        <div className="auth-form">
          <div className="eyebrow">
            {mode === "register" ? "HELLO, POSSIBILITY" : "YOUR NEXT MOVE"}
          </div>
          <h1>{title}</h1>
          <p>
            {mode === "login"
              ? "Good to see you. Pick up where you left off."
              : mode === "register"
                ? "Good opportunities start with a simple introduction."
                : mode === "verify-email"
                  ? "Confirm your email to unlock your workspace."
                  : "We’ll help you get back to your next opportunity."}
          </p>
          <Alert>{error}</Alert>
          <Alert success>{message || (mode === "login" && params.get("verified") === "1" ? "Email verified. Sign in to your account." : "")}</Alert>
          {(mode === "verify-email" || mode === "reset-password") &&
          !hasToken ? (
            <Alert>
              This link is missing a valid token. Open the complete link from
              your email.
            </Alert>
          ) : (
            !message && (
              <form onSubmit={submit} className="form-stack">
                {mode === "register" && (
                  <>
                    <div className="role-picker">
                      <button
                        className={role === "candidate" ? "active" : ""}
                        type="button"
                        onClick={() => setRole("candidate")}
                      >
                        <Icon name="user" />
                        I’m finding a job
                      </button>
                      <button
                        className={role === "employer" ? "active" : ""}
                        type="button"
                        onClick={() => setRole("employer")}
                      >
                        <Icon name="bag" />
                        I’m hiring
                      </button>
                    </div>
                    <Field label="Your name">
                      <input
                        required
                        autoComplete="name"
                        minLength={2}
                        maxLength={100}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ajaz Ahmad"
                      />
                    </Field>
                    {role === "employer" && (
                      <Field label="Company name">
                        <input
                          required
                          minLength={2}
                          maxLength={150}
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          placeholder="Your company"
                        />
                      </Field>
                    )}
                  </>
                )}
                {["register", "login", "forgot-password"].includes(mode) && (
                  <Field label="Email address">
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      maxLength={254}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                    />
                  </Field>
                )}
                {["register", "login", "reset-password"].includes(mode) && (
                  <>
                    <Field
                      label={
                        mode === "reset-password" ? "New password" : "Password"
                      }
                      hint={
                        mode !== "login"
                          ? "At least 12 characters; at most 72 UTF-8 bytes."
                          : undefined
                      }
                    >
                      <div className="password-field">
                        <input
                          type={show ? "text" : "password"}
                          required
                          autoComplete={
                            mode === "login"
                              ? "current-password"
                              : "new-password"
                          }
                          minLength={mode === "login" ? 1 : 12}
                          maxLength={mode === "login" ? 1024 : 72}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          className="icon-btn"
                          aria-label={show ? "Hide password" : "Show password"}
                          onClick={() => setShow(!show)}
                        >
                          <Icon name="eye" size={18} />
                        </button>
                      </div>
                    </Field>
                    {mode !== "login" && (
                      <Field label="Confirm password">
                        <input
                          required
                          type="password"
                          autoComplete="new-password"
                          value={confirm}
                          onChange={(e) => setConfirm(e.target.value)}
                        />
                      </Field>
                    )}
                  </>
                )}
                {mode === "login" && (
                  <Link href="/forgot-password" className="form-link">
                    Forgot your password?
                  </Link>
                )}
                {mode === "register" && (
                  <label className="checkbox-label">
                    <input type="checkbox" required />{" "}
                    <span>
                      I agree to the <Link href="/terms">Terms</Link> and{" "}
                      <Link href="/privacy">Privacy notice</Link>.
                    </span>
                  </label>
                )}
                <button className="btn primary full" disabled={busy}>
                  {busy
                    ? "Just a moment…"
                    : {
                        login: "Let’s go",
                        register: "Create my account",
                        "forgot-password": "Send reset link",
                        "reset-password": "Save new password",
                        "verify-email": "Verify my email",
                      }[mode]}
                  <Icon name="arrow" size={18} />
                </button>
              </form>
            )
          )}
          {mode === "login" ? (
            <p className="auth-switch">
              New here? <Link href="/register">Find your next chapter →</Link>
              <br />
              <button type="button" className="text-link" onClick={() => { setPendingEmail(email.trim().toLowerCase()); setCodeSent(false); setError(""); }}>
                Verify an existing signup
              </button>
            </p>
          ) : (
            <p className="auth-switch">
              <Link
                href={
                  message && mode === "verify-email" && auth.user
                    ? "/dashboard"
                    : "/login"
                }
              >
                {message && mode === "verify-email" && auth.user
                  ? "Go to workspace →"
                  : "Back to log in →"}
              </Link>
            </p>
          )}
          <div className="auth-security">
            <Icon name="shield" size={16} />
            <span>
              Your resume stays private. A whole new move stays yours.
            </span>
          </div>
        </div>
        )}
      </section>
    </main>
  );
}


function SignupVerification({ initialEmail, codeSent, onBack, onVerified }: {
  initialEmail: string;
  codeSent: boolean;
  onBack: () => void;
  onVerified: () => void;
}) {
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState(codeSent ? "A code has been requested for your email. Check your inbox and spam folder." : "Request a code for your pending signup, then enter it below.");
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(codeSent ? 60 : 0);
  useEffect(() => {
    if (!cooldown) return;
    const timer = setInterval(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);
  async function resend() {
    setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter the email address used for your signup.");
      return;
    }
    setBusy(true);
    try {
      const response = await apiFetch<{ message: string }>("/api/auth/resend-verification", json("POST", { email: email.trim() }));
      setMessage(response.message + ". Check your inbox and spam folder.");
      setCooldown(60);
      setOtp("");
    } catch (error) { setError(errorMessage(error)); }
    finally { setBusy(false); }
  }
  async function verify(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await apiFetch("/api/auth/verify-signup", json("POST", { email: email.trim(), otp }));
      onVerified();
    } catch (error) { setError(errorMessage(error)); }
    finally { setBusy(false); }
  }
  return (
    <div className="auth-form">
      <div className="eyebrow">ONE MORE STEP</div>
      <h1>Verify your email.</h1>
      <p>Your account stays pending until you verify your email. Codes expire after 10 minutes and allow 5 attempts.</p>
      <Alert>{error}</Alert>
      <Alert success>{message}</Alert>
      <form className="form-stack" onSubmit={verify}>
        <Field label="Signup email">
          <input type="email" required autoComplete="email" maxLength={254} value={email}
            onChange={(event) => { setEmail(event.target.value); setOtp(""); }} disabled={busy} />
        </Field>
        <Field label="Verification code" hint="Enter the 6 digits from your email.">
          <input required type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" minLength={6} maxLength={6}
            value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} disabled={busy} />
        </Field>
        <button className="btn primary full" disabled={busy}>{busy ? "Please wait…" : "Verify my email"}</button>
        <button className="btn secondary full" type="button" disabled={busy || cooldown > 0} onClick={resend}>
          {cooldown > 0 ? `Request a new code in ${cooldown}s` : "Send a new code"}
        </button>
        <button className="text-link" type="button" disabled={busy} onClick={onBack}>Back to {codeSent ? "signup" : "login"}</button>
      </form>
    </div>
  );
}
