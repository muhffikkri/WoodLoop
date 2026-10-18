"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { useSession } from "@/components/auth/session-provider";
import { RouteGuard } from "@/components/auth/route-guard";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { AppHeader } from "@/components/layout/app-header";
import { AppShell } from "@/components/layout/app-shell";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { CreateListingWizard } from "@/components/supplier/create-listing/create-listing-wizard";
import type { Listing } from "@/domain/types";
import { demoListingRepository } from "@/services/demo/listing-repository";

export function EditListingView() {
  const params = useParams<{ id: string }>();
  const { user, status: sessionStatus } = useSession();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loadStatus, setLoadStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  useEffect(() => {
    if (!params.id) return;
    let active = true;

    demoListingRepository
      .getById(params.id)
      .then((res) => {
        if (!active) return;
        setListing(res);
        setLoadStatus("ready");
      })
      .catch(() => {
        if (!active) return;
        setLoadStatus("error");
      });

    return () => {
      active = false;
    };
  }, [params.id]);

  if (sessionStatus !== "ready" || loadStatus === "loading") {
    return (
      <RouteGuard workspace="supplying">
        <AppShell workspace="supplying">
          <AppHeader title="Edit listing" backHref="/app/supplier" />
          <main className="py-8 lg:py-12">
            <PageContainer size="content">
              <LoadingState label="Loading batch details..." />
            </PageContainer>
          </main>
        </AppShell>
      </RouteGuard>
    );
  }

  if (loadStatus === "error" || !listing) {
    return (
      <RouteGuard workspace="supplying">
        <AppShell workspace="supplying">
          <AppHeader title="Edit listing" backHref="/app/supplier" />
          <main className="py-8 lg:py-12">
            <PageContainer size="content">
              <ErrorState
                title="Listing not found"
                description="This listing could not be found or may have been deleted."
              />
              <Button asChild className="mt-4">
                <Link href="/app/supplier">Back to supplier home</Link>
              </Button>
            </PageContainer>
          </main>
        </AppShell>
      </RouteGuard>
    );
  }

  const isOwner = user?.id === listing.supplierId;
  if (!isOwner) {
    return (
      <RouteGuard workspace="supplying">
        <AppShell workspace="supplying">
          <AppHeader title="Edit listing" backHref="/app/supplier" />
          <main className="py-8 lg:py-12">
            <PageContainer size="content">
              <ErrorState
                title="Permission denied"
                description="Only the supplier who listed this batch can edit its specifications."
              />
              <Button asChild className="mt-4">
                <Link href="/app/supplier">Back to supplier home</Link>
              </Button>
            </PageContainer>
          </main>
        </AppShell>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard workspace="supplying">
      <AppShell workspace="supplying">
        <AppHeader
          title={`Edit listing · ${listing.title}`}
          backHref="/app/supplier"
        />
        <main className="py-6 sm:py-8 lg:py-10">
          <PageContainer size="content">
            <CreateListingWizard
              user={user}
              mode="edit"
              initialListing={listing}
            />
          </PageContainer>
        </main>
      </AppShell>
    </RouteGuard>
  );
}
