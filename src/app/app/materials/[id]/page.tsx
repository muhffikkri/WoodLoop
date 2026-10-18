import type { Metadata } from "next";
import { Suspense } from "react";

import { LoadingState } from "@/components/feedback/loading-state";
import { MaterialDetail } from "@/components/materials/material-detail";

export const metadata: Metadata = {
  title: "Material details",
  description:
    "Supplier-confirmed wood offcut details, measurements, and request coordination.",
};

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
