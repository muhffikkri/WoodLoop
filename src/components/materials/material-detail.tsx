"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle2,
  HelpCircle,
  Layers,
  MapPin,
  MessageSquare,
  Package,
  Ruler,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

import { useSession } from "@/components/auth/session-provider";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { AppHeader } from "@/components/layout/app-header";
import { AppShell } from "@/components/layout/app-shell";
import { PageContainer } from "@/components/layout/page-container";
import { PhotoGallery } from "@/components/materials/photo-gallery";
import { RequestBatchDialog } from "@/components/materials/request-batch-dialog";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Listing, User, VisibleCondition } from "@/domain/types";
import { getDemoDatabase } from "@/lib/demo-db";
import {
  formatDimensions,
  formatQuantity,
  formatWoodForm,
} from "@/lib/listing-format";
import { listingPhoto } from "@/services/demo/demo-listings";
import { demoListingRepository } from "@/services/demo/listing-repository";

const conditionLabels: Record<VisibleCondition, string> = {
  apparently_intact: "Apparently intact surface",
  crack: "Visible surface crack",
  hole: "Visible hole or knot",
  stain: "Surface stain or discoloration",
  edge_damage: "Edge damage / notch",
  unclear: "Unclear in photo",
};

function formatVisibleCondition(condition: VisibleCondition) {
  return conditionLabels[condition] ?? condition;
}

function availabilityFor(listing: Listing) {
  if (listing.status === "reserved") return "reserved" as const;
  if (listing.status !== "active" || listing.quantityAvailable <= 0)
    return "unavailable" as const;
  return "available" as const;
}

const availabilityLabels = {
  available: "Available",
  reserved: "Reserved",
  unavailable: "Unavailable",
} as const;

