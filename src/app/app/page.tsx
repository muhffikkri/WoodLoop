"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { useSession } from "@/components/auth/session-provider";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";

export default function AppEntryPage() {
  const router = useRouter();
  const session = useSession();

  React.useEffect(() => {
    if (session.status !== "ready") return;
    if (!session.user) {
      router.replace("/login?returnTo=%2Fapp");
      return;
    }
    router.replace(
      session.user.activeWorkspace === "supplying"
        ? "/app/supplier"
        : "/app/buyer",
    );
  }, [router, session.status, session.user]);

  if (session.status === "error") {
    return (
      <main className="mx-auto min-h-svh max-w-xl px-4 py-16">
        <ErrorState
          description={session.error ?? undefined}
          onRetry={() => void session.retry()}
        />
      </main>
    );
  }
  return (
    <main className="mx-auto min-h-svh max-w-xl px-4 py-16">
      <LoadingState label="Opening your WoodLoop workspace..." rows={2} />
    </main>
  );
}
