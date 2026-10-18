import type { StoredPhoto } from "@/domain/types";
import { getDemoDatabase } from "@/lib/demo-db";
import type { PhotoRepository } from "@/services/repositories";
import { registerPhoto } from "@/services/demo/demo-listings";

export class DemoPhotoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DemoPhotoError";
  }
}

class BrowserPhotoRepository implements PhotoRepository {
  private objectUrls = new Map<string, string>();

  async getById(id: string): Promise<StoredPhoto | null> {
    const database = getDemoDatabase();
    const photo = (await database.photos.get(id)) ?? null;
    if (photo && typeof window !== "undefined") {
      this.ensureObjectUrl(photo);
    }
    return photo;
  }

  async listByIds(ids: string[]): Promise<StoredPhoto[]> {
    if (ids.length === 0) return [];
    const database = getDemoDatabase();
    const all = await database.photos.bulkGet(ids);
    const photos: StoredPhoto[] = [];

    for (const item of all) {
      if (item) {
        if (typeof window !== "undefined") {
          this.ensureObjectUrl(item);
        }
        photos.push(item);
      }
    }

    // Preserve the ordering of the input IDs
    const photoMap = new Map(photos.map((p) => [p.id, p]));
    return ids
      .map((id) => photoMap.get(id))
      .filter((p): p is StoredPhoto => Boolean(p));
  }

  async save(
    photoInput: Omit<StoredPhoto, "id" | "createdAt">,
  ): Promise<StoredPhoto> {
    const database = getDemoDatabase();
    const id = `photo-${crypto.randomUUID()}`;
    const createdAt = new Date().toISOString();

    const storedPhoto: StoredPhoto = {
      ...photoInput,
      id,
      createdAt,
    };

    await database.photos.put(storedPhoto);

    if (typeof window !== "undefined") {
      this.ensureObjectUrl(storedPhoto);
    }

    return storedPhoto;
  }

  async remove(id: string, actorId: string): Promise<void> {
    const database = getDemoDatabase();
    const photo = await database.photos.get(id);
    if (!photo) return;
    if (photo.ownerId !== actorId) {
      throw new DemoPhotoError("You do not have permission to delete this photo.");
    }
    await database.photos.delete(id);

    const existingUrl = this.objectUrls.get(id);
    if (existingUrl && typeof window !== "undefined") {
      try {
        URL.revokeObjectURL(existingUrl);
      } catch {
        // Ignore revocation errors
      }
      this.objectUrls.delete(id);
    }
  }

  ensureObjectUrl(photo: StoredPhoto): string {
    const existing = this.objectUrls.get(photo.id);
    if (existing) return existing;

    try {
      const url = URL.createObjectURL(photo.blob);
      this.objectUrls.set(photo.id, url);
      registerPhoto(photo.id, url, photo.altText || "Uploaded wood offcut photo");
      return url;
    } catch {
      return "";
    }
  }
}

export const demoPhotoRepository = new BrowserPhotoRepository();
