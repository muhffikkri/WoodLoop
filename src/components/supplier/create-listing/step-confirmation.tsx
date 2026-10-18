"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, Eye, PlusCircle, Store } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Listing } from "@/domain/types";
import { formatDimensions, formatQuantity } from "@/lib/listing-format";
import { listingPhoto } from "@/services/demo/demo-listings";

export function StepConfirmation({
  listing,
  isDraftOnly,
  onReset,
}: {
  listing: Listing;
  isDraftOnly?: boolean;
  onReset: () => void;
}) {
  const photo = listingPhoto(listing.photoIds[0] ?? "boards");

  return (
    <div className="space-y-6">
      <div className="border-line bg-surface rounded-lg border p-6 text-center sm:p-10">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-sage-100 text-brand-900 border border-line">
          <Check aria-hidden="true" className="size-6 stroke-[2.5]" />
        </div>

        <h2 className="font-heading mt-4 text-2xl font-semibold text-ink-900">
          {isDraftOnly ? "Draft saved successfully" : "Listing published"}
        </h2>
        <p className="text-ink-600 mx-auto mt-2 max-w-md text-sm leading-6">
          {isDraftOnly
            ? "Your batch has been stored as an offline draft on this device. You can return and publish it whenever you are ready."
            : "Your offcut batch is now saved to the local demo database and accessible to buyers in the material catalog."}
        </p>

        {/* Listing Summary Preview Card */}
        <div className="border-line bg-surface mx-auto mt-6 max-w-md overflow-hidden rounded-lg border text-left">
          <div className="relative aspect-4/3 w-full bg-sage-100">
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(min-width: 640px) 440px, 100vw"
              className="object-cover"
              unoptimized={photo.src.startsWith("blob:")}
            />
            <div className="absolute top-3 left-3 flex gap-2">
              <Badge variant={listing.status === "active" ? "available" : "unavailable"}>
                {listing.status === "active" ? "Active" : "Draft"}
              </Badge>
              <Badge variant="demo">Demo listing</Badge>
            </div>
          </div>

          <div className="p-4">
            <h3 className="font-heading text-base font-semibold text-ink-900">
              {listing.title}
            </h3>
            <p className="text-ink-600 mt-1 text-xs sm:text-sm">
              {formatDimensions(listing)} · {formatQuantity(listing)}
            </p>
            <p className="text-ink-600 mt-1 text-xs">
              Batch ID: <span className="font-mono text-ink-900">{listing.id}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="large" className="w-full sm:w-auto">
            <Link href={`/app/materials/${listing.id}`}>
              <Eye aria-hidden="true" className="mr-2 size-4" />
              View listing
            </Link>
          </Button>

          <Button asChild variant="secondary" size="large" className="w-full sm:w-auto">
            <Link href="/app/supplier">
              <Store aria-hidden="true" className="mr-2 size-4" />
              Go to supplier home
            </Link>
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="large"
            onClick={onReset}
            className="w-full sm:w-auto"
          >
            <PlusCircle aria-hidden="true" className="mr-2 size-4" />
            Create another listing
          </Button>
        </div>
      </div>
    </div>
  );
}
