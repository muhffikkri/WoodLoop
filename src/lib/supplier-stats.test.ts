import { describe, expect, it } from "vitest";

import type { Listing, MaterialRequest } from "@/domain/types";
import { computeSupplierStats, needsStockUpdate } from "@/lib/supplier-stats";
import { DEMO_LISTINGS } from "@/services/demo/demo-listings";

const now = new Date("2026-10-18T09:00:00.000Z");
const base = DEMO_LISTINGS[0] as Listing;

function listing(patch: Partial<Listing>): Listing {
  return { ...base, ...patch };
}

function request(status: MaterialRequest["status"]): MaterialRequest {
  return {
    id: status,
    listingId: base.id,
    buyerId: "demo-buyer",
    supplierId: base.supplierId,
    requestedQuantity: 2,
    unit: "pieces",
    message: "Is this still available?",
    fulfillmentMethod: "pickup",
    status,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    history: [],
  };
}

describe("supplier stats", () => {
  it("flags active listings with a missing or stale stock check", () => {
    expect(needsStockUpdate(listing({ stockCheckedAt: undefined }), now)).toBe(
      true,
    );
    expect(
      needsStockUpdate(
        listing({ stockCheckedAt: "2026-10-01T09:00:00.000Z" }),
        now,
      ),
    ).toBe(true);
    expect(
      needsStockUpdate(
        listing({ stockCheckedAt: "2026-10-10T09:00:00.000Z" }),
        now,
      ),
    ).toBe(false);
  });

  it("ignores inactive listings for stock updates", () => {
    expect(
      needsStockUpdate(
        listing({ status: "unavailable", stockCheckedAt: undefined }),
        now,
      ),
    ).toBe(false);
  });

  it("counts active listings and open requests only", () => {
    const stats = computeSupplierStats(
      [
        listing({ id: "a" }),
        listing({ id: "b", status: "unavailable" }),
        listing({ id: "c", status: "reserved" }),
      ],
      [
        request("new"),
        request("awaiting_supplier_confirmation"),
        request("agreed"),
        request("closed"),
      ],
      now,
    );
    expect(stats).toEqual({
      activeListings: 1,
      openRequests: 2,
      needsStockUpdate: 0,
    });
  });
});
