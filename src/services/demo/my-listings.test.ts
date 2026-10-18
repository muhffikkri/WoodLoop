import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type { Listing, MaterialRequest } from "@/domain/types";
import { getDemoDatabase } from "@/lib/demo-db";
import { demoDraftRepository } from "@/services/demo/draft-repository";
import { demoListingRepository } from "@/services/demo/listing-repository";

describe("My Listings repository actions and reservation boundaries", () => {
  const supplierId = "test-supplier-manage";
  const intruderId = "test-unauthorized-user";
  const listingId = "test-manage-batch-1";

  const initialListing: Listing = {
    id: listingId,
    supplierId,
    title: "Walnut Trim Offcuts",
    woodForm: "board",
    dimensions: { length: 600, width: 120, thickness: 18, approximate: false },
    quantityTotal: 25,
    quantityAvailable: 25,
    unit: "pieces",
    sourceProcess: "Cabinetry trim",
    region: "Tokyo",
    status: "active",
    photoIds: ["boards"],
    createdAt: "2026-10-01T00:00:00.000Z",
    updatedAt: "2026-10-01T00:00:00.000Z",
    stockCheckedAt: "2026-10-01T00:00:00.000Z",
    isDemo: false,
  };

  beforeEach(async () => {
    const db = getDemoDatabase();
    await db.listings.clear();
    await db.requests.clear();
    await db.drafts.clear();
    await db.listings.add({ ...initialListing });
  });

  afterEach(async () => {
    const db = getDemoDatabase();
    await db.listings.clear();
    await db.requests.clear();
    await db.drafts.clear();
  });

  describe("updateStock", () => {
    it("updates total quantity and refreshes stockCheckedAt", async () => {
      const updated = await demoListingRepository.updateStock(
        listingId,
        20,
        supplierId,
      );

      expect(updated.quantityTotal).toBe(20);
      expect(updated.quantityAvailable).toBe(20);
      expect(updated.status).toBe("active");
      expect(new Date(updated.stockCheckedAt!).getTime()).toBeGreaterThan(
        new Date("2026-10-01T00:00:00.000Z").getTime(),
      );
    });

    it("respects held reservations and calculates remaining available stock", async () => {
      const db = getDemoDatabase();
      const agreedRequest: MaterialRequest = {
        id: "req-held-1",
        listingId,
        supplierId,
        buyerId: "buyer-1",
        requestedQuantity: 5,
        reservedQuantity: 5,
        reservationState: "held",
        unit: "pieces",
        status: "agreed",
        message: "Sample test request",
        fulfillmentMethod: "pickup",
        history: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await db.requests.add(agreedRequest);

      // Total was 25, now updated to 20. With 5 held, 15 should be available.
      const updated = await demoListingRepository.updateStock(
        listingId,
        20,
        supplierId,
      );

      expect(updated.quantityTotal).toBe(20);
      expect(updated.quantityAvailable).toBe(15);
      expect(updated.status).toBe("active");
    });

    it("strictly blocks reducing total quantity below held reservation quantity", async () => {
      const db = getDemoDatabase();
      const agreedRequest: MaterialRequest = {
        id: "req-held-2",
        listingId,
        supplierId,
        buyerId: "buyer-1",
        requestedQuantity: 8,
        reservedQuantity: 8,
        reservationState: "held",
        unit: "pieces",
        status: "agreed",
        message: "Sample test request",
        fulfillmentMethod: "pickup",
        history: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await db.requests.add(agreedRequest);

      // Attempt to reduce total to 7 when 8 are reserved
      await expect(
        demoListingRepository.updateStock(listingId, 7, supplierId),
      ).rejects.toThrow("Cannot reduce total quantity below 8 pieces");
    });

    it("switches status to reserved if new total exactly equals held reserved quantity", async () => {
      const db = getDemoDatabase();
      const agreedRequest: MaterialRequest = {
        id: "req-held-3",
        listingId,
        supplierId,
        buyerId: "buyer-1",
        requestedQuantity: 10,
        reservedQuantity: 10,
        reservationState: "held",
        unit: "pieces",
        status: "agreed",
        message: "Sample test request",
        fulfillmentMethod: "pickup",
        history: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await db.requests.add(agreedRequest);

      // Total set to exactly 10 -> available becomes 0 -> status becomes "reserved"
      const updated = await demoListingRepository.updateStock(
        listingId,
        10,
        supplierId,
      );

      expect(updated.quantityTotal).toBe(10);
      expect(updated.quantityAvailable).toBe(0);
      expect(updated.status).toBe("reserved");
    });

    it("rejects unauthorized user trying to update stock", async () => {
      await expect(
        demoListingRepository.updateStock(listingId, 15, intruderId),
      ).rejects.toThrow("Only the listing owner can update this batch.");
    });

    it("rejects invalid non-positive or non-integer stock values", async () => {
      await expect(
        demoListingRepository.updateStock(listingId, 0, supplierId),
      ).rejects.toThrow("Total quantity must be a positive whole number.");

      await expect(
        demoListingRepository.updateStock(listingId, -5, supplierId),
      ).rejects.toThrow("Total quantity must be a positive whole number.");

      await expect(
        demoListingRepository.updateStock(listingId, 12.5, supplierId),
      ).rejects.toThrow("Total quantity must be a positive whole number.");
    });
  });

  describe("confirmAvailability", () => {
    it("updates stockCheckedAt timestamp without altering inventory", async () => {
      const updated = await demoListingRepository.confirmAvailability(
        listingId,
        supplierId,
      );

      expect(updated.quantityTotal).toBe(25);
      expect(updated.quantityAvailable).toBe(25);
      expect(new Date(updated.stockCheckedAt!).getTime()).toBeGreaterThan(
        new Date("2026-10-01T00:00:00.000Z").getTime(),
      );
    });

    it("rejects unauthorized user trying to confirm availability", async () => {
      await expect(
        demoListingRepository.confirmAvailability(listingId, intruderId),
      ).rejects.toThrow("Only the listing owner can confirm availability.");
    });
  });

  describe("setAvailability", () => {
    it("marks active batch as unavailable", async () => {
      await demoListingRepository.setAvailability(
        listingId,
        "unavailable",
        supplierId,
      );

      const db = getDemoDatabase();
      const listing = await db.listings.get(listingId);
      expect(listing?.status).toBe("unavailable");
    });

    it("reactivates unavailable batch", async () => {
      await demoListingRepository.setAvailability(
        listingId,
        "unavailable",
        supplierId,
      );
      await demoListingRepository.setAvailability(
        listingId,
        "active",
        supplierId,
      );

      const db = getDemoDatabase();
      const listing = await db.listings.get(listingId);
      expect(listing?.status).toBe("active");
    });

    it("sets status to reserved if reactivating a batch with 0 available quantity", async () => {
      const db = getDemoDatabase();
      await db.listings.update(listingId, {
        quantityAvailable: 0,
        status: "unavailable",
      });

      await demoListingRepository.setAvailability(
        listingId,
        "active",
        supplierId,
      );

      const listing = await db.listings.get(listingId);
      expect(listing?.status).toBe("reserved");
    });

    it("rejects unauthorized user trying to toggle availability", async () => {
      await expect(
        demoListingRepository.setAvailability(
          listingId,
          "unavailable",
          intruderId,
        ),
      ).rejects.toThrow("Only the listing owner can update availability.");
    });
  });

  describe("DraftRepository.listBySupplier", () => {
    it("returns drafts for supplier sorted newest to oldest", async () => {
      const db = getDemoDatabase();
      await db.drafts.bulkAdd([
        {
          id: "draft-old",
          supplierId,
          values: { title: "Old draft" },
          photoIds: [],
          currentStep: "photos",
          updatedAt: "2026-10-01T10:00:00.000Z",
          schemaVersion: 1,
        },
        {
          id: "draft-new",
          supplierId,
          values: { title: "New draft" },
          photoIds: [],
          currentStep: "details",
          updatedAt: "2026-10-05T12:00:00.000Z",
          schemaVersion: 1,
        },
        {
          id: "draft-other-user",
          supplierId: "other-user",
          values: { title: "Someone else" },
          photoIds: [],
          currentStep: "photos",
          updatedAt: "2026-10-06T12:00:00.000Z",
          schemaVersion: 1,
        },
      ]);

      const drafts = await demoDraftRepository.listBySupplier(supplierId);
      expect(drafts).toHaveLength(2);
      expect(drafts[0].id).toBe("draft-new");
      expect(drafts[1].id).toBe("draft-old");
    });
  });
});
