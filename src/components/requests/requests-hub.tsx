"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MessageSquareText } from "lucide-react";

import { RouteGuard } from "@/components/auth/route-guard";
import { useSession } from "@/components/auth/session-provider";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { AppHeader } from "@/components/layout/app-header";
import { AppShell } from "@/components/layout/app-shell";
import { PageContainer } from "@/components/layout/page-container";
import { RequestRow } from "@/components/requests/request-row";
import { Button } from "@/components/ui/button";
import type { Listing, MaterialRequest } from "@/domain/types";
import { demoListingRepository } from "@/services/demo/listing-repository";
import { demoRequestRepository } from "@/services/demo/request-repository";

function RequestList({ direction }: { direction: "incoming" | "sent" }) {
  const { user } = useSession();
  const [state, setState] = React.useState<{
    requests: MaterialRequest[];
    listings: Map<string, Listing>;
    status: "loading" | "ready" | "error";
  }>({ requests: [], listings: new Map(), status: "loading" });

  const userId = user?.id;
  const fetchState = React.useCallback(async (): Promise<typeof state> => {
    if (!userId) return { requests: [], listings: new Map(), status: "loading" };
    try {
      const requests = await demoRequestRepository.listForUser(
        userId,
        direction,
      );
      const listings = new Map<string, Listing>();
      await Promise.all(
        [...new Set(requests.map((request) => request.listingId))].map(
          async (id) => {
            const listing = await demoListingRepository.getById(id);
            if (listing) listings.set(id, listing);
          },
        ),
      );
      return { requests, listings, status: "ready" };
    } catch {
      return { requests: [], listings: new Map(), status: "error" };
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

  if (state.status === "loading")
    return <LoadingState label="Loading requests..." rows={2} />;
  if (state.status === "error")
    return (
      <ErrorState
        description="WoodLoop could not read locally saved requests."
        onRetry={() => void fetchState().then(setState)}
      />
    );
  if (state.requests.length === 0)
    return direction === "incoming" ? (
      <EmptyState
        icon={MessageSquareText}
        title="No incoming requests yet"
        description="Requests appear here when a buyer asks about one of your active listings."
        action={
          <Button asChild>
            <Link href="/app/supplier">Back to supplier home</Link>
          </Button>
        }
      />
    ) : (
      <EmptyState
        icon={MessageSquareText}
        title="Requests are not available yet"
        description="Request coordination begins after the listing and material-detail workflow is completed. No request has been created here."
        action={
          <Button asChild>
            <Link href="/app/materials">Browse materials</Link>
          </Button>
        }
      />
    );
  return (
    <ul className="border-line bg-surface divide-line divide-y overflow-hidden rounded-lg border">
      {state.requests.map((request) => (
        <RequestRow
          key={request.id}
          request={request}
          listing={state.listings.get(request.listingId)}
          direction={direction}
        />
      ))}
    </ul>
  );
}

function RequestsHub() {
  const direction =
    useSearchParams().get("view") === "incoming" ? "incoming" : "sent";
  const workspace = direction === "incoming" ? "supplying" : "buying";
  return (
    <RouteGuard workspace={workspace}>
      <AppShell workspace={workspace}>
        <AppHeader
          title={direction === "incoming" ? "Incoming requests" : "Requests"}
        />
        <main className="py-8 lg:py-12">
          <PageContainer size="content">
            <RequestList direction={direction} />
          </PageContainer>
        </main>
      </AppShell>
    </RouteGuard>
  );
}

export { RequestsHub };
