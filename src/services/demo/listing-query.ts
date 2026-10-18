import type { Listing, ListingFilters, ListingSort } from "@/domain/types";

function textForListing(listing: Listing) {
  return [
    listing.title,
    listing.description,
    listing.woodForm,
    listing.region,
    listing.sourceProcess,
    listing.declaredSpecies,
    listing.visibleConditionNotes,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function hasMeasuredDimensions(listing: Listing) {
  const { length, width, thickness } = listing.dimensions;
  return Boolean(
    length && width && thickness && !listing.dimensions.approximate,
  );
}

export function filterListings(
  listings: Listing[],
  filters: ListingFilters = {},
) {
  const query = filters.query?.trim().toLowerCase();
  const statuses = filters.statuses ?? ["active"];

  return listings.filter((listing) => {
    if (!statuses.includes(listing.status)) return false;
    if (query && !textForListing(listing).includes(query)) return false;
    if (filters.forms?.length && !filters.forms.includes(listing.woodForm))
      return false;
    if (
      filters.region &&
      !listing.region.toLowerCase().includes(filters.region.toLowerCase())
    )
      return false;
    if (filters.requireMeasuredDimensions && !hasMeasuredDimensions(listing))
      return false;
    if (
      filters.minLengthMm &&
      (!listing.dimensions.length ||
        listing.dimensions.length < filters.minLengthMm)
    )
      return false;
    if (
      filters.minWidthMm &&
      (!listing.dimensions.width ||
        listing.dimensions.width < filters.minWidthMm)
    )
      return false;
    if (
      filters.minThicknessMm &&
      (!listing.dimensions.thickness ||
        listing.dimensions.thickness < filters.minThicknessMm)
    )
      return false;
    if (filters.minimumQuantity) {
      if (filters.quantityUnit && listing.unit !== filters.quantityUnit)
        return false;
      if (listing.quantityAvailable < filters.minimumQuantity) return false;
    }
    return true;
  });
}

export function sortListings(
  listings: Listing[],
  sort: ListingSort = "recent",
) {
  return [...listings].sort((left, right) => {
    if (sort === "quantity_desc")
      return (
        right.quantityAvailable - left.quantityAvailable ||
        right.updatedAt.localeCompare(left.updatedAt)
      );
    if (sort === "quantity_asc")
      return (
        left.quantityAvailable - right.quantityAvailable ||
        right.updatedAt.localeCompare(left.updatedAt)
      );
    return (
      right.updatedAt.localeCompare(left.updatedAt) ||
      right.id.localeCompare(left.id)
    );
  });
}
