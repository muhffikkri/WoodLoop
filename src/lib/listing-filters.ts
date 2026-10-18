import type {
  ListingFilters,
  ListingSort,
  QuantityUnit,
  WoodForm,
} from "@/domain/types";

function readPositive(value: string | null) {
  if (!value) return undefined;
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : undefined;
}

const WOOD_FORMS: readonly WoodForm[] = ["board", "strip", "block", "other"];
const LISTING_STATUSES = ["draft", "active", "reserved", "unavailable"];

export const CATALOG_SORTS = [
  { value: "recent", label: "Most recent" },
  { value: "quantity_desc", label: "Most pieces first" },
  { value: "quantity_asc", label: "Fewest pieces first" },
] as const satisfies ReadonlyArray<{ value: ListingSort; label: string }>;

export const DEFAULT_SORT: ListingSort = "recent";

export function sortFromSearchParams(params: URLSearchParams): ListingSort {
  const value = params.get("sort");
  return CATALOG_SORTS.some((option) => option.value === value)
    ? (value as ListingSort)
    : DEFAULT_SORT;
}

export function filtersFromSearchParams(
  params: URLSearchParams,
): ListingFilters {
  const forms = params
    .get("form")
    ?.split(",")
    .filter((form): form is WoodForm =>
      WOOD_FORMS.includes(form as WoodForm),
    );
  const quantityUnit = params.get("unit");
  const statuses = params
    .get("status")
    ?.split(",")
    .filter((status) =>
      LISTING_STATUSES.includes(status),
    ) as ListingFilters["statuses"];
  return {
    query: params.get("q")?.trim() || undefined,
    forms: forms?.length ? forms : undefined,
    minLengthMm: readPositive(params.get("minLength")),
    minWidthMm: readPositive(params.get("minWidth")),
    minThicknessMm: readPositive(params.get("minThickness")),
    minimumQuantity: readPositive(params.get("minQuantity")),
    quantityUnit:
      quantityUnit === "pieces" || quantityUnit === "sets"
        ? quantityUnit
        : undefined,
    region: params.get("region")?.trim() || undefined,
    statuses: statuses?.length ? statuses : undefined,
    requireMeasuredDimensions: params.get("measured") === "true" || undefined,
  };
}

export function filtersToSearchParams(
  filters: ListingFilters,
  sort: ListingSort = DEFAULT_SORT,
) {
  const params = new URLSearchParams();
  if (filters.query) params.set("q", filters.query);
  if (filters.forms?.length) params.set("form", filters.forms.join(","));
  if (filters.minLengthMm) params.set("minLength", String(filters.minLengthMm));
  if (filters.minWidthMm) params.set("minWidth", String(filters.minWidthMm));
  if (filters.minThicknessMm)
    params.set("minThickness", String(filters.minThicknessMm));
  if (filters.minimumQuantity)
    params.set("minQuantity", String(filters.minimumQuantity));
  if (filters.quantityUnit) params.set("unit", filters.quantityUnit);
  if (filters.region) params.set("region", filters.region);
  if (filters.statuses?.length)
    params.set("status", filters.statuses.join(","));
  if (filters.requireMeasuredDimensions) params.set("measured", "true");
  if (sort !== DEFAULT_SORT) params.set("sort", sort);
  return params;
}

export type ActiveFilterKey =
  | "query"
  | "forms"
  | "minLengthMm"
  | "minWidthMm"
  | "minThicknessMm"
  | "minimumQuantity"
  | "region";

const formLabel: Record<WoodForm, string> = {
  board: "Board",
  strip: "Strip",
  block: "Block",
  other: "Other offcut",
};

/** Human-readable, individually removable filter descriptions. */
export function describeActiveFilters(filters: ListingFilters) {
  const unit: QuantityUnit = filters.quantityUnit ?? "pieces";
  const chips: Array<{ key: ActiveFilterKey; label: string }> = [];
  if (filters.query) chips.push({ key: "query", label: `“${filters.query}”` });
  if (filters.forms?.length)
    chips.push({
      key: "forms",
      label: filters.forms.map((form) => formLabel[form]).join(", "),
    });
  if (filters.minLengthMm)
    chips.push({
      key: "minLengthMm",
      label: `Length ≥ ${filters.minLengthMm} mm`,
    });
  if (filters.minWidthMm)
    chips.push({
      key: "minWidthMm",
      label: `Width ≥ ${filters.minWidthMm} mm`,
    });
  if (filters.minThicknessMm)
    chips.push({
      key: "minThicknessMm",
      label: `Thickness ≥ ${filters.minThicknessMm} mm`,
    });
  if (filters.minimumQuantity)
    chips.push({
      key: "minimumQuantity",
      label: `≥ ${filters.minimumQuantity} ${unit}`,
    });
  if (filters.region)
    chips.push({ key: "region", label: `Area: ${filters.region}` });
  return chips;
}

export function removeActiveFilter(
  filters: ListingFilters,
  key: ActiveFilterKey,
): ListingFilters {
  const next = { ...filters, [key]: undefined };
  if (key === "minimumQuantity") next.quantityUnit = undefined;
  return next;
}
