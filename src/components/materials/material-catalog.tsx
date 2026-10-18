"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, WifiOff, X } from "lucide-react";

import { useSession } from "@/components/auth/session-provider";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { AppHeader } from "@/components/layout/app-header";
import { AppShell } from "@/components/layout/app-shell";
import { PageContainer } from "@/components/layout/page-container";
import {
  ListingFilterForm,
  ListingFilterSheet,
} from "@/components/materials/listing-filter-sheet";
import { MaterialCard } from "@/components/materials/material-card";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ListingFilters, ListingSort } from "@/domain/types";
import { useListings } from "@/hooks/use-listings";
import {
  CATALOG_SORTS,
  describeActiveFilters,
  filtersFromSearchParams,
  filtersToSearchParams,
  removeActiveFilter,
  sortFromSearchParams,
} from "@/lib/listing-filters";

const SEARCH_DEBOUNCE_MS = 350;

function subscribeOnline(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function useOnline() {
  return React.useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true,
  );
}

type NavigateMode = "push" | "replace";

function SearchField({
  query,
  onSearch,
}: {
  query: string;
  onSearch: (query: string, mode: NavigateMode) => void;
}) {
  const [value, setValue] = React.useState(query);
  const [syncedQuery, setSyncedQuery] = React.useState(query);
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  // Adopt URL changes (Back/Forward, chips, reset) without remounting the input.
  if (query !== syncedQuery) {
    setSyncedQuery(query);
    if (query !== value.trim()) setValue(query);
  }

  React.useEffect(() => () => clearTimeout(timer.current), []);

  function change(next: string) {
    setValue(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(
      () => onSearch(next.trim(), "replace"),
      SEARCH_DEBOUNCE_MS,
    );
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearTimeout(timer.current);
    onSearch(value.trim(), "push");
  }

  function clear() {
    clearTimeout(timer.current);
    setValue("");
    onSearch("", "push");
  }

  return (
    <form
      className="flex flex-col gap-3 sm:flex-row"
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
          value={value}
          onChange={(event) => change(event.target.value)}
          placeholder="What material does your project need?"
          className="pr-12 pl-12"
          autoComplete="off"
        />
        {value ? (
          <button
            type="button"
            onClick={clear}
            aria-label="Clear search"
            className="text-ink-600 hover:bg-sage-100 absolute top-1/2 right-1 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-md"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        ) : null}
      </div>
      <Button type="submit" size="large">
        Search
      </Button>
    </form>
  );
}

function MaterialCatalog() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, status: sessionStatus } = useSession();
  const online = useOnline();
  const filters = React.useMemo(
    () => filtersFromSearchParams(searchParams),
    [searchParams],
  );
  const sort = sortFromSearchParams(searchParams);
  const { listings, status, error, retry } = useListings(filters, sort);
  const [filterOpen, setFilterOpen] = React.useState(false);
  const chips = describeActiveFilters(filters);
  const sidebarFilterCount = chips.filter((chip) => chip.key !== "query").length;
  const sidebarKey = filtersToSearchParams({
    ...filters,
    query: undefined,
  }).toString();

  function navigate(
    nextFilters: ListingFilters,
    nextSort: ListingSort = sort,
    mode: NavigateMode = "push",
  ) {
    const params = filtersToSearchParams(nextFilters, nextSort);
    const href = `/app/materials${params.size ? `?${params}` : ""}`;
    if (mode === "replace") router.replace(href);
    else router.push(href);
  }

  const resetAll = () => navigate({}, "recent");
  const applyPanel = (next: ListingFilters) =>
    navigate({ ...next, query: filters.query });

  const guest = sessionStatus === "ready" && !user;
  const homeHref =
    user?.activeWorkspace === "supplying" ? "/app/supplier" : "/app/buyer";
  const currentHref = `/app/materials${searchParams.size ? `?${searchParams}` : ""}`;

  const content = (
    <>
      <AppHeader
        title="Explore materials"
        description="Supplier-declared sample details"
        backHref={user ? homeHref : "/"}
        action={
          guest ? (
            <Button asChild variant="secondary">
              <Link href={`/login?returnTo=${encodeURIComponent(currentHref)}`}>
                Log in
              </Link>
            </Button>
          ) : null
        }
      />
      <main className="py-6 lg:py-10">
        <PageContainer size="app">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-timber-600 text-sm font-semibold">
                Local sample catalog
              </p>
              <h2 className="font-heading mt-1 text-3xl font-semibold tracking-[-0.035em]">
                Available offcuts
              </h2>
            </div>
          </div>

          {!online ? (
            <Alert className="mt-4 flex items-start gap-3">
              <WifiOff aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              <span>
                You&apos;re offline. Showing listings saved on this device;
                they may be out of date.
              </span>
            </Alert>
          ) : null}

          <div className="mt-6">
            <SearchField
              query={filters.query ?? ""}
              onSearch={(query, mode) =>
                navigate({ ...filters, query: query || undefined }, sort, mode)
              }
            />
          </div>

          <div className="mt-5 grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)]">
            <aside
              aria-label="Filters"
              className="hidden lg:sticky lg:top-24 lg:block lg:self-start"
            >
              <h3 className="font-heading mb-4 text-base font-semibold">
                Filters
              </h3>
              <ListingFilterForm
                key={sidebarKey}
                idPrefix="sidebar"
                initialFilters={filters}
                onApply={applyPanel}
              />
            </aside>

            <section aria-label="Results" className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="secondary"
                  className="lg:hidden"
                  onClick={() => setFilterOpen(true)}
                >
                  <SlidersHorizontal aria-hidden="true" />
                  Filters
                  {sidebarFilterCount ? (
                    <span
                      className="bg-brand-900 grid min-w-5 place-items-center rounded-full px-1.5 text-xs text-white"
                      aria-label={`${sidebarFilterCount} active`}
                    >
                      {sidebarFilterCount}
                    </span>
                  ) : null}
                </Button>
                <div className="ml-auto flex items-center gap-2">
                  <label
                    className="text-ink-600 text-sm"
                    htmlFor="catalog-sort"
                  >
                    Sort by
                  </label>
                  <select
                    id="catalog-sort"
                    value={sort}
                    onChange={(event) =>
                      navigate(filters, event.target.value as ListingSort)
                    }
                    className="border-line bg-surface min-h-11 rounded-md border px-3 text-sm"
                  >
                    {CATALOG_SORTS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {chips.length ? (
                <ul
                  className="mt-4 flex flex-wrap items-center gap-2"
                  aria-label="Active filters"
                >
                  {chips.map((chip) => (
                    <li key={chip.key}>
                      <button
                        type="button"
                        onClick={() =>
                          navigate(removeActiveFilter(filters, chip.key))
                        }
                        aria-label={`Remove filter ${chip.label}`}
                        className="border-line bg-surface hover:bg-sage-100 inline-flex min-h-9 max-w-full items-center gap-1.5 rounded-full border py-1 pr-2 pl-3 text-xs font-semibold"
                      >
                        <span className="truncate">{chip.label}</span>
                        <X aria-hidden="true" className="size-3.5 shrink-0" />
                      </button>
                    </li>
                  ))}
                  <li>
                    <Button variant="text" onClick={resetAll}>
                      Clear all
                    </Button>
                  </li>
                </ul>
              ) : null}

              <p
                className="text-ink-600 mt-5 text-sm"
                role="status"
                aria-live="polite"
              >
                {status === "ready"
                  ? `${listings.length} matching ${listings.length === 1 ? "batch" : "batches"}`
                  : "Loading batches"}{" "}
                · Demo listings are fictional and stored locally.
              </p>

              <div className="mt-4">
                {status === "loading" ? (
                  <LoadingState label="Loading material catalog..." rows={4} />
                ) : null}
                {status === "error" ? (
                  <ErrorState
                    description={error ?? undefined}
                    onRetry={() => void retry()}
                  />
                ) : null}
                {status === "ready" &&
                listings.length === 0 &&
                chips.length > 0 ? (
                  <EmptyState
                    title="No matching offcuts"
                    description="Try fewer filters, a shorter keyword, or a wider area."
                    action={<Button onClick={resetAll}>Clear all filters</Button>}
                  />
                ) : null}
                {status === "ready" &&
                listings.length === 0 &&
                chips.length === 0 ? (
                  <EmptyState
                    title="No materials listed yet"
                    description="Available offcut batches appear here as soon as a supplier publishes them."
                    action={
                      <Button asChild>
                        <Link href={user ? homeHref : "/"}>
                          {user ? "Back to home" : "Back to start"}
                        </Link>
                      </Button>
                    }
                  />
                ) : null}
                {status === "ready" && listings.length > 0 ? (
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,19rem),1fr))] gap-4">
                    {listings.map((listing) => (
                      <MaterialCard key={listing.id} listing={listing} />
                    ))}
                  </div>
                ) : null}
              </div>
            </section>
          </div>
        </PageContainer>
      </main>
      <ListingFilterSheet
        open={filterOpen}
        onOpenChange={setFilterOpen}
        initialFilters={filters}
        onApply={applyPanel}
      />
    </>
  );

  return user ? (
    <AppShell workspace={user.activeWorkspace}>{content}</AppShell>
  ) : (
    content
  );
}

export { MaterialCatalog };
