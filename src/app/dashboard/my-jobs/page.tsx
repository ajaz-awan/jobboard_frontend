import { Suspense } from "react";
import { MyJobsPage as Page } from "@/features/Dashboard";
export default function Route() {
  return (
    <Suspense fallback={<div className="loading">Loading…</div>}>
      <Page />
    </Suspense>
  );
}
