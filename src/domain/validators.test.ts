import {
  listingInputSchema,
  newRequestSchema,
  photoMetadataSchema,
} from "@/domain/validators";
import { describe, expect, it } from "vitest";

const validListing = {
  title: "Solid wood board offcuts",
  woodForm: "board" as const,
  dimensions: {
    length: 250,
    width: 100,
    thickness: 20,
    approximate: false,
  },
  quantityTotal: 12,
  unit: "pieces" as const,
  sourceProcess: "Cutting",
  region: "Tokyo",
  declaredTreatment: "untreated" as const,
  photoIds: ["photo-1"],
};

describe("foundation domain validation", () => {
  it("accepts a truthful in-scope listing", () => {
    expect(listingInputSchema.safeParse(validListing).success).toBe(true);
  });

  it("blocks treated material from active marketplace input", () => {
    const result = listingInputSchema.safeParse({
      ...validListing,
      declaredTreatment: "treated",
    });

    expect(result.success).toBe(false);
  });

  it("rejects fractional requests", () => {
    const fractional = newRequestSchema.safeParse({
      listingId: "listing-1",
      requestedQuantity: 1.5,
      unit: "pieces",
      message: "Could I collect these next week?",
      fulfillmentMethod: "pickup",
    });

    expect(fractional.success).toBe(false);
  });

  it("enforces the documented photo size boundary", () => {
    expect(
      photoMetadataSchema.safeParse({
        type: "image/jpeg",
        size: 10 * 1024 * 1024 + 1,
      }).success,
    ).toBe(false);
  });
});
