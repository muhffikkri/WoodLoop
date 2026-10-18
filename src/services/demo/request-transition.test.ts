import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type { Listing } from "@/domain/types";
import { getDemoDatabase } from "@/lib/demo-db";
import { demoRequestRepository } from "@/services/demo/request-repository";

describe("RequestRepository state machine & atomic stock reservation", () => {
  const buyerId = "test-buyer-1";
  const supplierId = "test-supplier-1";
  const listingId = "test-listing-1";

  const initialListing: Listing = {
    id: listingId,
    supplierId,
    title: "Reclaimed Cedar Boards",
    woodForm: "board",
    dimensions: { length: 800, width: 150, thickness: 25, approximate: false },
    quantityTotal: 10,
    quantityAvailable: 10,
    unit: "pieces",
    sourceProcess: "Trim offcut",
    region: "Tokyo",
    status: "active",
    photoIds: ["boards"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDemo: false,
  };

  beforeEach(async () => {
    const db = getDemoDatabase();
    await db.listings.clear();
    await db.requests.clear();
    await db.messages.clear();
    await db.listings.add({ ...initialListing });
  });

  afterEach(async () => {
    const db = getDemoDatabase();
    await db.listings.clear();
    await db.requests.clear();
    await db.messages.clear();
  });

  it("creates a new request with inquiry note", async () => {
    const request = await demoRequestRepository.create(
      {
        listingId,
        requestedQuantity: 4,
        unit: "pieces",
        message: "Need for tabletop framing",
        fulfillmentMethod: "pickup",
      },
      buyerId,
    );

    expect(request.id).toBeDefined();
    expect(request.status).toBe("new");
    expect(request.requestedQuantity).toBe(4);
    expect(request.message).toBe("Need for tabletop framing");
    expect(request.history).toHaveLength(1);
    expect(request.history[0]?.status).toBe("new");
  });

  it("prevents requesting one's own listing", async () => {
    await expect(
      demoRequestRepository.create(
        {
          listingId,
          requestedQuantity: 2,
          unit: "pieces",
          message: "Own request",
          fulfillmentMethod: "pickup",
        },
        supplierId,
      ),
    ).rejects.toThrow(/cannot request your own listing/i);
  });

  it("prevents requesting more quantity than available", async () => {
    await expect(
      demoRequestRepository.create(
        {
          listingId,
          requestedQuantity: 15,
          unit: "pieces",
          message: "Too many pieces",
          fulfillmentMethod: "pickup",
        },
        buyerId,
      ),
    ).rejects.toThrow(/Only 10 pieces are available/i);
  });

  it("only allows supplier to confirm availability", async () => {
    const request = await demoRequestRepository.create(
      {
        listingId,
        requestedQuantity: 4,
        unit: "pieces",
        message: "Inquiry",
        fulfillmentMethod: "pickup",
      },
      buyerId,
    );

    // Buyer cannot confirm availability
    await expect(
      demoRequestRepository.transition(
        request.id,
        "awaiting_supplier_confirmation",
        buyerId,
      ),
    ).rejects.toThrow(/Only the supplier can confirm availability/i);

    // Supplier can confirm
    const updated = await demoRequestRepository.transition(
      request.id,
      "awaiting_supplier_confirmation",
      supplierId,
    );
    expect(updated.status).toBe("awaiting_supplier_confirmation");
  });

  it("atomically reserves stock on agreement and deducts from listing", async () => {
    const request = await demoRequestRepository.create(
      {
        listingId,
        requestedQuantity: 6,
        unit: "pieces",
        message: "Inquiry",
        fulfillmentMethod: "pickup",
      },
      buyerId,
    );

    const agreed = await demoRequestRepository.transition(
      request.id,
      "agreed",
      supplierId,
      { agreedQuantity: 6 },
    );

    expect(agreed.status).toBe("agreed");
    expect(agreed.agreedQuantity).toBe(6);
    expect(agreed.reservedQuantity).toBe(6);
    expect(agreed.reservationState).toBe("held");

    const db = getDemoDatabase();
    const listing = await db.listings.get(listingId);
    expect(listing?.quantityAvailable).toBe(4);
    expect(listing?.status).toBe("active");
  });

  it("marks listing as reserved when available stock hits 0", async () => {
    const request = await demoRequestRepository.create(
      {
        listingId,
        requestedQuantity: 10,
        unit: "pieces",
        message: "Take all",
        fulfillmentMethod: "pickup",
      },
      buyerId,
    );

    await demoRequestRepository.transition(request.id, "agreed", supplierId, {
      agreedQuantity: 10,
    });

    const db = getDemoDatabase();
    const listing = await db.listings.get(listingId);
    expect(listing?.quantityAvailable).toBe(0);
    expect(listing?.status).toBe("reserved");
  });

  it("restores reserved stock exactly once if request is closed before completion", async () => {
    const request = await demoRequestRepository.create(
      {
        listingId,
        requestedQuantity: 10,
        unit: "pieces",
        message: "Take all",
        fulfillmentMethod: "pickup",
      },
      buyerId,
    );

    // Agree -> stock becomes 0, status 'reserved'
    await demoRequestRepository.transition(request.id, "agreed", supplierId, {
      agreedQuantity: 10,
    });

    // Close before completion (e.g. buyer withdraws or supplier cancels)
    const closed = await demoRequestRepository.transition(
      request.id,
      "closed",
      supplierId,
      { reason: "Buyer cannot arrange transport" },
    );

    expect(closed.status).toBe("closed");
    expect(closed.reservationState).toBe("released");

    const db = getDemoDatabase();
    const listing = await db.listings.get(listingId);
    expect(listing?.quantityAvailable).toBe(10);
    expect(listing?.status).toBe("active");

    // Cannot close again
    await expect(
      demoRequestRepository.transition(request.id, "closed", supplierId),
    ).rejects.toThrow(/already closed/i);
  });

  it("marks handover completed and permanently consumes stock", async () => {
    const request = await demoRequestRepository.create(
      {
        listingId,
        requestedQuantity: 5,
        unit: "pieces",
        message: "Need 5",
        fulfillmentMethod: "pickup",
      },
      buyerId,
    );

    await demoRequestRepository.transition(request.id, "agreed", supplierId, {
      agreedQuantity: 5,
    });

    const completed = await demoRequestRepository.transition(
      request.id,
      "completed",
      supplierId,
    );

    expect(completed.status).toBe("completed");
    expect(completed.reservationState).toBe("consumed");

    const db = getDemoDatabase();
    const listing = await db.listings.get(listingId);
    // Consumed: stock remains 5
    expect(listing?.quantityAvailable).toBe(5);

    // Completed request cannot be closed
    await expect(
      demoRequestRepository.transition(request.id, "closed", supplierId),
    ).rejects.toThrow(/Completed requests cannot be closed/i);
  });

  it("appends messages and rejects non-participants", async () => {
    const request = await demoRequestRepository.create(
      {
        listingId,
        requestedQuantity: 2,
        unit: "pieces",
        message: "Initial",
        fulfillmentMethod: "pickup",
      },
      buyerId,
    );

    // Supplier replies
    await demoRequestRepository.addMessage(
      request.id,
      "Pickup is ready after 2 PM tomorrow",
      supplierId,
    );

    // Non-participant tries to send message
    await expect(
      demoRequestRepository.addMessage(
        request.id,
        "Intruder message",
        "random-user",
      ),
    ).rejects.toThrow(/permission/i);

    const msgs = await demoRequestRepository.getMessages(request.id);
    expect(msgs).toHaveLength(1);
    expect(msgs[0]?.body).toBe("Pickup is ready after 2 PM tomorrow");
  });
});
