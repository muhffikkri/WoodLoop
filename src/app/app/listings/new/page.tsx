import type { Metadata } from "next";
import { Suspense } from "react";

import { LoadingState } from "@/components/feedback/loading-state";
import { NewListingView } from "@/components/supplier/create-listing/new-listing-view";

export const metadata: Metadata = {
  title: "Add wood offcut",
  description:
    "Upload clean solid wood offcuts, enter confirmed specifications, and publish to the circular marketplace.",
};

export default function NewListingPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-3xl px-4 py-10">
          <LoadingState label="Loading listing wizard..." />
        </main>
      }
    >
      <NewListingView />
    </Suspense>
  );
}
