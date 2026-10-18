"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowUpRight,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Package,
  Truck,
} from "lucide-react";

import { useSession } from "@/components/auth/session-provider";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/layout/page-container";
import { RequestActions } from "@/components/requests/request-actions";
import {
  formatRequestStatus,
  statusBadgeVariant,
} from "@/components/requests/request-row";
import { RequestThread } from "@/components/requests/request-thread";
import { RequestTimeline } from "@/components/requests/request-timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Listing, MaterialRequest, User } from "@/domain/types";
import { formatDimensions, formatWoodForm } from "@/lib/listing-format";
import { demoListingRepository } from "@/services/demo/listing-repository";
import { listingPhoto } from "@/services/demo/demo-listings";
import { demoRequestRepository } from "@/services/demo/request-repository";
import { demoSessionService } from "@/services/demo/session-service";

function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}

function RequestDetail() {
  const params = useParams<{ id: string }>();
  const { user } = useSession();

  const [state, setState] = React.useState<{
    request: MaterialRequest | null;
    listing: Listing | null;
    buyer: User | null;
    supplier: User | null;
    status: "loading" | "ready" | "error";
  }>({
    request: null,
    listing: null,
    buyer: null,
    supplier: null,
    status: "loading",
  });

  const requestId = params?.id;

  const fetchState = React.useCallback(async (): Promise<typeof state> => {
    if (!requestId) {
      return {
        request: null,
        listing: null,
        buyer: null,
        supplier: null,
        status: "ready",
      };
    }

    try {
      const request = await demoRequestRepository.getById(requestId);
      if (!request) {
        return {
          request: null,
          listing: null,
          buyer: null,
          supplier: null,
          status: "ready",
        };
      }

      const [listing, buyer, supplier] = await Promise.all([
        demoListingRepository.getById(request.listingId),
        demoSessionService.getUserById(request.buyerId),
        demoSessionService.getUserById(request.supplierId),
      ]);

      return { request, listing, buyer, supplier, status: "ready" };
    } catch {
      return {
        request: null,
        listing: null,
        buyer: null,
        supplier: null,
        status: "error",
      };
    }
  }, [requestId]);

  React.useEffect(() => {
    let active = true;
    const refresh = () =>
      void fetchState().then((next) => {
        if (active) setState(next);
      });

    refresh();
    window.addEventListener("woodloop:requests-changed", refresh);
    window.addEventListener("woodloop:listings-changed", refresh);
    return () => {
      active = false;
      window.removeEventListener("woodloop:requests-changed", refresh);
      window.removeEventListener("woodloop:listings-changed", refresh);
    };
  }, [fetchState]);

  const { request, listing, buyer, supplier, status } = state;

  const isSupplier = user && request && user.id === request.supplierId;
  const isBuyer = user && request && user.id === request.buyerId;
  const isParticipant = Boolean(isSupplier || isBuyer);

  const backHref =
    isSupplier || user?.activeWorkspace === "supplying"
      ? "/app/requests?view=incoming"
      : "/app/requests?view=sent";

  const photo = listingPhoto(listing?.photoIds[0] ?? "boards");

  return (
    <>
      <AppHeader title="Request details" backHref={backHref} />
      <main className="py-6 sm:py-8 lg:py-10">
        <PageContainer size="app">
          {status === "loading" ? (
            <LoadingState label="Loading request and material details..." rows={4} />
          ) : null}

          {status === "error" ? (
            <ErrorState
              title="Failed to load request"
              description="WoodLoop could not read this request from demo storage."
              onRetry={() => void fetchState().then(setState)}
            />
          ) : null}

          {status === "ready" && (!request || !isParticipant) ? (
            <div className="space-y-4">
              <ErrorState
                title={!request ? "Request not found" : "Access restricted"}
                description={
                  !request
                    ? "This request record does not exist or was removed in a local reset."
                    : "You are not a participant (buyer or supplier) in this request."
                }
              />
              <Button asChild variant="secondary">
                <Link href="/app/requests">Back to requests</Link>
              </Button>
            </div>
          ) : null}

          {status === "ready" && request && isParticipant && user ? (
            <div className="space-y-6">
              {/* Header Bar */}
              <div className="border-line bg-surface rounded-lg border p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant={statusBadgeVariant(request.status)}>
                        {formatRequestStatus(request.status)}
                      </Badge>
                      <span className="text-xs text-ink-600 font-mono">
                        {request.id.slice(0, 16)}...
                      </span>
                    </div>
                    <h1 className="font-heading mt-2 text-xl sm:text-2xl font-bold text-ink-900">
                      {listing?.title ?? "Material batch inquiry"}
                    </h1>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-600">
                      <span className="inline-flex items-center gap-1">
                        <Calendar aria-hidden="true" className="size-3.5" />
                        Created {formatDate(request.createdAt)}
                      </span>
                      <span>·</span>
                      <span>
                        Role:{" "}
                        <strong className="text-ink-900 font-semibold">
                          {isSupplier ? "Supplier" : "Buyer"}
                        </strong>
                      </span>
                      <span>·</span>
                      <span>
                        Counterparty:{" "}
                        <strong className="text-ink-900 font-semibold">
                          {isSupplier
                            ? (buyer?.displayName ?? "Buyer")
                            : (supplier?.displayName ?? "Supplier")}
                        </strong>
                      </span>
                    </div>
                  </div>

                  {/* Quick Summary Pill */}
                  <div className="bg-sage-100/70 border-line shrink-0 rounded-lg border p-3 sm:text-right">
                    <p className="text-xs text-ink-600">Requested quantity</p>
                    <p className="font-heading text-lg font-bold text-ink-900 tabular-nums">
                      {request.requestedQuantity} pcs
                    </p>
                    {request.agreedQuantity ? (
                      <p className="text-xs font-semibold text-brand-900 tabular-nums">
                        Agreed: {request.agreedQuantity} pcs
                      </p>
                    ) : null}
                  </div>
                </div>

                {/* Reservation Status Banner */}
                {request.reservationState && request.reservationState !== "none" ? (
                  <div className="mt-4 pt-4 border-t border-line/60">
                    {request.reservationState === "held" ? (
                      <div className="flex items-center gap-2 text-xs text-brand-900 bg-sage-100 p-2.5 rounded-md border border-brand-900/20">
                        <CheckCircle2 aria-hidden="true" className="size-4 shrink-0 text-brand-900" />
                        <span>
                          <strong>Stock reserved:</strong> {request.reservedQuantity}{" "}
                          {request.unit} is held from inventory for this agreement.
                        </span>
                      </div>
                    ) : null}
                    {request.reservationState === "consumed" ? (
                      <div className="flex items-center gap-2 text-xs text-ink-900 bg-sage-100/60 p-2.5 rounded-md border border-line">
                        <CheckCircle2 aria-hidden="true" className="size-4 shrink-0 text-brand-900" />
                        <span>
                          <strong>Stock fulfilled:</strong> Handover is complete. The
                          reserved quantity has been consumed permanently.
                        </span>
                      </div>
                    ) : null}
                    {request.reservationState === "released" ? (
                      <div className="flex items-center gap-2 text-xs text-ink-600 bg-sage-100/40 p-2.5 rounded-md border border-line">
                        <Clock aria-hidden="true" className="size-4 shrink-0 text-ink-600" />
                        <span>
                          <strong>Stock released:</strong> Request closed before completion;
                          reserved stock was restored to active listing inventory.
                        </span>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>

              {/* 2-Column Responsive Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                {/* Left Column: Material Info, Terms, and Status Actions */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Material Batch Preview Card */}
                  {listing ? (
                    <div className="border-line bg-surface overflow-hidden rounded-lg border">
                      <div className="p-5 sm:p-6 pb-4 border-b border-line flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Package aria-hidden="true" className="size-4 text-timber-600" />
                          <h2 className="font-heading text-base font-semibold text-ink-900">
                            Material batch details
                          </h2>
                        </div>
                        <Button asChild variant="secondary" className="h-8 px-3 text-xs">
                          <Link href={`/app/materials/${listing.id}`}>
                            View batch <ArrowUpRight aria-hidden="true" className="ml-1 size-3.5" />
                          </Link>
                        </Button>
                      </div>

                      <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-4">
                        <div className="relative aspect-4/3 sm:aspect-square overflow-hidden rounded-md bg-sage-100 border border-line">
                          <Image
                            src={photo.src}
                            alt={photo.alt}
                            fill
                            sizes="140px"
                            className="object-cover object-center"
                          />
                        </div>

                        <div className="space-y-2 text-xs sm:text-sm">
                          <p className="font-heading text-base font-semibold text-ink-900">
                            {listing.title}
                          </p>
                          <p className="text-ink-600 font-medium">
                            {formatWoodForm(listing.woodForm)} · {formatDimensions(listing)}
                          </p>
                          {listing.declaredSpecies ? (
                            <p className="text-ink-600">
                              <span className="font-semibold text-ink-900">Species:</span>{" "}
                              {listing.declaredSpecies}
                            </p>
                          ) : null}
                          <p className="text-ink-600">
                            <span className="font-semibold text-ink-900">Location:</span>{" "}
                            {listing.region}
                          </p>
                          <div className="pt-2 flex items-center gap-2 text-xs">
                            <span className="text-ink-600">Current available stock:</span>
                            <Badge variant={listing.quantityAvailable > 0 ? "available" : "reserved"}>
                              {listing.quantityAvailable} {listing.unit}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {/* Order Specifications & Counterparty Card */}
                  <div className="border-line bg-surface rounded-lg border p-5 sm:p-6">
                    <h2 className="font-heading text-base font-semibold text-ink-900 mb-4 flex items-center gap-2">
                      <Building2 aria-hidden="true" className="size-4 text-timber-600" />
                      Coordination specifications
                    </h2>

                    <dl className="border-line divide-line divide-y border-y text-xs sm:text-sm">
                      <div className="grid grid-cols-[8rem_1fr] sm:grid-cols-[10rem_1fr] gap-3 py-3">
                        <dt className="text-ink-600 font-medium">Counterparty</dt>
                        <dd className="text-ink-900">
                          {isSupplier ? (
                            <div>
                              <p className="font-semibold">
                                {buyer?.displayName ?? "Buyer participant"}
                              </p>
                              {buyer?.organizationName ? (
                                <p className="text-ink-600 text-xs">
                                  {buyer.organizationName}
                                </p>
                              ) : null}
                              <p className="text-ink-600 text-xs">{buyer?.email}</p>
                            </div>
                          ) : (
                            <div>
                              <p className="font-semibold">
                                {supplier?.displayName ?? "Supplier workshop"}
                              </p>
                              {supplier?.organizationName ? (
                                <p className="text-ink-600 text-xs">
                                  {supplier.organizationName}
                                </p>
                              ) : null}
                              <p className="text-ink-600 text-xs">{supplier?.email}</p>
                            </div>
                          )}
                        </dd>
                      </div>

                      <div className="grid grid-cols-[8rem_1fr] sm:grid-cols-[10rem_1fr] gap-3 py-3">
                        <dt className="text-ink-600 font-medium">Handover method</dt>
                        <dd className="text-ink-900 flex items-center gap-1.5">
                          {request.fulfillmentMethod === "pickup" ? (
                            <>
                              <Package aria-hidden="true" className="size-3.5 text-timber-600" />
                              <span>Pickup by buyer at supplier workshop</span>
                            </>
                          ) : (
                            <>
                              <Truck aria-hidden="true" className="size-3.5 text-timber-600" />
                              <span>Delivery to discuss during coordination</span>
                            </>
                          )}
                        </dd>
                      </div>

                      <div className="grid grid-cols-[8rem_1fr] sm:grid-cols-[10rem_1fr] gap-3 py-3">
                        <dt className="text-ink-600 font-medium">Requested quantity</dt>
                        <dd className="tabular-nums font-semibold text-ink-900">
                          {request.requestedQuantity} {request.unit}
                        </dd>
                      </div>

                      {request.agreedQuantity ? (
                        <div className="grid grid-cols-[8rem_1fr] sm:grid-cols-[10rem_1fr] gap-3 py-3 bg-sage-100/40 px-2 rounded">
                          <dt className="text-brand-900 font-semibold">Agreed quantity</dt>
                          <dd className="tabular-nums font-bold text-brand-900">
                            {request.agreedQuantity} {request.unit} (Confirmed)
                          </dd>
                        </div>
                      ) : null}

                      {request.message ? (
                        <div className="grid grid-cols-[8rem_1fr] sm:grid-cols-[10rem_1fr] gap-3 py-3">
                          <dt className="text-ink-600 font-medium">Inquiry note</dt>
                          <dd className="text-ink-900 whitespace-pre-wrap">
                            {request.message}
                          </dd>
                        </div>
                      ) : null}
                    </dl>
                  </div>

                  {/* Actions Component */}
                  <RequestActions
                    request={request}
                    listing={listing}
                    currentUser={user}
                  />
                </div>

                {/* Right Column: Coordination Messages & Status Audit Timeline */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Messages Thread */}
                  <RequestThread
                    request={request}
                    currentUser={user}
                    buyer={buyer}
                    supplier={supplier}
                  />

                  {/* Status Timeline */}
                  <RequestTimeline
                    history={request.history}
                    buyer={buyer}
                    supplier={supplier}
                  />
                </div>
              </div>
            </div>
          ) : null}
        </PageContainer>
      </main>
    </>
  );
}

export { RequestDetail };
