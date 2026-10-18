import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { Listing, MaterialRequest, RequestStatus } from "@/domain/types";

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

function nextActionFor(request: MaterialRequest, direction: "incoming" | "sent") {
  if (request.status === "new" || request.status === "awaiting_supplier_confirmation")
    return direction === "incoming" ? "Review request" : "Waiting for supplier";
  return "View details";
}

function RequestRow({
  request,
  listing,
  direction,
}: {
  request: MaterialRequest;
  listing?: Listing | null;
  direction: "incoming" | "sent";
}) {
  const open =
    request.status === "new" ||
    request.status === "awaiting_supplier_confirmation";
  return (
    <li>
      <Link
        href={`/app/requests/${request.id}`}
        className="hover:bg-sage-100 flex min-h-16 items-center gap-3 px-4 py-3"
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">
            {listing?.title ?? "Material batch"}
          </p>
          <p className="text-ink-600 mt-0.5 truncate text-xs tabular-nums">
            {request.requestedQuantity} {request.unit} requested ·{" "}
            {nextActionFor(request, direction)}
          </p>
        </div>
        <Badge variant={open ? "reserved" : "unavailable"}>
          {formatRequestStatus(request.status)}
        </Badge>
        <ChevronRight aria-hidden="true" className="text-ink-600 size-4" />
      </Link>
    </li>
  );
}

export { RequestRow, formatRequestStatus };
