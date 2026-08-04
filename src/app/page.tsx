// src/app/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6">
      <span className="font-mono text-xs tracking-widest uppercase text-[var(--accent)] mb-4">
        Faisalabad · Pakistan
      </span>
      <h1 className="font-display text-4xl md:text-5xl font-bold text-[var(--ink)] mb-4 max-w-2xl">
        Find your next job, or your next hire.
      </h1>
      <p className="text-[var(--ink-muted)] max-w-md mb-8">
        A simple job board connecting candidates and employers — post jobs,
        apply with your resume, and track everything in one place.
      </p>
      <div className="flex gap-4">
        <Link
          href="/jobs"
          className="bg-[var(--primary)] text-white px-6 py-3 rounded-md font-medium hover:bg-[var(--primary-hover)] transition-colors"
        >
          Browse Jobs
        </Link>
        <Link
          href="/register"
          className="bg-[var(--paper-raised)] border border-[var(--line)] text-[var(--ink)] px-6 py-3 rounded-md font-medium hover:bg-[var(--paper)] transition-colors"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
}