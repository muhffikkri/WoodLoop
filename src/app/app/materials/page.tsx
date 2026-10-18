import { Suspense } from "react";

import { LoadingState } from "@/components/feedback/loading-state";
import { MaterialCatalog } from "@/components/materials/material-catalog";

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
