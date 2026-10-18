import type {
  MaterialRequest,
  NewRequestInput,
  RequestMessage,
  RequestStatus,
} from "@/domain/types";
import { getDemoDatabase } from "@/lib/demo-db";
import type { RequestRepository } from "@/services/repositories";

export class DemoRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DemoRequestError";
  }
}

function notifyEvents() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("woodloop:requests-changed"));
    window.dispatchEvent(new Event("woodloop:listings-changed"));
  }
}

class BrowserRequestRepository implements RequestRepository {
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
    if (!listing) {
      throw new DemoRequestError("This listing is no longer available.");
    }
    if (listing.supplierId === actorId) {
      throw new DemoRequestError("You cannot request your own listing.");
    }
    if (listing.status !== "active" || listing.quantityAvailable <= 0) {
      throw new DemoRequestError("This batch is currently unavailable.");
    }
    if (input.requestedQuantity > listing.quantityAvailable) {
      throw new DemoRequestError(
        `Only ${listing.quantityAvailable} ${listing.unit} are available.`,
      );
    }

    const now = new Date().toISOString();
    const requestId = `request-${crypto.randomUUID()}`;

    const request: MaterialRequest = {
      ...input,
      id: requestId,
      buyerId: actorId,
      supplierId: listing.supplierId,
      status: "new",
      createdAt: now,
      updatedAt: now,
      history: [{ status: "new", at: now, byUserId: actorId }],
    };

    await database.requests.add(request);

    notifyEvents();
    return request;
  }

  async transition(
    id: string,
    next: RequestStatus,
    actorId: string,
    options?: { agreedQuantity?: number; reason?: string },
  ): Promise<MaterialRequest> {
    const database = getDemoDatabase();
    const result = await database.transaction(
      "rw",
      database.requests,
      database.listings,
      async () => {
        const request = await database.requests.get(id);
        if (!request) {
          throw new DemoRequestError("Request not found.");
        }

        const isBuyer = actorId === request.buyerId;
        const isSupplier = actorId === request.supplierId;

        if (!isBuyer && !isSupplier) {
          throw new DemoRequestError("You do not have access to this request.");
        }

        const listing = await database.listings.get(request.listingId);
        const now = new Date().toISOString();

    // Validate transitions and apply stock policy
    if (next === "awaiting_supplier_confirmation") {
      if (!isSupplier) {
        throw new DemoRequestError(
          "Only the supplier can confirm availability.",
        );
      }
      if (request.status !== "new") {
        throw new DemoRequestError(
          "Can only confirm availability for new requests.",
        );
      }
    } else if (next === "agreed") {
      if (!isSupplier) {
        throw new DemoRequestError("Only the supplier can agree to a request.");
      }
      if (
        request.status !== "new" &&
        request.status !== "awaiting_supplier_confirmation"
      ) {
        throw new DemoRequestError("This request cannot be agreed in its current status.");
      }
      if (!listing) {
        throw new DemoRequestError("Associated listing was not found.");
      }

      const agreedQty = options?.agreedQuantity ?? request.requestedQuantity;
      if (agreedQty <= 0) {
        throw new DemoRequestError("Agreed quantity must be greater than 0.");
      }
      if (agreedQty > listing.quantityAvailable) {
        throw new DemoRequestError(
          `Cannot agree to ${agreedQty} ${listing.unit}. Only ${listing.quantityAvailable} available in stock.`,
        );
      }

      // Reserve stock atomically
      listing.quantityAvailable -= agreedQty;
      if (listing.quantityAvailable === 0) {
        listing.status = "reserved";
      }
      listing.updatedAt = now;
      await database.listings.put(listing);

      request.agreedQuantity = agreedQty;
      request.reservedQuantity = agreedQty;
      request.reservationState = "held";
    } else if (next === "completed") {
      if (!isSupplier) {
        throw new DemoRequestError(
          "Only the supplier can mark the handover completed.",
        );
      }
      if (request.status !== "agreed") {
        throw new DemoRequestError(
          "Only agreed requests can be marked completed.",
        );
      }

      // Consumed: stock was already deducted; does not return to pool
      request.reservationState = "consumed";
    } else if (next === "closed") {
      if (request.status === "completed") {
        throw new DemoRequestError("Completed requests cannot be closed.");
      }
      if (request.status === "closed") {
        throw new DemoRequestError("This request is already closed.");
      }

      // Restore stock if it was held and request closes before completion
      if (
        request.reservationState === "held" &&
        request.reservedQuantity &&
        listing
      ) {
        listing.quantityAvailable += request.reservedQuantity;
        if (listing.status === "reserved" && listing.quantityAvailable > 0) {
          listing.status = "active";
        }
        listing.updatedAt = now;
        await database.listings.put(listing);

        request.reservationState = "released";
      }
    }

    const updatedRequest: MaterialRequest = {
      ...request,
      status: next,
      updatedAt: now,
      history: [
        ...request.history,
        {
          status: next,
          at: now,
          byUserId: actorId,
          reason: options?.reason,
        },
      ],
    };

        await database.requests.put(updatedRequest);
        return updatedRequest;
      },
    );

    notifyEvents();
    return result;
  }

  async addMessage(
    id: string,
    text: string,
    actorId: string,
  ): Promise<RequestMessage> {
    const database = getDemoDatabase();
    const request = await database.requests.get(id);
    if (!request) {
      throw new DemoRequestError("Request not found.");
    }

    if (actorId !== request.buyerId && actorId !== request.supplierId) {
      throw new DemoRequestError(
        "You do not have permission to message in this thread.",
      );
    }

    const trimmed = text.trim();
    if (!trimmed) {
      throw new DemoRequestError("Message cannot be empty.");
    }

    const now = new Date().toISOString();
    const message: RequestMessage = {
      id: `msg-${crypto.randomUUID()}`,
      requestId: id,
      senderId: actorId,
      body: trimmed,
      createdAt: now,
    };

    await database.messages.add(message);

    // Update request updatedAt timestamp
    request.updatedAt = now;
    await database.requests.put(request);

    notifyEvents();
    return message;
  }

  async getMessages(requestId: string): Promise<RequestMessage[]> {
    const database = getDemoDatabase();
    const messages = await database.messages
      .where("requestId")
      .equals(requestId)
      .toArray();

    return messages.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }
}

export const demoRequestRepository = new BrowserRequestRepository();
