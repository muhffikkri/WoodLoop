"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";

import { ListingFilterSheet } from "@/components/materials/listing-filter-sheet";
import { MaterialCard } from "@/components/materials/material-card";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ListingFilters } from "@/domain/types";
import { useListings } from "@/hooks/use-listings";
import {
  filtersFromSearchParams,
  filtersToSearchParams,
} from "@/lib/listing-filters";

function MaterialCatalog() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = React.useMemo(
    () => filtersFromSearchParams(searchParams),
    [searchParams],
  );
  const { listings, status, error, retry } = useListings(filters);
  const [filterOpen, setFilterOpen] = React.useState(false);

  function navigate(nextFilters: ListingFilters) {
    const params = filtersToSearchParams(nextFilters);
    router.push(`/app/materials${params.size ? `?${params}` : ""}`);
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const query = String(data.get("q") ?? "").trim();
    navigate({ ...filters, query: query || undefined });
  }

  return (
    <>
      <AppHeader
        title="Materials"
        description="Supplier-declared sample details"
      />
      <main className="py-6 lg:py-10">
        <PageContainer size="app">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-timber-600 text-sm font-semibold">
                Local sample catalog
              </p>
              <h1 className="font-heading mt-1 text-3xl font-semibold tracking-[-0.035em]">
                Available offcuts
              </h1>
            </div>
            <Button variant="secondary" onClick={() => setFilterOpen(true)}>
              <SlidersHorizontal aria-hidden="true" />
              Filters
            </Button>
          </div>
          <form
            className="mt-6 flex flex-col gap-3 sm:flex-row"
            role="search"
            onSubmit={submit}
          >
            <label className="sr-only" htmlFor="catalog-search">
              Search materials
            </label>
            <div className="relative flex-1">
              <Search
                aria-hidden="true"
                className="text-ink-600 absolute top-1/2 left-4 size-5 -translate-y-1/2"
              />
              <Input
                id="catalog-search"
                name="q"
                key={filters.query ?? "empty-query"}
                defaultValue={filters.query ?? ""}
                placeholder="What material does your project need?"
                className="pl-12"
              />
            </div>
            <Button type="submit" size="large">
              Search
            </Button>
          </form>
          {Object.keys(filters).length ? (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-ink-600 text-sm">Filters active</span>
              <Button variant="text" onClick={() => navigate({})}>
                Clear filters
              </Button>
            </div>
          ) : null}
          <p className="text-ink-600 mt-6 text-sm">
            {status === "ready"
              ? `${listings.length} ${listings.length === 1 ? "batch" : "batches"} shown`
              : "Loading batches"}{" "}
            · Demo listings are fictional and stored locally.
          </p>
          <div className="mt-5">
            {status === "loading" ? (
              <LoadingState label="Loading material catalog..." rows={4} />
            ) : null}
            {status === "error" ? (
              <ErrorState
                description={error ?? undefined}
                onRetry={() => void retry()}
              />
            ) : null}
            {status === "ready" && listings.length === 0 ? (
              <EmptyState
                title="No matching offcuts yet"
                description="Try adjusting dimensions, material form, quantity, or location."
                action={
                  <Button onClick={() => navigate({})}>Clear filters</Button>
                }
              />
            ) : null}
            {status === "ready" && listings.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {listings.map((listing) => (
                  <MaterialCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : null}
          </div>
        </PageContainer>
      </main>
      <ListingFilterSheet
        open={filterOpen}
        onOpenChange={setFilterOpen}
        initialFilters={filters}
        onApply={(nextFilters) =>
          navigate({ ...nextFilters, query: filters.query })
        }
      />
    </>
  );
}

export { MaterialCatalog };
