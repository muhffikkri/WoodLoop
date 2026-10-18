"use client";

import Link from "next/link";
import { ArrowRight, Boxes, Hammer } from "lucide-react";

import { useSession } from "@/components/auth/session-provider";
import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/layout/page-container";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { ActiveWorkspace } from "@/domain/types";

function WorkspaceHome({ workspace }: { workspace: ActiveWorkspace }) {
  const { user } = useSession();
  const buying = workspace === "buying";
  return (
    <>
      <AppHeader
        title={buying ? "Buyer home" : "Supplier home"}
        description="Local demo workspace"
      />
      <main className="py-8 lg:py-12">
        <PageContainer size="app">
          <div className="max-w-3xl">
            <p className="text-timber-600 text-sm font-semibold">
              {buying ? "Buying workspace" : "Supplying workspace"}
            </p>
            <h1 className="font-heading mt-2 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
              Welcome, {user?.displayName ?? "WoodLoop user"}.
            </h1>
            <p className="text-ink-600 mt-4 max-w-2xl leading-7">
              {buying
                ? "Your local buyer session is ready. Continue to the public material preview while the full buyer home is built in its page task."
                : "Your local supplier session is ready. Your listing intent is preserved, while the full supplier dashboard is built in its page task."}
            </p>
            <Alert className="mt-6 max-w-2xl">
              Demo mode — this identity and its future marketplace data stay on
              this browser only.
            </Alert>
            <div className="mt-8 border-line bg-surface rounded-lg border p-6 sm:p-8">
              {buying ? (
                <Boxes aria-hidden="true" className="text-timber-600 size-7" />
              ) : (
                <Hammer aria-hidden="true" className="text-timber-600 size-7" />
              )}
              <h2 className="font-heading mt-5 text-xl font-semibold">
                {buying ? "Browse material preview" : "Continue listing intent"}
              </h2>
              <p className="text-ink-600 mt-2 leading-6">
                {buying
                  ? "The full searchable catalog belongs to the next marketplace milestone."
                  : "The multi-step listing form is intentionally not implemented by this authentication task."}
              </p>
              <Button asChild className="mt-6">
                <Link href={buying ? "/app/materials" : "/app/listings/new"}>
                  {buying ? "Explore materials" : "Continue to listing status"}
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </PageContainer>
      </main>
    </>
  );
}

export { WorkspaceHome };
