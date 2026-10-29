import type { Metadata } from "next";
export const metadata: Metadata = { title: "About Jobboard" };
import Link from "next/link";
export default function Page() {
  return (
    <main id="main" className="container prose-page">
      <Link className="back-link" href="/">
        ← Back to jobboard
      </Link>
      <div className="eyebrow">A THOUGHTFUL PLACE TO MOVE FORWARD</div>
      <h1>Good work starts with a good connection.</h1>
      <section>
        <h2>A place for your next chapter</h2>
        <p>
          Jobboard connects candidates and employers through focused job search,
          private resume applications, and a clear view of the hiring process.
        </p>
      </section>
      <section>
        <h2>Thoughtful by design</h2>
        <p>
          Filter by work style, experience, location, and salary. Save
          opportunities, track applications, and keep account sessions under
          your control.
        </p>
      </section>
      <section>
        <h2>A community with care</h2>
        <p>
          Listings are reviewed before publication. Candidates can report
          suspicious jobs, and administrators can review reports and moderate
          listings. Review is not a guarantee of a company’s identity; always
          make your own checks.
        </p>
      </section>
      <Link href="/register" className="btn primary">
        Find your next chapter →
      </Link>
    </main>
  );
}
