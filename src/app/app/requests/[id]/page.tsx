import { Suspense } from "react";

import { RouteGuard } from "@/components/auth/route-guard";
import { LoadingState } from "@/components/feedback/loading-state";
import { RequestDetail } from "@/components/requests/request-detail";

export default function RequestDetailPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-3xl px-4 py-10">
          <LoadingState label="Loading request..." rows={2} />
        </main>
      }
    >
      <RouteGuard>
        <RequestDetail />
      </RouteGuard>
    </Suspense>
  );
}
