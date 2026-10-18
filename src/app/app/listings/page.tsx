import type { Metadata } from "next";
import Link from "next/link";
import { Boxes } from "lucide-react";

import { RouteGuard } from "@/components/auth/route-guard";
import { EmptyState } from "@/components/feedback/empty-state";
import { AppHeader } from "@/components/layout/app-header";
import { AppShell } from "@/components/layout/app-shell";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "My listings" };

export default function MyListingsDependencyPage() {
  return (
    <RouteGuard workspace="supplying">
      <AppShell workspace="supplying">
        <AppHeader title="My listings" backHref="/app/supplier" />
        <main className="py-8 lg:py-12">
          <PageContainer size="content">
            <EmptyState
              icon={Boxes}
              title="Listing management is not available yet"
              description="Viewing, editing and marking batches unavailable belongs to the My Listings task. Your listings are still shown on your supplier home and in the material catalog."
              action={
                <Button asChild>
                  <Link href="/app/supplier">Back to supplier home</Link>
                </Button>
              }
            />
          </PageContainer>
        </main>
      </AppShell>
    </RouteGuard>
  );
}
