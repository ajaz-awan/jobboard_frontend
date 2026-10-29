import type { Metadata } from "next";
export const metadata: Metadata = { title: "Terms of use" };
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
      <h1>A good community starts with respect.</h1>
      <section>
        <h2>Candidates</h2>
        <p>
          Provide accurate information. Only upload a resume you are entitled to
          share. Do not send passwords, bank credentials, or identity documents
          in cover letters.
        </p>
      </section>
      <section>
        <h2>Employers</h2>
        <p>
          Publish genuine opportunities with accurate responsibilities and
          expectations. Do not request payment to apply. Treat applicant
          information confidentially and use it only for recruitment.
        </p>
      </section>
      <section>
        <h2>Community standards</h2>
        <p>
          Scams, spam, discrimination, and misleading listings may be reported
          and moderated. Account access may be suspended by administrators. A
          reviewed listing is not a guarantee of employment or an endorsement.
        </p>
      </section>
      <section>
        <h2>Questions and support</h2>
        <p>
          {operator} operates this service. For account, listing concerns or disputes,
          {contact ? <> contact <a href={`mailto:${contact}`}>{contact}</a>.</> : " contact the person or team that provided access to this service."}
        </p>
      </section>
      <Link href="/register" className="btn primary">
        Find your next chapter →
      </Link>
    </main>
  );
}
