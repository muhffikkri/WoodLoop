import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { Listing } from "@/domain/types";
import {
  formatDimensions,
  formatQuantity,
  formatWoodForm,
} from "@/lib/listing-format";
import { listingPhoto } from "@/services/demo/demo-listings";

/** Availability derives from live status and stock, never a fixed string. */
function availabilityFor(listing: Listing) {
  if (listing.status === "reserved") return "reserved" as const;
  if (listing.status !== "active" || listing.quantityAvailable <= 0)
    return "unavailable" as const;
  return "available" as const;
}

const availabilityLabels = {
  available: "Available",
  reserved: "Reserved",
  unavailable: "Unavailable",
} as const;

function MaterialCard({ listing }: { listing: Listing }) {
  const photo = listingPhoto(listing.photoIds[0] ?? "boards");
  const availability = availabilityFor(listing);

  return (
    <article className="border-line bg-surface overflow-hidden rounded-lg border">
      <Link
        href={`/app/materials/${listing.id}`}
        className="group block focus-visible:outline-none"
      >
        <div className="bg-sage-100 relative aspect-4/3 overflow-hidden">
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="(min-width: 1024px) 29vw, (min-width: 640px) 46vw, 100vw"
            className="object-cover object-center transition-transform duration-200 group-hover:scale-[1.02]"
          />
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {listing.isDemo ? <Badge variant="demo">Demo listing</Badge> : null}
            <Badge variant={availability}>
              {availabilityLabels[availability]}
            </Badge>
          </div>
        </div>
        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-heading group-hover:text-brand-900 text-base leading-6 font-semibold">
              {listing.title}
            </h3>
            <ArrowUpRight
              aria-hidden="true"
              className="text-brand-900 mt-0.5 size-5 shrink-0"
            />
          </div>
          <p className="text-ink-600 mt-3 text-sm font-medium">
            {formatWoodForm(listing.woodForm)} · {formatDimensions(listing)}
          </p>
          {listing.visibleConditionNotes ? (
            <p className="text-ink-600 mt-2 line-clamp-2 text-xs leading-5">
              Supplier note: {listing.visibleConditionNotes}
            </p>
          ) : null}
          <div className="text-ink-600 mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <span className="text-ink-900 font-semibold tabular-nums">
              {formatQuantity(listing)} available
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin aria-hidden="true" className="size-3.5" />
              {listing.region}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

export { MaterialCard, availabilityFor };
