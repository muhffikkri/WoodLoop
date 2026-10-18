"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { useSession } from "@/components/auth/session-provider";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/layout/page-container";
import { formatRequestStatus } from "@/components/requests/request-row";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { Listing, MaterialRequest } from "@/domain/types";
import { demoListingRepository } from "@/services/demo/listing-repository";
import { demoRequestRepository } from "@/services/demo/request-repository";

function RequestDetail() {
  const params = useParams<{ id: string }>();
  const { user } = useSession();
  const [state, setState] = React.useState<{
    request: MaterialRequest | null;
    listing: Listing | null;
    status: "loading" | "ready" | "error";
  }>({ request: null, listing: null, status: "loading" });

  const fetchState = React.useCallback(async (): Promise<typeof state> => {
    try {
      const request = await demoRequestRepository.getById(params.id);
      const listing = request
        ? await demoListingRepository.getById(request.listingId)
        : null;
      return { request, listing, status: "ready" };
    } catch {
      return { request: null, listing: null, status: "error" };
    }
  }, [params.id]);

  React.useEffect(() => {
    let active = true;
    void fetchState().then((next) => {
      if (active) setState(next);
    });
    return () => {
      active = false;
    };
  }, [fetchState]);

  const backHref =
    user && state.request?.supplierId === user.id
      ? "/app/requests?view=incoming"
      : "/app/requests";
  const allowed =
    !user ||
    !state.request ||
    state.request.supplierId === user.id ||
    state.request.buyerId === user.id;

  return (
    <>
      <AppHeader title="Request details" backHref={backHref} />
      <main className="py-6 lg:py-10">
        <PageContainer size="content">
          {state.status === "loading" ? (
            <LoadingState label="Loading request..." rows={2} />
          ) : null}
          {state.status === "error" ? (
            <ErrorState onRetry={() => void fetchState().then(setState)} />
          ) : null}
          {state.status === "ready" && (!state.request || !allowed) ? (
            <ErrorState
              title="Request not found"
              description="This request may have been reset, or it belongs to another demo profile."
            />
          ) : null}
          {state.status === "ready" && state.request && allowed ? (
            <>
              <h2 className="font-heading text-2xl font-semibold">
                {state.listing?.title ?? "Material batch"}
              </h2>
              <dl className="border-line mt-5 grid divide-y border-y text-sm">
                <div className="grid grid-cols-[9rem_1fr] gap-4 py-3">
                  <dt className="text-ink-600">Status</dt>
                  <dd>{formatRequestStatus(state.request.status)}</dd>
                </div>
                <div className="grid grid-cols-[9rem_1fr] gap-4 py-3">
                  <dt className="text-ink-600">Quantity</dt>
                  <dd className="tabular-nums">
                    {state.request.requestedQuantity} {state.request.unit}
                  </dd>
                </div>
                <div className="grid grid-cols-[9rem_1fr] gap-4 py-3">
                  <dt className="text-ink-600">Handover</dt>
                  <dd>
                    {state.request.fulfillmentMethod === "pickup"
                      ? "Pickup"
                      : "Delivery to discuss"}
                  </dd>
                </div>
                <div className="grid grid-cols-[9rem_1fr] gap-4 py-3">
                  <dt className="text-ink-600">Message</dt>
                  <dd>{state.request.message}</dd>
                </div>
              </dl>
              <Alert className="mt-6">
                Responding, confirming quantities and messaging belong to the
                Requests task and are not available yet.
              </Alert>
              {state.listing ? (
                <Button asChild variant="secondary" className="mt-5">
                  <Link href={`/app/materials/${state.listing.id}`}>
                    View material
                  </Link>
                </Button>
              ) : null}
            </>
          ) : null}
        </PageContainer>
      </main>
    </>
  );
}

export { RequestDetail };
