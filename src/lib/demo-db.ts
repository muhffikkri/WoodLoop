import Dexie, { type EntityTable } from "dexie";

import type { Listing, User } from "@/domain/types";

export type DemoSessionRecord = {
  id: "current";
  userId: string;
  updatedAt: string;
};

class WoodLoopDemoDatabase extends Dexie {
  users!: EntityTable<User, "id">;
  sessions!: EntityTable<DemoSessionRecord, "id">;
  listings!: EntityTable<Listing, "id">;

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
  }
}

let database: WoodLoopDemoDatabase | undefined;

export function getDemoDatabase() {
  database ??= new WoodLoopDemoDatabase();
  return database;
}
