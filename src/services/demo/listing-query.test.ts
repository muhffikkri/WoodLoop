import { describe, expect, it } from "vitest";

import { DEMO_LISTINGS } from "@/services/demo/demo-listings";
import { filterListings, sortListings } from "@/services/demo/listing-query";

describe("listing query helpers", () => {
  it("returns active board batches for a board query", () => {
    const results = filterListings([...DEMO_LISTINGS], { query: "board" });
    expect(results).toHaveLength(2);
    expect(results.every((listing) => listing.woodForm === "board")).toBe(true);
    expect(results.every((listing) => listing.status === "active")).toBe(true);
  });

  it("keeps reserved and unavailable demo batches out of the default browse result", () => {
    const results = filterListings([...DEMO_LISTINGS]);
    expect(results.map((listing) => listing.id)).not.toContain("demo-strip-02");
    expect(results.map((listing) => listing.id)).not.toContain("demo-block-02");
  });

  it("applies supplier-declared dimension, quantity, and area constraints", () => {
    const results = filterListings([...DEMO_LISTINGS], {
      forms: ["board"],
      minLengthMm: 700,
      minimumQuantity: 10,
      quantityUnit: "pieces",
      region: "Setagaya",
    });
    expect(results.map((listing) => listing.id)).toEqual(["demo-board-01"]);
  });

  it("sorts deterministic recent results", () => {
    const results = sortListings(
      [...DEMO_LISTINGS].filter((listing) => listing.status === "active"),
    );
    expect(results.map((listing) => listing.id)).toEqual([
      "demo-board-01",
      "demo-strip-01",
      "demo-block-01",
      "demo-board-02",
    ]);
  });
});
