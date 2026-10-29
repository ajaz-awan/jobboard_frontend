import type { Metadata } from "next";
export const metadata: Metadata = { title: "Privacy notice" };
import Link from "next/link";
export default function Page() {
  const contact = process.env.SITE_CONTACT_EMAIL?.trim();
  const operator = process.env.SITE_OPERATOR_NAME?.trim() || "Jobboard";
  return (
    <main id="main" className="container prose-page">
      <Link className="back-link" href="/">
        ← Back to jobboard
      </Link>
      <div className="eyebrow">A THOUGHTFUL PLACE TO MOVE FORWARD</div>
      <h1>Your next move stays yours.</h1>
      <section>
        <h2>What the service uses</h2>
        <p>
          Your account stores your name, email, role, and company details where
          applicable. Applications include your PDF resume and optional cover
          letter. Account sessions, notifications, saved jobs, reports, and
          administrative audit records support the service.
        </p>
      </section>
      <section>
        <h2>Who can access your resume</h2>
        <p>
          The API permits resume downloads by the applicant and the employer
          responsible for the listing. Resumes are not public links. Job
          listings and company logos are intended for display to other users.
        </p>
      </section>
      <section>
        <h2>Your controls</h2>
        <p>
          You can change your password, review and revoke sessions, sign out all
          devices, remove saved jobs, and withdraw pending applications.
          Withdrawing preserves application history. Changing passwords
          invalidates existing sessions.
        </p>
      </section>
      <section>
        <h2>Questions and support</h2>
        <p>
          {operator} operates this service. For account, privacy or data requests,
          {contact ? <> contact <a href={`mailto:${contact}`}>{contact}</a>.</> : " contact the person or team that provided access to this service."}
        </p>
      </section>
      <Link href="/register" className="btn primary">
        Find your next chapter →
      </Link>
    </main>
  );
}
