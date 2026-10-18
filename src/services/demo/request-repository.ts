import type { MaterialRequest, NewRequestInput } from "@/domain/types";
import { getDemoDatabase } from "@/lib/demo-db";
import type { RequestRepository } from "@/services/repositories";

export class DemoRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DemoRequestError";
  }
}

function notifyRequestChange() {
  if (typeof window !== "undefined")
    window.dispatchEvent(new Event("woodloop:requests-changed"));
}

type ReadableRequestRepository = Pick<
  RequestRepository,
  "listForUser" | "getById" | "create"
>;

class BrowserRequestRepository implements ReadableRequestRepository {
  async listForUser(userId: string, direction: "incoming" | "sent") {
    const field = direction === "incoming" ? "supplierId" : "buyerId";
    const requests = await getDemoDatabase()
      .requests.where(field)
      .equals(userId)
      .toArray();
    return requests.sort(
      (left, right) =>
        right.updatedAt.localeCompare(left.updatedAt) ||
        right.id.localeCompare(left.id),
    );
  }

  async getById(id: string) {
    return (await getDemoDatabase().requests.get(id)) ?? null;
  }

  async create(input: NewRequestInput, actorId: string) {
    const database = getDemoDatabase();
    const listing = await database.listings.get(input.listingId);
    if (!listing)
      throw new DemoRequestError("This listing is no longer available.");
    if (listing.supplierId === actorId)
      throw new DemoRequestError("You cannot request your own listing.");
    const now = new Date().toISOString();
    const request: MaterialRequest = {
      ...input,
      id: `request-${crypto.randomUUID()}`,
      buyerId: actorId,
      supplierId: listing.supplierId,
      status: "new",
      createdAt: now,
      updatedAt: now,
      history: [{ status: "new", at: now, byUserId: actorId }],
    };
    await database.requests.add(request);
    notifyRequestChange();
    return request;
  }
}

export const demoRequestRepository = new BrowserRequestRepository();
