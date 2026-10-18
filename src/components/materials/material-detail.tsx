"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MapPin } from "lucide-react";

import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/layout/page-container";
import { PhotoGallery } from "@/components/materials/photo-gallery";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Listing } from "@/domain/types";
import {
  formatDimensions,
  formatQuantity,
  formatWoodForm,
} from "@/lib/listing-format";
import { listingPhoto } from "@/services/demo/demo-listings";
import { demoListingRepository } from "@/services/demo/listing-repository";

function MaterialDetail() {
  const params = useParams<{ id: string }>();
  const [state, setState] = React.useState<{
    listing: Listing | null;
    status: "loading" | "ready" | "error";
  }>({ listing: null, status: "loading" });

  const load = React.useCallback(() => {
    return demoListingRepository
      .getById(params.id)
      .then((listing) => setState({ listing, status: "ready" }))
      .catch(() => setState({ listing: null, status: "error" }));
  }, [params.id]);

  React.useEffect(() => {
    let active = true;
    void demoListingRepository
      .getById(params.id)
      .then((listing) => {
        if (active) setState({ listing, status: "ready" });
      })
      .catch(() => {
        if (active) setState({ listing: null, status: "error" });
      });
    return () => {
      active = false;
    };
  }, [params.id]);
  if (state.status === "loading")
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <LoadingState label="Loading material details..." rows={2} />
      </main>
    );
  if (state.status === "error")
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <ErrorState
          description="WoodLoop could not load this locally saved sample batch."
          onRetry={() => void load()}
        />
      </main>
    );
  if (!state.listing)
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

  const listing = state.listing;
  const photo = listingPhoto(listing.photoIds[0] ?? "boards");
  return (
    <>
      <AppHeader title="Material details" backHref="/app/materials" />
      <main className="py-6 lg:py-10">
        <PageContainer size="app">
          <div className="grid gap-7 lg:grid-cols-[minmax(0,1.05fr)_minmax(19rem,0.75fr)] lg:gap-10">
            <PhotoGallery
              photos={[{ id: listing.photoIds[0] ?? "boards", ...photo }]}
            />
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="demo">Demo listing</Badge>
                <Badge
                  variant={
                    listing.status === "active"
                      ? "available"
                      : listing.status === "reserved"
                        ? "reserved"
                        : "unavailable"
                  }
                >
                  {listing.status === "active"
                    ? "Available"
                    : listing.status === "reserved"
                      ? "Reserved"
                      : "Unavailable"}
                </Badge>
              </div>
              <h1 className="font-heading mt-4 text-3xl leading-tight font-semibold tracking-[-0.04em]">
                {listing.title}
              </h1>
              <p className="text-ink-600 mt-4 leading-7">
                {listing.description}
              </p>
              <dl className="border-line mt-6 grid divide-y border-y text-sm">
                <div className="grid grid-cols-[9rem_1fr] gap-4 py-3">
                  <dt className="text-ink-600">Supplier confirmed</dt>
                  <dd>{formatWoodForm(listing.woodForm)}</dd>
                </div>
                <div className="grid grid-cols-[9rem_1fr] gap-4 py-3">
                  <dt className="text-ink-600">Dimensions</dt>
                  <dd className="tabular-nums">{formatDimensions(listing)}</dd>
                </div>
                <div className="grid grid-cols-[9rem_1fr] gap-4 py-3">
                  <dt className="text-ink-600">Available</dt>
                  <dd className="tabular-nums">{formatQuantity(listing)}</dd>
                </div>
                <div className="grid grid-cols-[9rem_1fr] gap-4 py-3">
                  <dt className="text-ink-600">Area</dt>
                  <dd className="inline-flex items-center gap-1">
                    <MapPin aria-hidden="true" className="size-4" />
                    {listing.region}
                  </dd>
                </div>
                <div className="grid grid-cols-[9rem_1fr] gap-4 py-3">
                  <dt className="text-ink-600">Species</dt>
                  <dd>
                    {listing.declaredSpecies
                      ? `${listing.declaredSpecies} · supplier declared`
                      : "Not provided"}
                  </dd>
                </div>
              </dl>
              <Alert className="mt-6">
                Confirm dimensions, condition, and pickup terms with the
                supplier before committing.
              </Alert>
            </div>
          </div>
        </PageContainer>
      </main>
    </>
  );
}

export { MaterialDetail };
