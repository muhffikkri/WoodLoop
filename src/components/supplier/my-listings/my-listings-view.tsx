"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Boxes,
  Clock,
  EyeOff,
  FileEdit,
  PackagePlus,
  Search,
} from "lucide-react";

import { useSession } from "@/components/auth/session-provider";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Listing, ListingDraft } from "@/domain/types";
import { demoDraftRepository } from "@/services/demo/draft-repository";
import { demoListingRepository } from "@/services/demo/listing-repository";

import { MyDraftCard } from "./my-draft-card";
import { MyListingCard } from "./my-listing-card";
import { ToggleAvailabilityDialog } from "./toggle-availability-dialog";
import { UpdateStockDialog } from "./update-stock-dialog";

type TabType = "active" | "reserved" | "unavailable" | "drafts";

export function MyListingsView() {
  const { user } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [activeTab, setActiveTab] = React.useState<TabType>(() => {
    const tabParam = searchParams.get("tab");
    if (
      tabParam === "active" ||
      tabParam === "reserved" ||
      tabParam === "unavailable" ||
      tabParam === "drafts"
    ) {
      return tabParam;
    }
    return "active";
  });

  const [searchQuery, setSearchQuery] = React.useState("");
  const [listings, setListings] = React.useState<Listing[]>([]);
  const [drafts, setDrafts] = React.useState<ListingDraft[]>([]);
  const [heldReservations, setHeldReservations] = React.useState<Map<string, number>>(
    new Map(),
  );
  const [status, setStatus] = React.useState<"loading" | "ready" | "error">(
    "loading",
  );

  // Dialog states
  const [stockListing, setStockListing] = React.useState<Listing | null>(null);
  const [stockDialogOpen, setStockDialogOpen] = React.useState(false);

  const [toggleListing, setToggleListing] = React.useState<Listing | null>(null);
  const [toggleDialogOpen, setToggleDialogOpen] = React.useState(false);

  // Sync tab with URL
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`/app/listings?${params.toString()}`, { scroll: false });
  };

  const fetchData = React.useCallback(async () => {
    if (!user) return null;
    const [supplierListings, supplierDrafts] = await Promise.all([
      demoListingRepository.listBySupplier(user.id),
      demoDraftRepository.listBySupplier(user.id),
    ]);

    const reservationsMap = new Map<string, number>();
    await Promise.all(
      supplierListings.map(async (l) => {
        const held = await demoListingRepository.getHeldReservationQuantity(l.id);
        reservationsMap.set(l.id, held);
      }),
    );

    return {
      listings: supplierListings,
      drafts: supplierDrafts,
      reservations: reservationsMap,
    };
  }, [user]);

  const refresh = React.useCallback(() => {
    return fetchData()
      .then((data) => {
        if (data) {
          setListings(data.listings);
          setDrafts(data.drafts);
          setHeldReservations(data.reservations);
          setStatus("ready");
        }
      })
      .catch(() => {
        setStatus("error");
      });
  }, [fetchData]);

  React.useEffect(() => {
    let active = true;

    const update = () => {
      void fetchData()
        .then((data) => {
          if (!active || !data) return;
          setListings(data.listings);
          setDrafts(data.drafts);
          setHeldReservations(data.reservations);
          setStatus("ready");
        })
        .catch(() => {
          if (active) setStatus("error");
        });
    };

    update();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        update();
      }
    };

    window.addEventListener("woodloop:listings-changed", update);
    window.addEventListener("woodloop:requests-changed", update);
    window.addEventListener("woodloop:draft-saved", update);
    window.addEventListener("woodloop:draft-removed", update);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      active = false;
      window.removeEventListener("woodloop:listings-changed", update);
      window.removeEventListener("woodloop:requests-changed", update);
      window.removeEventListener("woodloop:draft-saved", update);
      window.removeEventListener("woodloop:draft-removed", update);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchData]);

  // Tab counts
  const activeListings = React.useMemo(
    () => listings.filter((l) => l.status === "active"),
    [listings],
  );
  const reservedListings = React.useMemo(
    () => listings.filter((l) => l.status === "reserved"),
    [listings],
  );
  const unavailableListings = React.useMemo(
    () => listings.filter((l) => l.status === "unavailable"),
    [listings],
  );

  const counts = {
    active: activeListings.length,
    reserved: reservedListings.length,
    unavailable: unavailableListings.length,
    drafts: drafts.length,
  };

  // Filter items by search query if present
  const query = searchQuery.trim().toLowerCase();

  const filteredActive = React.useMemo(
    () =>
      activeListings.filter(
        (l) =>
          !query ||
          l.title.toLowerCase().includes(query) ||
          l.region.toLowerCase().includes(query) ||
          l.woodForm.toLowerCase().includes(query),
      ),
    [activeListings, query],
  );

  const filteredReserved = React.useMemo(
    () =>
      reservedListings.filter(
        (l) =>
          !query ||
          l.title.toLowerCase().includes(query) ||
          l.region.toLowerCase().includes(query) ||
          l.woodForm.toLowerCase().includes(query),
      ),
    [reservedListings, query],
  );

  const filteredUnavailable = React.useMemo(
    () =>
      unavailableListings.filter(
        (l) =>
          !query ||
          l.title.toLowerCase().includes(query) ||
          l.region.toLowerCase().includes(query) ||
          l.woodForm.toLowerCase().includes(query),
      ),
    [unavailableListings, query],
  );

  const filteredDrafts = React.useMemo(
    () =>
      drafts.filter(
        (d) =>
          !query ||
          (d.values.title && d.values.title.toLowerCase().includes(query)) ||
          (d.values.woodForm && d.values.woodForm.toLowerCase().includes(query)),
      ),
    [drafts, query],
  );

  const totalAllItems = listings.length + drafts.length;

  if (status === "loading") {
    return (
      <>
        <AppHeader title="My listings" backHref="/app/supplier" />
        <main className="py-6 sm:py-8 lg:py-10">
          <PageContainer size="app">
            <LoadingState label="Loading your listings..." rows={4} />
          </PageContainer>
        </main>
      </>
    );
  }

  if (status === "error") {
    return (
      <>
        <AppHeader title="My listings" backHref="/app/supplier" />
        <main className="py-6 sm:py-8 lg:py-10">
          <PageContainer size="app">
            <ErrorState
              title="Could not load listings"
              description="WoodLoop could not read your locally saved listings and drafts."
              onRetry={() => {
                setStatus("loading");
                void refresh();
              }}
            />
          </PageContainer>
        </main>
      </>
    );
  }

  return (
    <>
      <AppHeader title="My listings" backHref="/app/supplier" />
      <main className="py-6 sm:py-8 lg:py-10">
        <PageContainer size="app">
          {/* Top Actions & Overview */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-heading text-2xl font-semibold text-ink-900">
                Batch Inventory
              </h2>
              <p className="text-ink-600 mt-1 text-sm">
                Manage offcut stock, verify batch availability, and monitor buyer reservations.
              </p>
            </div>
            <Button asChild size="large" className="w-full sm:w-auto shrink-0">
              <Link href="/app/listings/new">
                <PackagePlus aria-hidden="true" className="size-4" />
                Add wood offcut
              </Link>
            </Button>
          </div>

          {totalAllItems === 0 ? (
            <div className="mt-8">
              <EmptyState
                icon={Boxes}
                title="You haven't listed any offcut batches yet"
                description="List your reclaimed and workshop timber offcuts so verified buyers can reserve and collect them."
                action={
                  <Button asChild size="large">
                    <Link href="/app/listings/new">
                      <PackagePlus aria-hidden="true" />
                      Add wood offcut
                    </Link>
                  </Button>
                }
              />
            </div>
          ) : (
            <>
              {/* Controls bar: Tabs and Search */}
              <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-line pb-4">
                {/* Status Tabs */}
                <div
                  role="tablist"
                  aria-label="Filter listings by status"
                  className="flex flex-wrap items-center gap-2"
                >
                  <button
                    type="button"
                    role="tab"
                    id="tab-active"
                    aria-selected={activeTab === "active"}
                    aria-controls="panel-active"
                    onClick={() => handleTabChange("active")}
                    className={`inline-flex items-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition-colors ${
                      activeTab === "active"
                        ? "bg-brand-900 text-white font-semibold shadow-xs"
                        : "bg-surface hover:bg-sage-100 text-ink-900 border border-line"
                    }`}
                  >
                    <Boxes className="size-4" />
                    <span>Active</span>
                    <Badge
                      variant={activeTab === "active" ? "demo" : "available"}
                      className="ml-1 text-[11px] px-1.5 py-0"
                    >
                      {counts.active}
                    </Badge>
                  </button>

                  <button
                    type="button"
                    role="tab"
                    id="tab-reserved"
                    aria-selected={activeTab === "reserved"}
                    aria-controls="panel-reserved"
                    onClick={() => handleTabChange("reserved")}
                    className={`inline-flex items-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition-colors ${
                      activeTab === "reserved"
                        ? "bg-brand-900 text-white font-semibold shadow-xs"
                        : "bg-surface hover:bg-sage-100 text-ink-900 border border-line"
                    }`}
                  >
                    <Clock className="size-4" />
                    <span>Reserved</span>
                    <Badge
                      variant={activeTab === "reserved" ? "demo" : "reserved"}
                      className="ml-1 text-[11px] px-1.5 py-0"
                    >
                      {counts.reserved}
                    </Badge>
                  </button>

                  <button
                    type="button"
                    role="tab"
                    id="tab-unavailable"
                    aria-selected={activeTab === "unavailable"}
                    aria-controls="panel-unavailable"
                    onClick={() => handleTabChange("unavailable")}
                    className={`inline-flex items-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition-colors ${
                      activeTab === "unavailable"
                        ? "bg-brand-900 text-white font-semibold shadow-xs"
                        : "bg-surface hover:bg-sage-100 text-ink-900 border border-line"
                    }`}
                  >
                    <EyeOff className="size-4" />
                    <span>Unavailable</span>
                    <Badge
                      variant={activeTab === "unavailable" ? "demo" : "unavailable"}
                      className="ml-1 text-[11px] px-1.5 py-0"
                    >
                      {counts.unavailable}
                    </Badge>
                  </button>

                  <button
                    type="button"
                    role="tab"
                    id="tab-drafts"
                    aria-selected={activeTab === "drafts"}
                    aria-controls="panel-drafts"
                    onClick={() => handleTabChange("drafts")}
                    className={`inline-flex items-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition-colors ${
                      activeTab === "drafts"
                        ? "bg-brand-900 text-white font-semibold shadow-xs"
                        : "bg-surface hover:bg-sage-100 text-ink-900 border border-line"
                    }`}
                  >
                    <FileEdit className="size-4" />
                    <span>Drafts</span>
                    <Badge
                      variant={activeTab === "drafts" ? "demo" : "unverified"}
                      className="ml-1 text-[11px] px-1.5 py-0"
                    >
                      {counts.drafts}
                    </Badge>
                  </button>
                </div>

                {/* Search filter within tab */}
                <div className="relative w-full sm:w-72">
                  <Search
                    aria-hidden="true"
                    className="text-ink-600 absolute left-3 top-1/2 size-4 -translate-y-1/2"
                  />
                  <Input
                    type="search"
                    placeholder="Search batches..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 text-xs"
                    aria-label="Search within my listings"
                  />
                </div>
              </div>

              {/* Active Tab Panel */}
              {activeTab === "active" ? (
                <div
                  role="tabpanel"
                  id="panel-active"
                  aria-labelledby="tab-active"
                  className="mt-6"
                >
                  {filteredActive.length === 0 ? (
                    <EmptyState
                      icon={Boxes}
                      title={query ? "No matching active batches" : "No active listings"}
                      description={
                        query
                          ? "Try a different search query or clear your filter."
                          : "You do not have any active listings in the catalog right now."
                      }
                      action={
                        query ? (
                          <Button
                            variant="secondary"
                            onClick={() => setSearchQuery("")}
                          >
                            Clear search
                          </Button>
                        ) : (
                          <Button asChild>
                            <Link href="/app/listings/new">Add wood offcut</Link>
                          </Button>
                        )
                      }
                    />
                  ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {filteredActive.map((listing) => (
                        <MyListingCard
                          key={listing.id}
                          listing={listing}
                          heldReserved={heldReservations.get(listing.id) ?? 0}
                          userId={user?.id ?? ""}
                          onUpdateQuantity={(l) => {
                            setStockListing(l);
                            setStockDialogOpen(true);
                          }}
                          onToggleAvailability={(l) => {
                            setToggleListing(l);
                            setToggleDialogOpen(true);
                          }}
                          onAvailabilityConfirmed={refresh}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : null}

              {/* Reserved Tab Panel */}
              {activeTab === "reserved" ? (
                <div
                  role="tabpanel"
                  id="panel-reserved"
                  aria-labelledby="tab-reserved"
                  className="mt-6"
                >
                  {filteredReserved.length === 0 ? (
                    <EmptyState
                      icon={Clock}
                      title={query ? "No matching reserved batches" : "No reserved listings"}
                      description={
                        query
                          ? "Try a different search query or clear your filter."
                          : "Listings appear here when all available stock is held by agreed requests."
                      }
                      action={
                        query ? (
                          <Button
                            variant="secondary"
                            onClick={() => setSearchQuery("")}
                          >
                            Clear search
                          </Button>
                        ) : undefined
                      }
                    />
                  ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {filteredReserved.map((listing) => (
                        <MyListingCard
                          key={listing.id}
                          listing={listing}
                          heldReserved={heldReservations.get(listing.id) ?? 0}
                          userId={user?.id ?? ""}
                          onUpdateQuantity={(l) => {
                            setStockListing(l);
                            setStockDialogOpen(true);
                          }}
                          onToggleAvailability={(l) => {
                            setToggleListing(l);
                            setToggleDialogOpen(true);
                          }}
                          onAvailabilityConfirmed={refresh}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : null}

              {/* Unavailable Tab Panel */}
              {activeTab === "unavailable" ? (
                <div
                  role="tabpanel"
                  id="panel-unavailable"
                  aria-labelledby="tab-unavailable"
                  className="mt-6"
                >
                  {filteredUnavailable.length === 0 ? (
                    <EmptyState
                      icon={EyeOff}
                      title={query ? "No matching unavailable batches" : "No unavailable listings"}
                      description={
                        query
                          ? "Try a different search query or clear your filter."
                          : "Batches you mark unavailable are hidden from new buyer searches and inquiries."
                      }
                      action={
                        query ? (
                          <Button
                            variant="secondary"
                            onClick={() => setSearchQuery("")}
                          >
                            Clear search
                          </Button>
                        ) : undefined
                      }
                    />
                  ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {filteredUnavailable.map((listing) => (
                        <MyListingCard
                          key={listing.id}
                          listing={listing}
                          heldReserved={heldReservations.get(listing.id) ?? 0}
                          userId={user?.id ?? ""}
                          onUpdateQuantity={(l) => {
                            setStockListing(l);
                            setStockDialogOpen(true);
                          }}
                          onToggleAvailability={(l) => {
                            setToggleListing(l);
                            setToggleDialogOpen(true);
                          }}
                          onAvailabilityConfirmed={refresh}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : null}

              {/* Drafts Tab Panel */}
              {activeTab === "drafts" ? (
                <div
                  role="tabpanel"
                  id="panel-drafts"
                  aria-labelledby="tab-drafts"
                  className="mt-6"
                >
                  {filteredDrafts.length === 0 ? (
                    <EmptyState
                      icon={FileEdit}
                      title={query ? "No matching drafts" : "No saved drafts"}
                      description={
                        query
                          ? "Try a different search query or clear your filter."
                          : "When you start creating a listing and pause, your saved drafts will appear here."
                      }
                      action={
                        query ? (
                          <Button
                            variant="secondary"
                            onClick={() => setSearchQuery("")}
                          >
                            Clear search
                          </Button>
                        ) : (
                          <Button asChild>
                            <Link href="/app/listings/new">Start a listing</Link>
                          </Button>
                        )
                      }
                    />
                  ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {filteredDrafts.map((draft) => (
                        <MyDraftCard
                          key={draft.id}
                          draft={draft}
                          userId={user?.id ?? ""}
                          onDiscardSuccess={refresh}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : null}
            </>
          )}

          {/* Dialogs */}
          <UpdateStockDialog
            listing={stockListing}
            heldReserved={
              stockListing ? (heldReservations.get(stockListing.id) ?? 0) : 0
            }
            open={stockDialogOpen}
            onOpenChange={setStockDialogOpen}
            userId={user?.id ?? ""}
            onSuccess={refresh}
          />

          <ToggleAvailabilityDialog
            listing={toggleListing}
            heldReserved={
              toggleListing ? (heldReservations.get(toggleListing.id) ?? 0) : 0
            }
            open={toggleDialogOpen}
            onOpenChange={setToggleDialogOpen}
            userId={user?.id ?? ""}
            onSuccess={refresh}
          />
        </PageContainer>
      </main>
    </>
  );
}
