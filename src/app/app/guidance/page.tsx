import type { Metadata } from "next";
import { Suspense } from "react";

import { LoadingState } from "@/components/feedback/loading-state";
import { PhotoGuidance } from "@/components/supplier/photo-guidance";

export const metadata: Metadata = {
  title: "Photograph your offcuts clearly",
  description:
    "Photo tips for listing wood offcuts: light, whole batch, visible damage, and a ruler for scale.",
};

export default function GuidancePage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-3xl px-4 py-10">
          <LoadingState label="Loading photo guidance..." rows={2} />
        </main>
      }
    >
      <PhotoGuidance />
    </Suspense>
  );
}
