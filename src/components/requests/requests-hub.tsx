"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Inbox, Send } from "lucide-react";

import { RouteGuard } from "@/components/auth/route-guard";
import { useSession } from "@/components/auth/session-provider";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { AppHeader } from "@/components/layout/app-header";
import { AppShell } from "@/components/layout/app-shell";
import { PageContainer } from "@/components/layout/page-container";
import { RequestRow } from "@/components/requests/request-row";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Listing, MaterialRequest, User } from "@/domain/types";
import { demoListingRepository } from "@/services/demo/listing-repository";
import { demoRequestRepository } from "@/services/demo/request-repository";
import { demoSessionService } from "@/services/demo/session-service";

function RequestList({
  direction,
  userId,
  listingId,
}: {
  direction: "incoming" | "sent";
  userId: string;
  listingId?: string | null;
}) {
  const [state, setState] = React.useState<{
    requests: MaterialRequest[];
    listings: Map<string, Listing>;
    counterparties: Map<string, User>;
    status: "loading" | "ready" | "error";
  }>({
    requests: [],
    listings: new Map(),
    counterparties: new Map(),
    status: "loading",
  });

  const fetchState = React.useCallback(async (): Promise<typeof state> => {
    try {
      const requests = await demoRequestRepository.listForUser(
        userId,
        direction,
      );

      const listings = new Map<string, Listing>();
      const counterparties = new Map<string, User>();

      await Promise.all([
        ...[...new Set(requests.map((r) => r.listingId))].map(async (id) => {
          const listing = await demoListingRepository.getById(id);
          if (listing) listings.set(id, listing);
        }),
        ...[
          ...new Set(
            requests.map((r) => (direction === "incoming" ? r.buyerId : r.supplierId)),
          ),
        ].map(async (cId) => {
          const user = await demoSessionService.getUserById(cId);
          if (user) counterparties.set(cId, user);
        }),
      ]);

      return { requests, listings, counterparties, status: "ready" };
    } catch {
      return {
        requests: [],
        listings: new Map(),
        counterparties: new Map(),
        status: "error",
      };
    }
  }, [direction, userId]);

  React.useEffect(() => {
    let active = true;
    const refresh = () =>
      void fetchState().then((next) => {
        if (active) setState(next);
      });

    refresh();
    window.addEventListener("woodloop:requests-changed", refresh);
    return () => {
      active = false;
      window.removeEventListener("woodloop:requests-changed", refresh);
    };
  }, [fetchState]);

  if (state.status === "loading") {
    return <LoadingState label="Loading requests..." rows={3} />;
  }

  if (state.status === "error") {
    return (
      <ErrorState
        description="WoodLoop could not read locally saved requests."
        onRetry={() => void fetchState().then(setState)}
      />
    );
  }

  const displayedRequests = listingId
    ? state.requests.filter((r) => r.listingId === listingId)
    : state.requests;
  const filteredListing = listingId ? state.listings.get(listingId) : null;

  if (displayedRequests.length === 0) {
    if (listingId) {
      return (
        <EmptyState
          icon={Inbox}
          title="No inquiries for this listing"
          description={
            filteredListing
              ? `There are no incoming requests for "${filteredListing.title}" yet.`
              : "There are no incoming requests for this batch yet."
          }
          action={
            <Button asChild variant="secondary">
              <Link href={`/app/requests?view=${direction}`}>
                View all inquiries
              </Link>
            </Button>
          }
        />
      );
    }

    return direction === "incoming" ? (
      <EmptyState
        icon={Inbox}
        title="No incoming requests yet"
        description="Requests appear here when a buyer asks about one of your active listings."
        action={
          <Button asChild>
            <Link href="/app/supplier">Go to supplier dashboard</Link>
          </Button>
        }
      />
    ) : (
      <EmptyState
        icon={Send}
        title="You haven't requested any materials"
        description="When you inquire about timber offcuts, your requests and supplier communications appear here."
        action={
          <Button asChild>
            <Link href="/app/materials">Browse materials</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      {listingId ? (
        <div className="bg-sage-100 border-line text-ink-900 flex items-center justify-between rounded-lg border px-3.5 py-2 text-xs">
          <span>
            Filtered by:{" "}
            <strong>{filteredListing?.title ?? listingId}</strong>
          </span>
          <Link
            href={`/app/requests?view=${direction}`}
            className="text-brand-900 hover:underline font-semibold"
          >
            Clear filter
          </Link>
        </div>
      ) : null}
      <ul className="border-line bg-surface divide-line divide-y overflow-hidden rounded-lg border">
        {displayedRequests.map((request) => {
          const counterpartyId =
            direction === "incoming" ? request.buyerId : request.supplierId;
          return (
            <RequestRow
              key={request.id}
              request={request}
              listing={state.listings.get(request.listingId)}
              counterparty={state.counterparties.get(counterpartyId)}
              direction={direction}
            />
          );
        })}
      </ul>
    </div>
  );
}

function RequestsHub() {
  const searchParams = useSearchParams();
  const { user } = useSession();
  const [counts, setCounts] = React.useState<{ incoming: number; sent: number }>({
    incoming: 0,
    sent: 0,
  });

  const userId = user?.id;

  // Derive active direction from param or default by workspace
  const paramView = searchParams.get("view");
  const paramListingId = searchParams.get("listingId");
  const direction: "incoming" | "sent" =
    paramView === "incoming"
      ? "incoming"
      : paramView === "sent"
        ? "sent"
        : user?.activeWorkspace === "supplying"
          ? "incoming"
          : "sent";

  // Load counts for both tabs
  React.useEffect(() => {
    if (!userId) return;
    let active = true;

    async function loadCounts() {
      try {
        const [incomingList, sentList] = await Promise.all([
          demoRequestRepository.listForUser(userId!, "incoming"),
          demoRequestRepository.listForUser(userId!, "sent"),
        ]);
        if (active) {
          setCounts({
            incoming: incomingList.length,
            sent: sentList.length,
          });
        }
      } catch {
        // keep fallback counts
      }
    }

    void loadCounts();
    window.addEventListener("woodloop:requests-changed", loadCounts);
    return () => {
      active = false;
      window.removeEventListener("woodloop:requests-changed", loadCounts);
    };
  }, [userId]);

  const workspace = direction === "incoming" ? "supplying" : "buying";
  const showIncomingTab = user?.role === "both" || user?.role === "supplier";
  const showSentTab = user?.role === "both" || user?.role === "buyer";

  return (
    <RouteGuard workspace={workspace}>
      <AppShell workspace={workspace}>
        <AppHeader title="Requests & coordination" />
        <main className="py-6 sm:py-8 lg:py-10">
          <PageContainer size="content">
            {/* Header explanation */}
            <div className="mb-6">
              <h2 className="font-heading text-xl sm:text-2xl font-semibold text-ink-900">
                Material requests
              </h2>
              <p className="text-ink-600 mt-1 text-sm">
                Coordinate offcut availability, agreed terms, and physical handover.
              </p>
            </div>

            {/* Navigation Tabs */}
            {(showIncomingTab && showSentTab) ? (
              <div className="border-b border-line mb-6 flex items-center gap-2">
                <Link
                  href="/app/requests?view=incoming"
                  className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                    direction === "incoming"
                      ? "border-brand-900 text-brand-900 font-semibold"
                      : "border-transparent text-ink-600 hover:text-ink-900 hover:border-timber-300"
                  }`}
                >
                  <Inbox aria-hidden="true" className="size-4" />
                  <span>Incoming</span>
                  {counts.incoming > 0 ? (
                    <Badge
                      variant={direction === "incoming" ? "available" : "unverified"}
                      className="ml-1 text-[11px] px-1.5 py-0"
                    >
                      {counts.incoming}
                    </Badge>
                  ) : null}
                </Link>

                <Link
                  href="/app/requests?view=sent"
                  className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                    direction === "sent"
                      ? "border-brand-900 text-brand-900 font-semibold"
                      : "border-transparent text-ink-600 hover:text-ink-900 hover:border-timber-300"
                  }`}
                >
                  <Send aria-hidden="true" className="size-4" />
                  <span>Sent</span>
                  {counts.sent > 0 ? (
                    <Badge
                      variant={direction === "sent" ? "available" : "unverified"}
                      className="ml-1 text-[11px] px-1.5 py-0"
                    >
                      {counts.sent}
                    </Badge>
                  ) : null}
                </Link>
              </div>
            ) : null}

            {/* Request List */}
            {userId ? (
              <RequestList
                direction={direction}
                userId={userId}
                listingId={paramListingId}
              />
            ) : (
              <LoadingState label="Checking user session..." />
            )}
          </PageContainer>
        </main>
      </AppShell>
    </RouteGuard>
  );
}

export { RequestsHub };
