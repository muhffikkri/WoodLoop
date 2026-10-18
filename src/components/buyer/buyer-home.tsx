"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Filter, MapPin, Ruler, Search, UserRound } from "lucide-react";

import { ListingFilterSheet } from "@/components/materials/listing-filter-sheet";
import { MaterialCard } from "@/components/materials/material-card";
import { ErrorState } from "@/components/feedback/error-state";
import { EmptyState } from "@/components/feedback/empty-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ListingFilters, WoodForm } from "@/domain/types";
import { useListings } from "@/hooks/use-listings";
import { filtersToSearchParams } from "@/lib/listing-filters";

function BuyerHome() {
  const router = useRouter();
  const { listings, status, error, retry } = useListings();
  const [query, setQuery] = React.useState("");
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [needs, setNeeds] = React.useState({
    form: "",
    minLength: "",
    minWidth: "",
    quantity: "",
    location: "",
  });

  function browse(filters: ListingFilters = {}) {
    const params = filtersToSearchParams(filters);
    router.push(`/app/materials${params.size ? `?${params}` : ""}`);
  }

  function search(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    browse({ query: query.trim() || undefined });
  }

  function findMatches(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    browse({
      forms: needs.form ? [needs.form as WoodForm] : undefined,
      minLengthMm: Number(needs.minLength) || undefined,
      minWidthMm: Number(needs.minWidth) || undefined,
      minimumQuantity: Number(needs.quantity) || undefined,
      quantityUnit: needs.quantity ? "pieces" : undefined,
      region: needs.location.trim() || undefined,
    });
  }

  return (
    <>
      <AppHeader
        title="Find materials"
        description="Local demo workspace"
        action={
          <Button asChild variant="text" size="icon">
            <Link href="/app/profile" aria-label="Open demo profile">
              <UserRound aria-hidden="true" />
            </Link>
          </Button>
        }
      />
      <main className="py-6 lg:py-10">
        <PageContainer size="app">
          <section className="max-w-3xl">
            <p className="text-timber-600 text-sm font-semibold">
              Buyer workspace
            </p>
            <h1 className="font-heading mt-2 text-3xl leading-tight font-semibold tracking-[-0.04em] sm:text-4xl">
              Find materials for your next project.
            </h1>
            <p className="text-ink-600 mt-3 leading-7">
              Browse clean production wood offcuts with supplier-declared
              dimensions, quantities, and areas.
            </p>
            <form
              className="mt-6 flex flex-col gap-3 sm:flex-row"
              onSubmit={search}
              role="search"
            >
              <label className="sr-only" htmlFor="buyer-search">
                What material does your project need?
              </label>
              <div className="relative flex-1">
                <Search
                  aria-hidden="true"
                  className="text-ink-600 absolute top-1/2 left-4 size-5 -translate-y-1/2"
                />
                <Input
                  id="buyer-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="What material does your project need?"
                  className="pl-12"
                />
              </div>
              <Button type="submit" size="large">
                <Search aria-hidden="true" />
                Search
              </Button>
            </form>
            <div
              className="mt-4 flex flex-wrap gap-2"
              aria-label="Quick filters"
            >
              <Button
                variant="secondary"
                size="default"
                onClick={() => setFilterOpen(true)}
              >
                <Filter aria-hidden="true" />
                Form
              </Button>
              <Button
                variant="secondary"
                size="default"
                onClick={() => setFilterOpen(true)}
              >
                <Ruler aria-hidden="true" />
                Dimensions
              </Button>
              <Button
                variant="secondary"
                size="default"
                onClick={() => setFilterOpen(true)}
              >
                Quantity
              </Button>
              <Button
                variant="secondary"
                size="default"
                onClick={() => setFilterOpen(true)}
              >
                <MapPin aria-hidden="true" />
                Location
              </Button>
            </div>
          </section>

          <section className="border-line bg-surface mt-8 border-y py-7 sm:mt-10 sm:py-8 lg:-mx-8 lg:px-8">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <h2 className="font-heading text-xl font-semibold">
                  Find by your project needs
                </h2>
                <p className="text-ink-600 mt-1 text-sm">
                  Matches use your entered constraints and supplier-declared
                  fields.
                </p>
              </div>
            </div>
            <form
              className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto]"
              onSubmit={findMatches}
            >
              <label className="sr-only" htmlFor="needs-form">
                Material form
              </label>
              <select
                id="needs-form"
                value={needs.form}
                onChange={(event) =>
                  setNeeds((current) => ({
                    ...current,
                    form: event.target.value,
                  }))
                }
                className="border-line bg-surface min-h-12 rounded-md border px-4 text-sm"
              >
                <option value="">Any form</option>
                <option value="board">Board</option>
                <option value="strip">Strip</option>
                <option value="block">Block</option>
                <option value="other">Other offcut</option>
              </select>
              <label className="sr-only" htmlFor="needs-length">
                Minimum length in millimetres
              </label>
              <Input
                id="needs-length"
                type="number"
                min="1"
                inputMode="numeric"
                value={needs.minLength}
                onChange={(event) =>
                  setNeeds((current) => ({
                    ...current,
                    minLength: event.target.value,
                  }))
                }
                placeholder="Min. length (mm)"
              />
              <label className="sr-only" htmlFor="needs-width">
                Minimum width in millimetres
              </label>
              <Input
                id="needs-width"
                type="number"
                min="1"
                inputMode="numeric"
                value={needs.minWidth}
                onChange={(event) =>
                  setNeeds((current) => ({
                    ...current,
                    minWidth: event.target.value,
                  }))
                }
                placeholder="Min. width (mm)"
              />
              <label className="sr-only" htmlFor="needs-quantity">
                Minimum quantity in pieces
              </label>
              <Input
                id="needs-quantity"
                type="number"
                min="1"
                inputMode="numeric"
                value={needs.quantity}
                onChange={(event) =>
                  setNeeds((current) => ({
                    ...current,
                    quantity: event.target.value,
                  }))
                }
                placeholder="Min. quantity"
              />
              <Button type="submit" size="large">
                Find matches
              </Button>
            </form>
          </section>

          <section className="mt-8 sm:mt-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-timber-600 text-sm font-semibold">
                  Recently available
                </p>
                <h2 className="font-heading mt-1 text-2xl font-semibold tracking-[-0.03em]">
                  Available offcuts
                </h2>
              </div>
              <Button asChild variant="text">
                <Link href="/app/materials">Browse all materials</Link>
              </Button>
            </div>
            <div className="mt-5">
              {status === "loading" ? (
                <LoadingState label="Loading available offcuts..." rows={3} />
              ) : null}
              {status === "error" ? (
                <ErrorState
                  description={error ?? undefined}
                  onRetry={() => void retry()}
                />
              ) : null}
              {status === "ready" && listings.length === 0 ? (
                <EmptyState
                  title="No available offcuts yet"
                  description="No locally saved sample batch matches this view. Browse the catalog to adjust your search."
                  action={
                    <Button asChild>
                      <Link href="/app/materials">Browse materials</Link>
                    </Button>
                  }
                />
              ) : null}
              {status === "ready" && listings.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {listings.slice(0, 3).map((listing) => (
                    <MaterialCard key={listing.id} listing={listing} />
                  ))}
                </div>
              ) : null}
            </div>
          </section>
        </PageContainer>
      </main>
      <ListingFilterSheet
        open={filterOpen}
        onOpenChange={setFilterOpen}
        onApply={browse}
      />
    </>
  );
}

export { BuyerHome };
