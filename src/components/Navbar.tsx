// src/components/Navbar.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <nav className="bg-[var(--paper-raised)] border-b border-[var(--line)] px-6 py-4 sticky top-0 z-20">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="font-display text-xl font-bold text-[var(--ink)]">
          Job<span className="text-[var(--accent)]">Board</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/jobs"
            className="text-sm font-medium text-[var(--ink-muted)] hover:text-[var(--primary)] transition-colors"
          >
            Browse Jobs
          </Link>

          {loading ? null : user ? (
            <>
              {user.role === "employer" && (
                <>
                  <Link
                    href="/dashboard/my-jobs"
                    className="text-sm font-medium text-[var(--ink-muted)] hover:text-[var(--primary)] transition-colors"
                  >
                    My Jobs
                  </Link>
                  <Link
                    href="/dashboard/post-job"
                    className="text-sm font-medium text-[var(--ink-muted)] hover:text-[var(--primary)] transition-colors"
                  >
                    Post a Job
                  </Link>
                </>
              )}
              {user.role === "candidate" && (
                <Link
                  href="/dashboard/applications"
                  className="text-sm font-medium text-[var(--ink-muted)] hover:text-[var(--primary)] transition-colors"
                >
                  My Applications
                </Link>
              )}

              <span className="font-mono text-xs text-[var(--ink-muted)] hidden sm:inline">
                {user.name}
              </span>

              <button
                onClick={handleLogout}
                className="text-sm font-medium px-4 py-1.5 rounded-md border border-[var(--line)] text-[var(--ink)] hover:bg-[var(--paper)] transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-[var(--ink-muted)] hover:text-[var(--primary)] transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="text-sm font-medium px-4 py-1.5 rounded-md bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}