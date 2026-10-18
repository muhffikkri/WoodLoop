import type {
  Listing,
  ListingFilters,
  ListingPatch,
  ListingSort,
  ListingStatus,
  NewListingInput,
} from "@/domain/types";
import { getDemoDatabase } from "@/lib/demo-db";
import type { ListingRepository } from "@/services/repositories";
import { DEMO_LISTINGS } from "@/services/demo/demo-listings";
import { filterListings, sortListings } from "@/services/demo/listing-query";

import { demoPhotoRepository } from "@/services/demo/photo-repository";

export class DemoListingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DemoListingError";
  }
}

async function ensureSeededListings() {
  const database = getDemoDatabase();
  if ((await database.listings.count()) === 0) {
    await database.listings.bulkAdd(
      DEMO_LISTINGS.map((listing) => ({ ...listing })),
    );
  }
}

function notifyListingChange() {
  if (typeof window !== "undefined")
    window.dispatchEvent(new Event("woodloop:listings-changed"));
}

class BrowserListingRepository implements ListingRepository {
  async list(filters: ListingFilters = {}, sort: ListingSort = "recent") {
    await ensureSeededListings();
    const results = sortListings(
      filterListings(await getDemoDatabase().listings.toArray(), filters),
      sort,
    );
    const customPhotoIds = results
      .flatMap((l) => l.photoIds)
      .filter((id) => id.startsWith("photo-"));
    if (customPhotoIds.length > 0) {
      await demoPhotoRepository.listByIds(customPhotoIds);
    }
    return results;
  }

  async getById(id: string) {
    await ensureSeededListings();
    const listing = (await getDemoDatabase().listings.get(id)) ?? null;
    if (listing?.photoIds && listing.photoIds.length > 0) {
      await demoPhotoRepository.listByIds(listing.photoIds);
    }
    return listing;
  }

  async listBySupplier(supplierId: string) {
    await ensureSeededListings();
    const results = sortListings(
      await getDemoDatabase()
        .listings.where("supplierId")
        .equals(supplierId)
        .toArray(),
    );
    const customPhotoIds = results
      .flatMap((l) => l.photoIds)
      .filter((id) => id.startsWith("photo-"));
    if (customPhotoIds.length > 0) {
      await demoPhotoRepository.listByIds(customPhotoIds);
    }
    return results;
  }

  async create(data: NewListingInput, actorId: string) {
    const database = getDemoDatabase();
    const actor = await database.users.get(actorId);
    if (!actor || (actor.role !== "supplier" && actor.role !== "both")) {
      throw new DemoListingError(
        "Only a supplier demo profile can create a listing.",
      );
    }
    const now = new Date().toISOString();
    const listing: Listing = {
      ...data,
      id: `listing-${crypto.randomUUID()}`,
      supplierId: actorId,
      quantityAvailable: data.quantityTotal,
      status: data.status ?? "active",
      createdAt: now,
      updatedAt: now,
      isDemo: true,
    };
    await database.listings.add(listing);
    notifyListingChange();
    return listing;
  }

  async update(id: string, patch: ListingPatch, actorId: string) {
    const database = getDemoDatabase();
    const listing = await database.listings.get(id);
    if (!listing)
      throw new DemoListingError("This listing is no longer available.");
    if (listing.supplierId !== actorId)
      throw new DemoListingError(
        "Only the listing owner can update this batch.",
      );
    const next = {
      ...listing,
      ...patch,
      id: listing.id,
      supplierId: listing.supplierId,
      createdAt: listing.createdAt,
      isDemo: listing.isDemo,
      updatedAt: new Date().toISOString(),
    };
    await database.listings.put(next);
    notifyListingChange();
    return next;
  }

  async setAvailability(id: string, status: ListingStatus, actorId: string) {
    await this.update(id, { status }, actorId);
  }
}

export const demoListingRepository = new BrowserListingRepository();
