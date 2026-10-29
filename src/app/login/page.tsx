import { Suspense } from "react";
import Page from "@/features/Auth";
export default function Route() {
  return (
    <Suspense fallback={<div className="loading">Loading…</div>}>
      <Page mode="login" />
    </Suspense>
  );
}
