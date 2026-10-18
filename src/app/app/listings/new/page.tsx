import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardList } from "lucide-react";

import { RouteGuard } from "@/components/auth/route-guard";
import { AppHeader } from "@/components/layout/app-header";
import { AppShell } from "@/components/layout/app-shell";
import { PageContainer } from "@/components/layout/page-container";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Add wood offcut" };

export default function NewListingDependencyPage() {
  return (
    <RouteGuard workspace="supplying">
      <AppShell workspace="supplying">
        <AppHeader title="Add wood offcut" backHref="/app/supplier" />
        <main className="py-8 lg:py-12">
          <PageContainer size="content">
            <div className="border-line bg-surface rounded-lg border p-6 sm:p-8">
              <ClipboardList
                aria-hidden="true"
                className="text-timber-600 size-8"
              />
              <h1 className="font-heading mt-5 text-2xl font-semibold">
                Your supplier intent was preserved
              </h1>
              <p className="text-ink-600 mt-3 leading-7">
                Authentication and role access are ready. The photo-and-details
                listing workflow belongs to its later page task and has not been
                simulated here.
              </p>
              <Alert className="mt-5">
                No listing has been created or published by reaching this page.
              </Alert>
              <Button asChild className="mt-6">
                <Link href="/app/supplier">Return to supplier home</Link>
              </Button>
            </div>
          </PageContainer>
        </main>
      </AppShell>
    </RouteGuard>
  );
}
