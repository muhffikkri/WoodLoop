import type { Listing, WoodForm } from "@/domain/types";

const formLabels: Record<WoodForm, string> = {
  board: "Board",
  strip: "Strip",
  block: "Block",
  other: "Other offcut",
};

export function formatWoodForm(form: WoodForm) {
  return formLabels[form];
}

export function formatDimensions(listing: Pick<Listing, "dimensions">) {
  const { length, width, thickness, approximate } = listing.dimensions;
  const values = [length, width, thickness];
  if (values.some((value) => value === null || value === undefined))
    return "Dimensions not provided";
  return `${approximate ? "Approx. " : ""}${values.join(" × ")} mm`;
}

export function formatQuantity(
  listing: Pick<Listing, "quantityAvailable" | "unit">,
) {
  return `${listing.quantityAvailable} ${listing.unit}`;
}
