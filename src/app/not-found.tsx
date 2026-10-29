import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="container empty">
      <div className="eyebrow">A SMALL DETOUR</div>
      <h1>Let’s get you back on track.</h1>
      <p>This page doesn’t exist, but your next opportunity might.</p>
      <Link href="/" className="btn primary">
        Back to jobboard →
      </Link>
    </main>
  );
}
