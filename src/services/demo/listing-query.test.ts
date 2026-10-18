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

  it("never treats unknown dimensions as a numeric match", () => {
    const unknown = {
      ...DEMO_LISTINGS[0],
      id: "unknown-dims",
      dimensions: { length: null, width: undefined, thickness: null, approximate: true },
    };
    for (const filters of [
      { minLengthMm: 1 },
      { minWidthMm: 1 },
      { minThicknessMm: 1 },
    ]) {
      expect(
        filterListings([unknown], filters).map((listing) => listing.id),
      ).toEqual([]);
    }
    expect(filterListings([unknown], {})).toHaveLength(1);
  });

  it("filters by unit so sets are not compared against pieces", () => {
    const sets = { ...DEMO_LISTINGS[0], id: "sets", unit: "sets" as const };
    expect(
      filterListings([sets], { minimumQuantity: 1, quantityUnit: "pieces" }),
    ).toHaveLength(0);
    expect(
      filterListings([sets], { minimumQuantity: 1, quantityUnit: "sets" }),
    ).toHaveLength(1);
  });

  it("hides out-of-stock batches from default browse", () => {
    const empty = { ...DEMO_LISTINGS[0], id: "empty", quantityAvailable: 0 };
    expect(filterListings([empty], {})).toHaveLength(0);
  });

  it("sorts by quantity in both directions deterministically", () => {
    const active = filterListings([...DEMO_LISTINGS]);
    expect(
      sortListings(active, "quantity_desc").map((listing) => listing.id),
    ).toEqual(["demo-strip-01", "demo-block-01", "demo-board-01", "demo-board-02"]);
    expect(
      sortListings(active, "quantity_asc").map((listing) => listing.id),
    ).toEqual(["demo-board-02", "demo-board-01", "demo-block-01", "demo-strip-01"]);
  });
});
