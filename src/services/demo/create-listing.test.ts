import { describe, expect, it } from "vitest";

import { listingInputSchema, photoMetadataSchema } from "@/domain/validators";

describe("Listing creation validation", () => {
  const validBatch = {
    title: "Solid oak board offcuts",
    woodForm: "board",
    dimensions: {
      length: 720,
      width: 180,
      thickness: 20,
      approximate: false,
    },
    quantityTotal: 12,
    unit: "pieces",
    sourceProcess: "Cabinet panel trimming",
    region: "Setagaya, Tokyo",
    declaredSpecies: "Oak",
    declaredTreatment: "untreated",
    photoIds: ["photo-1"],
  };

  it("accepts valid batch listing specifications", () => {
    const result = listingInputSchema.safeParse(validBatch);
    expect(result.success).toBe(true);
  });

  it("rejects listing title shorter than 5 characters or longer than 80", () => {
    const tooShort = listingInputSchema.safeParse({
      ...validBatch,
      title: "Wood",
    });
    expect(tooShort.success).toBe(false);

    const tooLong = listingInputSchema.safeParse({
      ...validBatch,
      title: "a".repeat(81),
    });
    expect(tooLong.success).toBe(false);
  });

  it("blocks chemically treated wood from being published active", () => {
    const treated = listingInputSchema.safeParse({
      ...validBatch,
      declaredTreatment: "treated",
    });
    expect(treated.success).toBe(false);
    if (!treated.success) {
      const treatmentError = treated.error.issues.find((i) =>
        i.path.includes("declaredTreatment"),
      );
      expect(treatmentError?.message).toContain("Treated material cannot be published");
    }
  });

  it("allows unmeasured dimensions with null values", () => {
    const unmeasured = listingInputSchema.safeParse({
      ...validBatch,
      dimensions: {
        length: null,
        width: null,
        thickness: null,
        approximate: true,
      },
    });
    expect(unmeasured.success).toBe(true);
  });

  it("requires between 1 and 8 photos", () => {
    const noPhotos = listingInputSchema.safeParse({
      ...validBatch,
      photoIds: [],
    });
    expect(noPhotos.success).toBe(false);

    const tooManyPhotos = listingInputSchema.safeParse({
      ...validBatch,
      photoIds: Array.from({ length: 9 }, (_, i) => `photo-${i}`),
    });
    expect(tooManyPhotos.success).toBe(false);
  });

  it("validates photo file format and 10MB limit", () => {
    expect(
      photoMetadataSchema.safeParse({
        type: "image/jpeg",
        size: 5 * 1024 * 1024,
      }).success,
    ).toBe(true);

    expect(
      photoMetadataSchema.safeParse({
        type: "image/svg+xml",
        size: 1024,
      }).success,
    ).toBe(false);

    expect(
      photoMetadataSchema.safeParse({
        type: "image/png",
        size: 12 * 1024 * 1024,
      }).success,
    ).toBe(false);
  });
});
