"use client";

import { CheckCircle2, Clock, XCircle } from "lucide-react";
import type { RequestHistoryEvent, RequestStatus, User } from "@/domain/types";
import { formatRequestStatus } from "@/components/requests/request-row";

function formatTimestamp(isoString: string): string {
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

function eventIcon(status: RequestStatus) {
  switch (status) {
    case "completed":
      return <CheckCircle2 aria-hidden="true" className="size-4 text-brand-900" />;
    case "closed":
      return <XCircle aria-hidden="true" className="size-4 text-danger" />;
    default:
      return <Clock aria-hidden="true" className="size-4 text-timber-600" />;
  }
}

export function RequestTimeline({
  history,
  buyer,
  supplier,
}: {
  history: RequestHistoryEvent[];
  buyer?: User | null;
  supplier?: User | null;
}) {
  function actorName(byUserId: string): string {
    if (buyer && byUserId === buyer.id) return `${buyer.displayName} (Buyer)`;
    if (supplier && byUserId === supplier.id)
      return `${supplier.displayName} (Supplier)`;
    return "User";
  }

  return (
    <div className="border-line bg-surface rounded-lg border p-5 sm:p-6">
      <h3 className="font-heading text-base font-semibold text-ink-900">
        Status timeline & audit
      </h3>
      <p className="text-ink-600 mt-1 text-xs sm:text-sm">
        Permanent log of request events, confirmations, and closures.
      </p>

      <ol className="mt-5 space-y-4 border-l border-line pl-4">
        {history.map((event, index) => (
          <li key={`${event.status}-${event.at}-${index}`} className="relative">
            <span className="absolute -left-[25px] top-0.5 flex size-5 items-center justify-center rounded-full bg-surface border border-line">
              {eventIcon(event.status)}
            </span>

            <div className="text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-ink-900">
                  {formatRequestStatus(event.status)}
                </span>
                <span className="text-ink-600 text-xs">
                  · {actorName(event.byUserId)}
                </span>
                <time
                  dateTime={event.at}
                  className="text-ink-600/80 ml-auto text-xs tabular-nums"
                >
                  {formatTimestamp(event.at)}
                </time>
              </div>

              {event.reason ? (
                <p className="mt-1 text-xs text-ink-600 bg-sage-100/40 p-2 rounded-md">
                  <span className="font-medium">Note / Reason:</span> {event.reason}
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
