import { Suspense } from "react";
import Page from "@/features/JobEditor";
export default function Route() {
  return (
    <Suspense fallback={<div className="loading">Loading…</div>}>
      <Page edit />
    </Suspense>
  );
}
