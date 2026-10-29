import { Suspense } from "react";
import { NotificationsPage as Page } from "@/features/Dashboard";
export default function Route() {
  return (
    <Suspense fallback={<div className="loading">Loading…</div>}>
      <Page />
    </Suspense>
  );
}
