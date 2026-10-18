import { describe, expect, it } from "vitest";

import {
  describeActiveFilters,
  filtersFromSearchParams,
  filtersToSearchParams,
  removeActiveFilter,
  sortFromSearchParams,
} from "@/lib/listing-filters";

describe("listing filter URL helpers", () => {
  it("round-trips filters and sort through the URL", () => {
    const params = filtersToSearchParams(
      {
        query: "board",
        forms: ["strip"],
        minLengthMm: 200,
        region: "tokyo",
      },
      "quantity_desc",
    );
    const parsed = new URLSearchParams(params.toString());
    expect(filtersFromSearchParams(parsed)).toMatchObject({
      query: "board",
      forms: ["strip"],
      minLengthMm: 200,
      region: "tokyo",
    });
    expect(sortFromSearchParams(parsed)).toBe("quantity_desc");
  });

  it("omits the default sort and ignores invalid values", () => {
    expect(filtersToSearchParams({ query: "board" }).toString()).toBe(
      "q=board",
    );
    const parsed = new URLSearchParams(
      "form=banana,board&minLength=-5&sort=nope&status=bogus",
    );
    const filters = filtersFromSearchParams(parsed);
    expect(filters.forms).toEqual(["board"]);
    expect(filters.minLengthMm).toBeUndefined();
    expect(filters.statuses).toBeUndefined();
    expect(sortFromSearchParams(parsed)).toBe("recent");
  });

  it("describes and removes individual filters", () => {
    const filters = {
      forms: ["board" as const],
      minimumQuantity: 5,
      quantityUnit: "pieces" as const,
    };
    expect(describeActiveFilters(filters).map((chip) => chip.label)).toEqual([
      "Board",
      "≥ 5 pieces",
    ]);
    const next = removeActiveFilter(filters, "minimumQuantity");
    expect(next.quantityUnit).toBeUndefined();
    expect(describeActiveFilters(next)).toHaveLength(1);
  });
});
