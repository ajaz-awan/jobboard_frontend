import { Suspense } from "react";
import Page from "@/features/Dashboard";
export default function Route() {
  return (
    <Suspense fallback={<div className="loading">Loading…</div>}>
      <Page />
    </Suspense>
  );
}
