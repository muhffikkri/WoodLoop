"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/feedback/error-state";
import { PageContainer } from "@/components/layout/page-container";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="py-12">
      <PageContainer size="content">
        <ErrorState onRetry={reset} />
      </PageContainer>
    </main>
  );
}
