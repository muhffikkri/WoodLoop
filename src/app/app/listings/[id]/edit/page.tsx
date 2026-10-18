import type { Metadata } from "next";
import { Suspense } from "react";

import { LoadingState } from "@/components/feedback/loading-state";
import { EditListingView } from "@/components/supplier/create-listing/edit-listing-view";

export const metadata: Metadata = {
  title: "Edit listing",
  description: "Update supplier-confirmed specifications and availability.",
};

export default function EditListingPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-3xl px-4 py-10">
          <LoadingState label="Loading listing..." />
        </main>
      }
    >
      <EditListingView />
    </Suspense>
  );
}
