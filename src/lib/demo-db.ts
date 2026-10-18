import Dexie, { type EntityTable } from "dexie";

import type {
  Listing,
  ListingDraft,
  MaterialRequest,
  StoredPhoto,
  User,
} from "@/domain/types";

export type DemoSessionRecord = {
  id: "current";
  userId: string;
  updatedAt: string;
};

class WoodLoopDemoDatabase extends Dexie {
  users!: EntityTable<User, "id">;
  sessions!: EntityTable<DemoSessionRecord, "id">;
  listings!: EntityTable<Listing, "id">;
  requests!: EntityTable<MaterialRequest, "id">;
  photos!: EntityTable<StoredPhoto, "id">;
  drafts!: EntityTable<ListingDraft, "id">;

  constructor() {
    super("woodloop-ai-demo");
    this.version(1).stores({
      users: "id, &email, role, isDemo",
      sessions: "id, userId",
    });
    this.version(2).stores({
      users: "id, &email, role, isDemo",
      sessions: "id, userId",
      listings:
        "id, supplierId, status, region, woodForm, createdAt, updatedAt, isDemo",
    });
    this.version(3).stores({
      users: "id, &email, role, isDemo",
      sessions: "id, userId",
      listings:
        "id, supplierId, status, region, woodForm, createdAt, updatedAt, isDemo",
      requests:
        "id, listingId, buyerId, supplierId, status, createdAt, updatedAt",
    });
    this.version(4).stores({
      users: "id, &email, role, isDemo",
      sessions: "id, userId",
      listings:
        "id, supplierId, status, region, woodForm, createdAt, updatedAt, isDemo",
      requests:
        "id, listingId, buyerId, supplierId, status, createdAt, updatedAt",
      photos: "id, ownerId, listingId, draftId, createdAt",
      drafts: "id, supplierId, currentStep, updatedAt",
    });
  }
}

let database: WoodLoopDemoDatabase | undefined;

export function getDemoDatabase() {
  database ??= new WoodLoopDemoDatabase();
  return database;
}
