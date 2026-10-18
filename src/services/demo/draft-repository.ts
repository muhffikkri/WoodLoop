import type { ListingDraft } from "@/domain/types";
import { getDemoDatabase } from "@/lib/demo-db";
import type { DraftRepository } from "@/services/repositories";

export class DemoDraftError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DemoDraftError";
  }
}

class BrowserDraftRepository implements DraftRepository {
  async getById(id: string, actorId: string): Promise<ListingDraft | null> {
    const database = getDemoDatabase();
    const draft = await database.drafts.get(id);
    if (!draft) return null;
    if (draft.supplierId !== actorId) {
      throw new DemoDraftError("You do not have access to this draft.");
    }
    return draft;
  }

  async save(draft: ListingDraft, actorId: string): Promise<ListingDraft> {
    if (draft.supplierId !== actorId) {
      throw new DemoDraftError("Draft supplier ID does not match the active user.");
    }
    const database = getDemoDatabase();
    const toSave: ListingDraft = {
      ...draft,
      updatedAt: new Date().toISOString(),
      schemaVersion: draft.schemaVersion || 1,
    };
    await database.drafts.put(toSave);

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("woodloop:draft-saved", { detail: { id: toSave.id } }),
      );
    }

    return toSave;
  }

  async remove(id: string, actorId: string): Promise<void> {
    const database = getDemoDatabase();
    const draft = await database.drafts.get(id);
    if (!draft) return;
    if (draft.supplierId !== actorId) {
      throw new DemoDraftError("You do not have permission to delete this draft.");
    }
    await database.drafts.delete(id);

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("woodloop:draft-removed", { detail: { id } }),
      );
    }
  }

  async getLatestForSupplier(supplierId: string): Promise<ListingDraft | null> {
    const database = getDemoDatabase();
    const drafts = await database.drafts
      .where("supplierId")
      .equals(supplierId)
      .toArray();

    if (drafts.length === 0) return null;
    // Return most recently updated
    return drafts.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )[0] ?? null;
  }
}

export const demoDraftRepository = new BrowserDraftRepository();
