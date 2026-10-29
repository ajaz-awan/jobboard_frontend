import { Suspense } from "react";
import Page from "@/features/Admin";
export default function Route() {
  return (
    <Suspense fallback={<div className="loading">Loading…</div>}>
      <Page />
    </Suspense>
  );
}
