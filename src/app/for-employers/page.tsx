import type { Metadata } from "next";
export const metadata: Metadata = { title: "Hire your next teammate" };
import Link from "next/link";
export default function Page() {
  return (
    <main id="main" className="container prose-page">
      <Link className="back-link" href="/">
        ← Back to jobboard
      </Link>
      <div className="eyebrow">A THOUGHTFUL PLACE TO MOVE FORWARD</div>
      <h1>Build a team that makes a difference.</h1>
      <section>
        <h2>Invite the right people</h2>
        <p>
          Create an employer account, verify your email, and post a clear job
          listing with the skills, salary, and work style your team offers.
        </p>
      </section>
      <section>
        <h2>Hiring, with a clearer view</h2>
        <p>
          Manage open and closed listings, review private PDF resumes and cover
          letters, and communicate decisions through application updates.
        </p>
      </section>
      <section>
        <h2>Quality takes a little care</h2>
        <p>
          New listings and content edits are reviewed by an administrator.
          Candidates only see available, approved roles. Final application
          decisions cannot be reversed.
        </p>
      </section>
      <Link href="/register" className="btn primary">
        Find your next chapter →
      </Link>
    </main>
  );
}
