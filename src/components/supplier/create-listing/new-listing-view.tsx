"use client";

import { useSession } from "@/components/auth/session-provider";
import { RouteGuard } from "@/components/auth/route-guard";
import { AppHeader } from "@/components/layout/app-header";
import { AppShell } from "@/components/layout/app-shell";
import { PageContainer } from "@/components/layout/page-container";
import { LoadingState } from "@/components/feedback/loading-state";
import { CreateListingWizard } from "@/components/supplier/create-listing/create-listing-wizard";

export function NewListingView() {
  const { user, status } = useSession();

  return (
    <RouteGuard workspace="supplying">
      <AppShell workspace="supplying">
        <AppHeader title="Add wood offcut" backHref="/app/supplier" />
        <main className="py-6 sm:py-8 lg:py-10">
          <PageContainer size="content">
            {status === "ready" && user ? (
              <CreateListingWizard user={user} mode="create" />
            ) : (
              <LoadingState label="Preparing listing wizard..." />
            )}
          </PageContainer>
        </main>
      </AppShell>
    </RouteGuard>
  );
}
