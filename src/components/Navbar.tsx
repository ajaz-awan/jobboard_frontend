"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Icon from "./Icon";
import ThemeToggle from "./ThemeToggle";
import { errorMessage } from "@/lib/api";
export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <Link href="/" className="brand" aria-label="Jobboard home">
            <span className="brand-symbol">
              j<span>↗</span>
            </span>
            jobboard<span className="brand-dot">.</span>
          </Link>
          <nav className="desktop-nav" aria-label="Main navigation">
            <Link
              className={pathname === "/jobs" ? "selected" : ""}
              href="/jobs"
            >
              Find a job
            </Link>
            <Link href="/for-employers">For employers</Link>
            <Link href="/about">Why jobboard?</Link>
          </nav>
          <div className="header-actions">
            <ThemeToggle />
            {user ? (
              <>
                <Link
                  href="/dashboard/notifications"
                  className="icon-btn"
                  aria-label="Notifications"
                >
                  <Icon name="bell" />
                </Link>
                <Link href="/dashboard" className="btn primary small workspace-link" aria-label="My workspace">
                  <span className="workspace-link-label">My workspace</span> <Icon name="arrow" size={16} />
                </Link>
                <button
                  className="icon-btn desktop-logout"
                  aria-label="Sign out"
                  onClick={async () => {
                    try {
                      await logout();
                      router.push("/");
                    } catch (e) {
                      setError(errorMessage(e));
                    }
                  }}
                >
                  <Icon name="logout" />
                </button>
              </>
            ) : (
              <>
                <Link className="login-link" href="/login">
                  {loading ? "Sign in" : "Log in"}
                </Link>
                <Link href="/register" className="btn primary small">
                  Get started <Icon name="arrow" size={16} />
                </Link>
              </>
            )}
            <button
              className="icon-btn mobile-toggle"
              aria-label="Toggle navigation"
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              <Icon name={open ? "close" : "menu"} />
            </button>
          </div>
        </div>
        {open && (
          <nav
            className="mobile-nav"
            aria-label="Mobile navigation"
            onClick={() => setOpen(false)}
          >
            <Link href="/jobs">Find a job</Link>
            <Link href="/for-employers">For employers</Link>
            <Link href="/about">Why jobboard?</Link>
            {!user && <Link href="/login">Log in</Link>}
            {user && (
              <>
                <Link href="/dashboard">My workspace</Link>
                <button
                  onClick={async () => {
                    try {
                      await logout();
                      router.push("/");
                    } catch (e) {
                      setError(errorMessage(e));
                    }
                  }}
                >
                  Sign out
                </button>
              </>
            )}
          </nav>
        )}
      </header>
      {error && (
        <div className="alert" role="alert">
          {error}
          <button
            className="icon-btn"
            aria-label="Dismiss"
            onClick={() => setError("")}
          >
            <Icon name="close" size={15} />
          </button>
        </div>
      )}
    </>
  );
}