function MaterialDetail() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, status: sessionStatus } = useSession();

  const [state, setState] = React.useState<{
    listing: Listing | null;
    supplier: User | null;
    status: "loading" | "ready" | "error";
  }>({ listing: null, supplier: null, status: "loading" });

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogMode, setDialogMode] = React.useState<"request" | "inquire">(
    "request",
  );

  const load = React.useCallback(async () => {
    try {
      const listing = await demoListingRepository.getById(params.id);
      let supplier: User | null = null;
      if (listing) {
        supplier =
          (await getDemoDatabase().users.get(listing.supplierId)) ?? null;
      }
      setState({ listing, supplier, status: "ready" });
    } catch {
      setState({ listing: null, supplier: null, status: "error" });
    }
  }, [params.id]);

  React.useEffect(() => {
    let active = true;
    void demoListingRepository
      .getById(params.id)
      .then(async (listing) => {
        if (!active) return;
        let supplier: User | null = null;
        if (listing) {
          supplier =
            (await getDemoDatabase().users.get(listing.supplierId)) ?? null;
        }
        if (active) setState({ listing, supplier, status: "ready" });
      })
      .catch(() => {
        if (active)
          setState({ listing: null, supplier: null, status: "error" });
      });

    return () => {
      active = false;
    };
  }, [params.id]);

  if (state.status === "loading") {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <LoadingState label="Loading material details..." rows={3} />
      </main>
    );
  }

  if (state.status === "error") {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <ErrorState
          description="WoodLoop could not load this locally saved sample batch."
          onRetry={() => void load()}
        />
      </main>
    );
  }

  if (!state.listing) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <ErrorState
          title="Material batch not found"
          description="This local sample batch may have been reset or is no longer available."
        />
        <Button asChild className="mt-5">
          <Link href="/app/materials">Back to materials</Link>
        </Button>
      </main>
    );
  }

  const listing = state.listing;
  const supplier = state.supplier;
  const availability = availabilityFor(listing);
  const isOutOfStock = availability === "unavailable";
  const isOwnListing = user?.id === listing.supplierId;
  const isGuest = sessionStatus === "ready" && !user;

  const currentPath = `/app/materials/${listing.id}`;
  const galleryPhotos = listing.photoIds.map((id) => ({
    id,
    ...listingPhoto(id),
  }));

  function handleActionClick(mode: "request" | "inquire") {
    if (isGuest) {
      router.push(`/login?returnTo=${encodeURIComponent(currentPath)}`);
      return;
    }
    setDialogMode(mode);
    setDialogOpen(true);
  }

  const actionButtons = (
    <div className="flex flex-col gap-2.5 sm:flex-row lg:flex-col">
      {isOwnListing ? (
        <Button asChild size="large" className="w-full">
          <Link href="/app/listings">Manage listing</Link>
        </Button>
      ) : isOutOfStock ? (
        <>
          <Button size="large" disabled className="w-full">
            Batch unavailable
          </Button>
          <Button asChild variant="secondary" size="large" className="w-full">
            <Link href="/app/materials">Browse other materials</Link>
          </Button>
        </>
      ) : (
        <>
          <Button
            size="large"
            className="w-full"
            onClick={() => handleActionClick("request")}
          >
            <CheckCircle2 aria-hidden="true" className="mr-2 size-5" />
            Request this batch
          </Button>
          <Button
            variant="secondary"
            size="large"
            className="w-full"
            onClick={() => handleActionClick("inquire")}
          >
            <MessageSquare aria-hidden="true" className="mr-2 size-5" />
            Ask a question
          </Button>
        </>
      )}
    </div>
  );

  const content = (
    <>
      <AppHeader
        title="Material details"
        description="Supplier-declared sample details"
        backHref="/app/materials"
        action={
          isGuest ? (
            <Button asChild variant="secondary">
              <Link href={`/login?returnTo=${encodeURIComponent(currentPath)}`}>
                Log in
              </Link>
            </Button>
          ) : null
        }
      />

      <main
        className={`py-6 lg:py-10 ${user ? "pb-36 lg:pb-12" : "pb-28 lg:pb-12"}`}
      >
        <PageContainer size="app">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)] lg:gap-12">
            {/* Left column: Gallery & Not Verified disclaimers */}
            <div className="space-y-6">
              <PhotoGallery photos={galleryPhotos} />

              {/* What is not verified section */}
              <section
                aria-labelledby="not-verified-title"
                className="border-line bg-surface rounded-lg border p-5 sm:p-6"
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                  <ShieldAlert
                    aria-hidden="true"
                    className="size-5 text-amber-700"
                  />
                  <h2 id="not-verified-title" className="font-heading text-base font-semibold">
                    What is not verified
                  </h2>
                </div>
                <p className="text-ink-600 mt-2 text-xs leading-5">
                  Platform safety and honesty rule: WoodLoop does not perform
                  physical inspection. The following must always be confirmed by
                  the buyer:
                </p>
                <ul className="text-ink-600 mt-3 list-disc space-y-1.5 pl-5 text-xs leading-5">
                  <li>
                    <strong>Exact wood species and biological grade</strong>{" "}
                    (unless certified lab testing documentation is supplied).
                  </li>
                  <li>
                    <strong>Structural load-bearing capacity</strong> or
                    suitability for critical structural joinery.
                  </li>
                  <li>
                    <strong>
                      Chemical treatment, preservatives, or food contact safety
                    </strong>
                    .
                  </li>
                  <li>
                    <strong>Precision fit for your specific cut plan</strong>{" "}
                    (always re-measure piece dimensions upon pickup).
                  </li>
                </ul>
              </section>

              {/* Caveat Alert */}
              <Alert className="flex items-start gap-3">
                <AlertTriangle
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-amber-700"
                />
                <span className="text-xs leading-5">
                  Confirm dimensions, condition, and pickup terms directly with
                  the workshop before committing material to finished work.
                </span>
              </Alert>
            </div>

            {/* Right column: Header, Key Facts, Confirmation Panels, Supplier Info */}
            <div className="space-y-6">
              {/* Header card */}
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  {listing.isDemo ? (
                    <Badge variant="demo">Demo listing</Badge>
                  ) : null}
                  <Badge variant={availability}>
                    {availabilityLabels[availability]}
                  </Badge>
                  <span className="text-ink-600 inline-flex items-center gap-1 text-xs">
                    <MapPin aria-hidden="true" className="size-3.5" />
                    {listing.region}
                  </span>
                </div>

                <h1 className="font-heading mt-3 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
                  {listing.title}
                </h1>

                {listing.description ? (
                  <p className="text-ink-600 mt-3 text-sm leading-6">
                    {listing.description}
                  </p>
                ) : null}
              </div>

              {/* Desktop Action Area */}
              <div className="border-line bg-surface hidden rounded-lg border p-5 lg:block">
                {actionButtons}
              </div>

              {/* Compact key facts */}
              <section
                aria-label="Key facts"
                className="border-line bg-surface divide-line grid grid-cols-2 divide-x divide-y rounded-lg border text-sm sm:grid-cols-4 sm:divide-y-0"
              >
                <div className="p-4">
                  <span className="text-ink-600 flex items-center gap-1.5 text-xs font-medium">
                    <Layers aria-hidden="true" className="size-3.5 text-timber-600" />
                    Form
                  </span>
                  <p className="mt-1 font-semibold text-ink-900">
                    {formatWoodForm(listing.woodForm)}
                  </p>
                </div>
                <div className="p-4">
                  <span className="text-ink-600 flex items-center gap-1.5 text-xs font-medium">
                    <Ruler aria-hidden="true" className="size-3.5 text-timber-600" />
                    Dimensions
                  </span>
                  <p className="mt-1 font-semibold text-ink-900 tabular-nums">
                    {formatDimensions(listing)}
                  </p>
                </div>
                <div className="p-4">
                  <span className="text-ink-600 flex items-center gap-1.5 text-xs font-medium">
                    <Package aria-hidden="true" className="size-3.5 text-timber-600" />
                    Available
                  </span>
                  <p className="mt-1 font-semibold text-ink-900 tabular-nums">
                    {formatQuantity(listing)}
                  </p>
                </div>
                <div className="p-4">
                  <span className="text-ink-600 flex items-center gap-1.5 text-xs font-medium">
                    <Calendar aria-hidden="true" className="size-3.5 text-timber-600" />
                    Available from
                  </span>
                  <p className="mt-1 font-semibold text-ink-900">
                    {listing.availableFrom ?? "Available now"}
                  </p>
                </div>
              </section>

              {/* Supplier Confirmed Section */}
              <section
                aria-labelledby="supplier-confirmed-title"
                className="border-line bg-surface rounded-lg border p-5 sm:p-6"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    aria-hidden="true"
                    className="size-5 text-brand-900"
                  />
                  <div>
                    <h2
                      id="supplier-confirmed-title"
                      className="font-heading text-base font-semibold text-ink-900"
                    >
                      Supplier confirmed
                    </h2>
                    <p className="text-ink-600 text-xs">
                      Declared by workshop from production offcuts.
                    </p>
                  </div>
                </div>

                <dl className="border-line mt-4 divide-line divide-y border-y text-xs sm:text-sm">
                  <div className="grid grid-cols-[8.5rem_1fr] gap-3 py-2.5">
                    <dt className="text-ink-600">Material form</dt>
                    <dd className="font-medium text-ink-900">
                      {formatWoodForm(listing.woodForm)}
                    </dd>
                  </div>
                  <div className="grid grid-cols-[8.5rem_1fr] gap-3 py-2.5">
                    <dt className="text-ink-600">Measurements</dt>
                    <dd className="font-medium text-ink-900 tabular-nums">
                      {formatDimensions(listing)}{" "}
                      {listing.dimensions.notes
                        ? `(${listing.dimensions.notes})`
                        : ""}
                    </dd>
                  </div>
                  <div className="grid grid-cols-[8.5rem_1fr] gap-3 py-2.5">
                    <dt className="text-ink-600">Quantity</dt>
                    <dd className="font-medium text-ink-900 tabular-nums">
                      {listing.quantityAvailable} {listing.unit} currently
                      available ({listing.quantityTotal} originally listed)
                    </dd>
                  </div>
                  <div className="grid grid-cols-[8.5rem_1fr] gap-3 py-2.5">
                    <dt className="text-ink-600">Source process</dt>
                    <dd className="font-medium text-ink-900">
                      {listing.sourceProcess}
                    </dd>
                  </div>
                  <div className="grid grid-cols-[8.5rem_1fr] gap-3 py-2.5">
                    <dt className="text-ink-600">Declared species</dt>
                    <dd className="font-medium text-ink-900">
                      {listing.declaredSpecies ? (
                        <>
                          {listing.declaredSpecies}{" "}
                          <span className="text-ink-600 font-normal">
                            (supplier declared — not laboratory verified)
                          </span>
                        </>
                      ) : (
                        <span className="text-ink-600">
                          Not specified (not verified)
                        </span>
                      )}
                    </dd>
                  </div>
                  <div className="grid grid-cols-[8.5rem_1fr] gap-3 py-2.5">
                    <dt className="text-ink-600">Treatment declaration</dt>
                    <dd className="font-medium text-ink-900">
                      {listing.declaredTreatment === "untreated"
                        ? "Declared untreated by supplier"
                        : listing.declaredTreatment === "treated"
                          ? "Declared treated / coated"
                          : "Unsure / not declared"}
                    </dd>
                  </div>
                  <div className="grid grid-cols-[8.5rem_1fr] gap-3 py-2.5">
                    <dt className="text-ink-600">Visible condition</dt>
                    <dd className="font-medium text-ink-900">
                      {listing.visibleConditionNotes ||
                        "No specific defect notes provided."}
                    </dd>
                  </div>
                </dl>
              </section>

              {/* AI Visual Suggestions Section */}
              <section
                aria-labelledby="ai-suggestions-title"
                className="border-line bg-surface rounded-lg border p-5 sm:p-6"
              >
                <div className="flex items-center gap-2">
                  <Sparkles
                    aria-hidden="true"
                    className="size-5 text-timber-600"
                  />
                  <div>
                    <h2
                      id="ai-suggestions-title"
                      className="font-heading text-base font-semibold text-ink-900"
                    >
                      AI visual suggestions
                    </h2>
                    <p className="text-ink-600 text-xs">
                      Computer vision estimate from uploaded photos.
                    </p>
                  </div>
                </div>

                {listing.aiSuggestion ? (
                  <div className="mt-4 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="demo">Demo visual estimate</Badge>
                      <span className="text-ink-600 text-xs">
                        Reviewed by supplier:{" "}
                        {listing.aiSuggestion.reviewedBySupplier
                          ? "Yes"
                          : "Pending"}
                      </span>
                    </div>

                    <dl className="border-line divide-line divide-y border-y text-xs sm:text-sm">
                      <div className="grid grid-cols-[8.5rem_1fr] gap-3 py-2.5">
                        <dt className="text-ink-600">Estimated form</dt>
                        <dd className="font-medium text-ink-900">
                          {formatWoodForm(
                            listing.aiSuggestion.suggestedForm ?? "other",
                          )}
                        </dd>
                      </div>
                      <div className="grid grid-cols-[8.5rem_1fr] gap-3 py-2.5">
                        <dt className="text-ink-600">Surface detections</dt>
                        <dd className="font-medium text-ink-900">
                          {listing.aiSuggestion.visibleConditions.length > 0
                            ? listing.aiSuggestion.visibleConditions
                                .map(formatVisibleCondition)
                                .join(", ")
                            : "No anomalies detected"}
                        </dd>
                      </div>
                    </dl>

                    {listing.aiSuggestion.explanation ? (
                      <p className="text-ink-600 rounded-md bg-sage-100/50 p-3 text-xs leading-5">
                        {listing.aiSuggestion.explanation}
                      </p>
                    ) : null}

                    <p className="text-ink-600 text-[0.75rem] leading-4 italic">
                      Visual estimates are not material grading. AI cannot
                      certify species, moisture, load capacity, or chemical
                      safety.
                    </p>
                  </div>
                ) : (
                  <div className="text-ink-600 mt-4 flex items-center gap-2 rounded-md bg-sage-100/40 p-3 text-xs">
                    <HelpCircle aria-hidden="true" className="size-4 shrink-0" />
                    <span>
                      Not available (no visual analysis was run on this sample
                      batch).
                    </span>
                  </div>
                )}
              </section>

              {/* Supplier Workshop Card */}
              <section
                aria-labelledby="supplier-info-title"
                className="border-line bg-surface rounded-lg border p-5 sm:p-6"
              >
                <div className="flex items-center gap-2.5">
                  <div className="bg-sage-100 text-brand-900 grid size-10 place-items-center rounded-full">
                    <Building2 aria-hidden="true" className="size-5" />
                  </div>
                  <div>
                    <h2
                      id="supplier-info-title"
                      className="font-heading text-sm font-semibold text-ink-900"
                    >
                      {supplier?.organizationName ??
                        supplier?.displayName ??
                        "WoodLoop Supplier Workshop"}
                    </h2>
                    <p className="text-ink-600 text-xs">{listing.region}</p>
                  </div>
                </div>

                <div className="mt-3 text-xs leading-5 text-ink-600">
                  <p>
                    <strong>Pickup details:</strong>{" "}
                    {listing.pickupDetails ||
                      "Workshop collection coordinates provided upon request agreement."}
                  </p>
                </div>
              </section>
            </div>
          </div>
        </PageContainer>
      </main>

      {/* Sticky Mobile Action Bar */}
      <div
        className={`border-line bg-surface/95 fixed inset-x-0 z-30 border-t p-3 backdrop-blur-sm lg:hidden ${
          user ? "bottom-18" : "safe-bottom bottom-0"
        }`}
        aria-label="Batch actions"
      >
        <div className="mx-auto max-w-xl">{actionButtons}</div>
      </div>

      {/* Request and Inquire modal dialog */}
      <RequestBatchDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        listing={listing}
        mode={dialogMode}
        user={user}
      />
    </>
  );

  return user ? (
    <AppShell workspace={user.activeWorkspace}>{content}</AppShell>
  ) : (
    content
  );
}

export { MaterialDetail };
