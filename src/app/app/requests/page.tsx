import { Suspense } from "react";

import { LoadingState } from "@/components/feedback/loading-state";
import { RequestsHub } from "@/components/requests/requests-hub";

export default function RequestsPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-3xl px-4 py-10">
          <LoadingState label="Loading requests..." rows={2} />
        </main>
      }
    >
      <RequestsHub />
    </Suspense>
  );
}
