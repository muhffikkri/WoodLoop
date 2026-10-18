import { Suspense } from "react";

import { LoadingState } from "@/components/feedback/loading-state";
import { MaterialDetail } from "@/components/materials/material-detail";

export default function MaterialDetailPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-5xl px-4 py-10">
          <LoadingState label="Loading material details..." rows={2} />
        </main>
      }
    >
      <MaterialDetail />
    </Suspense>
  );
}
