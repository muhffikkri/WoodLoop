import type { Metadata } from "next";
import { Suspense } from "react";

import { RouteGuard } from "@/components/auth/route-guard";
import { LoadingState } from "@/components/feedback/loading-state";
import { AppShell } from "@/components/layout/app-shell";
import { PageContainer } from "@/components/layout/page-container";
import { MyListingsView } from "@/components/supplier/my-listings/my-listings-view";

export const metadata: Metadata = {
  title: "My listings",
  description: "Manage wood offcut batch inventory, availability and reservations.",
};

export default function MyListingsPage() {
  return (
    <RouteGuard workspace="supplying">
      <AppShell workspace="supplying">
        <Suspense
          fallback={
            <main className="py-6 sm:py-8 lg:py-10">
              <PageContainer size="app">
                <LoadingState label="Loading listings..." rows={3} />
              </PageContainer>
            </main>
          }
        >
          <MyListingsView />
        </Suspense>
      </AppShell>
    </RouteGuard>
  );
}
