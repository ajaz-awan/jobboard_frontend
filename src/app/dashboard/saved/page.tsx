import { Suspense } from "react";
import { SavedJobs as Page } from "@/features/Jobs";
export default function Route() {
  return (
    <Suspense fallback={<div className="loading">Loading…</div>}>
      <Page />
    </Suspense>
  );
}
