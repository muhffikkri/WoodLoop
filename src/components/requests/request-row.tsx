import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { Listing, MaterialRequest, RequestStatus, User } from "@/domain/types";
import { listingPhoto } from "@/services/demo/demo-listings";

const statusLabels: Record<RequestStatus, string> = {
  new: "New",
  awaiting_supplier_confirmation: "Awaiting confirmation",
  agreed: "Agreed",
  completed: "Completed",
  closed: "Closed",
};

function formatRequestStatus(status: RequestStatus) {
  return statusLabels[status];
}

function statusBadgeVariant(status: RequestStatus): "available" | "reserved" | "unavailable" {
  switch (status) {
    case "agreed":
    case "completed":
      return "available";
    case "new":
    case "awaiting_supplier_confirmation":
      return "reserved";
    case "closed":
      return "unavailable";
  }
}

function nextActionFor(
  request: MaterialRequest,
  direction: "incoming" | "sent",
): string {
  if (request.status === "new") {
    return direction === "incoming" ? "Review request" : "Awaiting supplier confirmation";
  }
  if (request.status === "awaiting_supplier_confirmation") {
    return direction === "incoming" ? "Confirm availability & terms" : "Supplier reviewing terms";
  }
  if (request.status === "agreed") {
    return direction === "incoming" ? "Coordinate handover & complete" : "Ready for pickup / handover";
  }
  if (request.status === "completed") {
    return "Handover completed";
  }
  return "Request closed";
}

function formatRowDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}

function RequestRow({
  request,
  listing,
  counterparty,
  direction,
}: {
  request: MaterialRequest;
  listing?: Listing | null;
  counterparty?: User | null;
  direction: "incoming" | "sent";
}) {
  const photo = listingPhoto(listing?.photoIds[0] ?? "boards");
  const counterpartyLabel =
    direction === "incoming"
      ? `From: ${counterparty?.displayName ?? "Buyer"}`
      : `To: ${counterparty?.displayName ?? "Supplier"}`;

  return (
    <li>
      <Link
        href={`/app/requests/${request.id}`}
        className="group flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 transition-colors hover:bg-sage-100/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-900 focus-visible:ring-inset"
      >
        {/* Thumbnail */}
        <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-sage-100 border border-line">
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="56px"
            className="object-cover object-center transition-transform duration-200 group-hover:scale-105"
          />
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <h3 className="font-heading text-sm font-semibold text-ink-900 group-hover:text-brand-900 truncate">
              {listing?.title ?? "Material batch"}
            </h3>
            <span className="text-xs text-ink-600 truncate">
              · {counterpartyLabel}
            </span>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-600">
            <span className="tabular-nums font-medium text-ink-900">
              {request.requestedQuantity} {request.unit} requested
              {request.agreedQuantity && request.agreedQuantity !== request.requestedQuantity ? (
                <span className="text-brand-900 font-semibold ml-1">
                  (Agreed: {request.agreedQuantity} {request.unit})
                </span>
              ) : null}
            </span>
            <span className="text-ink-600/70">·</span>
            <span className="text-ink-600">{nextActionFor(request, direction)}</span>
            <span className="text-ink-600/70">·</span>
            <time dateTime={request.createdAt} className="text-ink-600 tabular-nums">
              {formatRowDate(request.createdAt)}
            </time>
          </div>
        </div>

        {/* Status chip & Chevron */}
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-line/50">
          <Badge variant={statusBadgeVariant(request.status)}>
            {formatRequestStatus(request.status)}
          </Badge>
          <ChevronRight
            aria-hidden="true"
            className="size-4 text-ink-600 transition-transform group-hover:translate-x-0.5"
          />
        </div>
      </Link>
    </li>
  );
}

export { RequestRow, formatRequestStatus, statusBadgeVariant, nextActionFor };
