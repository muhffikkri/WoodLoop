import type { ListingFilters } from "@/domain/types";

function readPositive(value: string | null) {
  if (!value) return undefined;
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : undefined;
}

export function filtersFromSearchParams(
  params: URLSearchParams,
): ListingFilters {
  const form = params.get("form");
  const quantityUnit = params.get("unit");
  const statuses = params
    .get("status")
    ?.split(",")
    .filter(Boolean) as ListingFilters["statuses"];
  return {
    query: params.get("q") || undefined,
    forms: form
      ? (form.split(",").filter(Boolean) as ListingFilters["forms"])
      : undefined,
    minLengthMm: readPositive(params.get("minLength")),
    minWidthMm: readPositive(params.get("minWidth")),
    minThicknessMm: readPositive(params.get("minThickness")),
    minimumQuantity: readPositive(params.get("minQuantity")),
    quantityUnit:
      quantityUnit === "pieces" || quantityUnit === "sets"
        ? quantityUnit
        : undefined,
    region: params.get("region") || undefined,
    statuses: statuses?.length ? statuses : undefined,
    requireMeasuredDimensions: params.get("measured") === "true" || undefined,
  };
}

export function filtersToSearchParams(filters: ListingFilters) {
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
  return params;
}
