import type { Listing, MaterialRequest } from "@/domain/types";

/** Prototype rule only — not real market validation. */
export const STOCK_CHECK_STALE_DAYS = 14;
const DAY_MS = 24 * 60 * 60 * 1000;

export const OPEN_REQUEST_STATUSES: ReadonlyArray<MaterialRequest["status"]> = [
  "new",
  "awaiting_supplier_confirmation",
];

export function needsStockUpdate(listing: Listing, now = new Date()) {
  if (listing.status !== "active") return false;
  if (!listing.stockCheckedAt) return true;
  const checked = Date.parse(listing.stockCheckedAt);
  if (Number.isNaN(checked)) return true;
  return now.getTime() - checked > STOCK_CHECK_STALE_DAYS * DAY_MS;
}

export function computeSupplierStats(
  listings: Listing[],
  incomingRequests: MaterialRequest[],
  now = new Date(),
) {
  return {
    activeListings: listings.filter((listing) => listing.status === "active")
      .length,
    openRequests: incomingRequests.filter((request) =>
      OPEN_REQUEST_STATUSES.includes(request.status),
    ).length,
    needsStockUpdate: listings.filter((listing) =>
      needsStockUpdate(listing, now),
    ).length,
  };
}
