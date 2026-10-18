import type { Metadata } from "next";
import { Suspense } from "react";

import { LoadingState } from "@/components/feedback/loading-state";
import { MaterialCatalog } from "@/components/materials/material-catalog";

export const metadata: Metadata = {
  title: "Explore materials",
  description:
    "Browse clean production wood offcuts with supplier-declared dimensions, quantities, and areas.",
};

export default function MaterialsPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-5xl px-4 py-10">
          <LoadingState label="Loading material catalog..." rows={3} />
        </main>
      }
    >
      <MaterialCatalog />
    </Suspense>
  );
}
