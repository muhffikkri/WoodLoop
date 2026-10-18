"use client";

import Link from "next/link";
import {
  Camera,
  ClipboardCheck,
  MessageSquareText,
  PackagePlus,
  Boxes,
} from "lucide-react";

import { useSession } from "@/components/auth/session-provider";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/layout/page-container";
import { MaterialCard } from "@/components/materials/material-card";
import { RequestRow } from "@/components/requests/request-row";
import { Button } from "@/components/ui/button";
import { useSupplierWorkspace } from "@/hooks/use-supplier-workspace";
import { computeSupplierStats } from "@/lib/supplier-stats";

function StatTile({
  href,
  label,
  value,
  hint,
  icon: Icon,
}: {
  href: string;
  label: string;
  value: number;
  hint: string;
  icon: typeof Boxes;
}) {
  return (
    <Link
      href={href}
      className="border-line bg-surface hover:border-brand-900/40 block rounded-lg border p-4 sm:p-5"
    >
      <div className="text-ink-600 flex items-center gap-2 text-xs font-semibold">
        <Icon aria-hidden="true" className="text-timber-600 size-4" />
        {label}
      </div>
      <p className="font-heading mt-3 text-3xl font-semibold tabular-nums">
        {value}
      </p>
      <p className="text-ink-600 mt-1 text-xs leading-5">{hint}</p>
    </Link>
  );
}

function SupplierHome() {
  const { user } = useSession();
  const { listings, requests, status, retry } = useSupplierWorkspace(user?.id);
  const stats = computeSupplierStats(listings, requests);
  const listingsById = new Map(listings.map((listing) => [listing.id, listing]));
  const subtitle = user?.organizationName ?? user?.displayName;

  return (
    <>
      <AppHeader title="Your workspace" description={subtitle} />
      <main className="py-6 lg:py-10">
        <PageContainer size="app">
          <Button asChild size="large" className="w-full sm:w-auto">
            <Link href="/app/listings/new">
              <PackagePlus aria-hidden="true" />
              Add wood offcut
            </Link>
          </Button>

          {status === "loading" ? (
            <div className="mt-6">
              <LoadingState label="Loading your workspace..." rows={3} />
            </div>
          ) : null}
          {status === "error" ? (
            <div className="mt-6">
              <ErrorState
                description="WoodLoop could not read your locally saved listings and requests."
                onRetry={() => void retry()}
              />
            </div>
          ) : null}

          {status === "ready" ? (
            <>
              <section
                aria-label="Workspace summary"
                className="mt-6 grid grid-cols-1 gap-3 min-[480px]:grid-cols-3"
              >
                <StatTile
                  href="/app/listings"
                  label="Active listings"
                  value={stats.activeListings}
                  hint="Listings currently visible to buyers."
                  icon={Boxes}
                />
                <StatTile
                  href="/app/requests?view=incoming"
                  label="Open requests"
                  value={stats.openRequests}
                  hint="New or awaiting your confirmation."
                  icon={MessageSquareText}
                />
                <StatTile
                  href="/app/listings"
                  label="Needs stock update"
                  value={stats.needsStockUpdate}
                  hint="Active, not checked in the last 14 days."
                  icon={ClipboardCheck}
                />
              </section>

              <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-10">
                <section aria-labelledby="recent-listings-title">
                  <div className="flex items-end justify-between gap-4">
                    <h2
                      id="recent-listings-title"
                      className="font-heading text-xl font-semibold"
                    >
                      Recent listings
                    </h2>
                    <Button asChild variant="text">
                      <Link href="/app/listings">View all listings</Link>
                    </Button>
                  </div>
                  <div className="mt-4">
                    {listings.length === 0 ? (
                      <EmptyState
                        title="No listings yet"
                        description="Add your first wood offcut batch so buyers can find it."
                        action={
                          <Button asChild>
                            <Link href="/app/listings/new">
                              Add wood offcut
                            </Link>
                          </Button>
                        }
                      />
                    ) : (
                      <div className="grid gap-4 sm:grid-cols-2">
                        {listings.slice(0, 2).map((listing) => (
                          <MaterialCard key={listing.id} listing={listing} />
                        ))}
                      </div>
                    )}
                  </div>
                </section>

                <section aria-labelledby="inquiries-title">
                  <h2
                    id="inquiries-title"
                    className="font-heading text-xl font-semibold"
                  >
                    Buyer inquiries
                  </h2>
                  <div className="mt-4">
                    {requests.length === 0 ? (
                      <EmptyState
                        icon={MessageSquareText}
                        title="No buyer requests yet"
                        description="Requests appear here when a buyer asks about one of your active listings."
                      />
                    ) : (
                      <>
                        <ul className="border-line bg-surface divide-line divide-y overflow-hidden rounded-lg border">
                          {requests.slice(0, 3).map((request) => (
                            <RequestRow
                              key={request.id}
                              request={request}
                              listing={listingsById.get(request.listingId)}
                              direction="incoming"
                            />
                          ))}
                        </ul>
                        <Button asChild variant="text" className="mt-2">
                          <Link href="/app/requests?view=incoming">
                            View all requests
                          </Link>
                        </Button>
                      </>
                    )}
                  </div>
                </section>
              </div>

              <aside className="border-line bg-surface mt-8 flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <Camera
                    aria-hidden="true"
                    className="text-timber-600 mt-0.5 size-5"
                  />
                  <p className="text-sm leading-6">
                    Clear photos with a ruler help buyers judge your offcuts.
                  </p>
                </div>
                <Button asChild variant="secondary">
                  <Link href="/app/guidance">Photo tips</Link>
                </Button>
              </aside>
            </>
          ) : null}
        </PageContainer>
      </main>
    </>
  );
}

export { SupplierHome };
