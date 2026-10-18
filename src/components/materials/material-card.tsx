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

function MaterialCard({ listing }: { listing: Listing }) {
  const photo = listingPhoto(listing.photoIds[0] ?? "boards");
  const availability =
    listing.status === "active"
      ? "available"
      : listing.status === "reserved"
        ? "reserved"
        : "unavailable";
  const availabilityLabel =
    listing.status === "active"
      ? "Available"
      : listing.status === "reserved"
        ? "Reserved"
        : "Unavailable";

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
            className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
          />
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {listing.isDemo ? <Badge variant="demo">Demo listing</Badge> : null}
            <Badge variant={availability}>{availabilityLabel}</Badge>
          </div>
        </div>
        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-heading text-base leading-6 font-semibold group-hover:text-brand-900">
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
          <div className="text-ink-600 mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <span className="tabular-nums font-semibold text-ink-900">
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

export { MaterialCard };
