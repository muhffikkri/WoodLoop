"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";

import { useSession } from "@/components/auth/session-provider";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { Button } from "@/components/ui/button";
import type { ActiveWorkspace } from "@/domain/types";
import { roleAllowsWorkspace } from "@/services/demo/auth-routing";

function RouteGuard({
  children,
  workspace,
}: {
  children: React.ReactNode;
  workspace?: ActiveWorkspace;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const session = useSession();
  const [switchError, setSwitchError] = React.useState<string | null>(null);
  const needsWorkspaceSwitch = Boolean(
    workspace &&
    session.user?.role === "both" &&
    session.user.activeWorkspace !== workspace,
  );

  React.useEffect(() => {
    if (session.status !== "ready") return;
    if (!session.user) {
      const returnTo = `${pathname}${window.location.search}`;
      router.replace(`/login?returnTo=${encodeURIComponent(returnTo)}`);
      return;
    }
    if (workspace && needsWorkspaceSwitch) {
      void session.setWorkspace(workspace).catch(() => {
        setSwitchError(
          "WoodLoop could not switch the active workspace. Try again from your demo profile.",
        );
      });
    }
  }, [needsWorkspaceSwitch, pathname, router, session, workspace]);

  if (
    session.status === "loading" ||
    (needsWorkspaceSwitch && !switchError) ||
    (session.status === "ready" && !session.user)
  ) {
    return <LoadingState label="Checking your local demo session..." />;
  }

  if (session.status === "error") {
    return (
      <ErrorState
        title="Local demo session unavailable"
        description={session.error ?? "The session could not be loaded."}
        onRetry={() => void session.retry()}
      />
    );
  }

  if (switchError) {
    return (
      <main className="mx-auto min-h-svh max-w-xl px-4 py-16">
        <ErrorState title="Workspace switch failed" description={switchError} />
      </main>
    );
  }

  if (
    workspace &&
    session.user &&
    !roleAllowsWorkspace(session.user.role, workspace)
  ) {
    const home =
      session.user.activeWorkspace === "supplying"
        ? "/app/supplier"
        : "/app/buyer";
    return (
      <main className="grid min-h-svh place-items-center px-4 py-12">
        <div className="border-line bg-surface w-full max-w-lg rounded-lg border p-6 sm:p-8">
          <LockKeyhole aria-hidden="true" className="text-timber-600 size-7" />
          <h1 className="font-heading mt-5 text-2xl font-semibold">
            This workspace is not enabled
          </h1>
          <p className="text-ink-600 mt-3 leading-7">
            The active local demo profile does not include this role. Choose
            another demo profile or return to its workspace.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href={home}>Go to my workspace</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/app/profile">Change demo profile</Link>
            </Button>
          </div>
          <p className="text-ink-600 mt-5 text-xs">
            Client-side role guards are demo UX safeguards, not production
            authorization.
          </p>
        </div>
      </main>
    );
  }

  return children;
}

export { RouteGuard };
