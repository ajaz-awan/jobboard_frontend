"use client";
import Link from "next/link";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="container empty">
      <h1>A little interruption.</h1>
      <p>Something went wrong loading this page.</p>
      <div className="actions">
        <button className="btn primary" onClick={reset}>
          Try again
        </button>
        <Link className="btn secondary" href="/dashboard">
          Back to workspace
        </Link>
      </div>
    </main>
  );
}
