"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Edit2,
  ExternalLink,
  Layers,
  MapPin,
  MessageSquareText,
  Sliders,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Listing } from "@/domain/types";
import {
  formatDimensions,
  formatWoodForm,
} from "@/lib/listing-format";
import { needsStockUpdate } from "@/lib/supplier-stats";
import { listingPhoto } from "@/services/demo/demo-listings";
import { demoListingRepository } from "@/services/demo/listing-repository";

interface MyListingCardProps {
  listing: Listing;
  heldReserved: number;
  userId: string;
  onUpdateQuantity: (listing: Listing) => void;
  onToggleAvailability: (listing: Listing) => void;
  onAvailabilityConfirmed?: () => void;
}

export function MyListingCard({
  listing,
  heldReserved,
  userId,
  onUpdateQuantity,
  onToggleAvailability,
  onAvailabilityConfirmed,
}: MyListingCardProps) {
  const [isConfirming, setIsConfirming] = React.useState(false);
  const [justConfirmed, setJustConfirmed] = React.useState(false);

  const photo = listingPhoto(listing.photoIds[0] ?? "boards");
  const isNeedsCheck = needsStockUpdate(listing);

  // Status badge variant and label
  const statusVariant =
    listing.status === "active"
      ? "available"
      : listing.status === "reserved"
        ? "reserved"
        : "unavailable";

  const statusLabel =
    listing.status === "active"
      ? "Active"
      : listing.status === "reserved"
        ? "Reserved"
        : "Unavailable";

  // Formatted stock check date
  const formattedCheckedDate = React.useMemo(() => {
    if (!listing.stockCheckedAt) return "Not verified";
    try {
      const d = new Date(listing.stockCheckedAt);
      if (isNaN(d.getTime())) return "Not verified";
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Not verified";
    }
  }, [listing.stockCheckedAt]);

  async function handleConfirmAvailability() {
    if (isConfirming || justConfirmed) return;
    setIsConfirming(true);
    try {
      await demoListingRepository.confirmAvailability(listing.id, userId);
      setJustConfirmed(true);
      onAvailabilityConfirmed?.();
      setTimeout(() => setJustConfirmed(false), 3000);
    } catch (err) {
      console.error("Failed to confirm availability:", err);
    } finally {
      setIsConfirming(false);
    }
  }

  return (
    <article className="border-line bg-surface flex flex-col justify-between overflow-hidden rounded-lg border shadow-xs transition-shadow hover:shadow-sm">
      <div>
        {/* Top media & status banner */}
        <div className="relative aspect-16/9 sm:aspect-2/1 w-full bg-sage-100 overflow-hidden">
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover object-center"
          />
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            <Badge variant={statusVariant}>{statusLabel}</Badge>
            {listing.isDemo ? <Badge variant="demo">Demo batch</Badge> : null}
          </div>
          {heldReserved > 0 ? (
            <div className="absolute bottom-3 left-3 right-3">
              <span className="bg-warning-bg/95 text-warning-text border-warning-text/30 inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold backdrop-blur-xs shadow-xs">
                <Clock className="size-3.5" />
                {heldReserved} {listing.unit} held in agreed requests
              </span>
            </div>
          ) : null}
        </div>

        {/* Card Body */}
        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-heading text-lg font-semibold text-ink-900 leading-snug">
                {listing.title}
              </h3>
              <p className="text-ink-600 mt-1 flex items-center gap-1 text-xs">
                <MapPin className="size-3.5 shrink-0" />
                <span>{listing.region}</span>
                <span aria-hidden="true">·</span>
                <span>{formatWoodForm(listing.woodForm)}</span>
              </p>
            </div>
          </div>

          {/* Specs & Dimensions */}
          <div className="border-line/60 bg-canvas mt-3.5 rounded-md border p-3 text-xs text-ink-600">
            <div className="flex items-center justify-between">
              <span className="font-medium text-ink-900">Dimensions:</span>
              <span>{formatDimensions(listing)}</span>
            </div>
            <div className="mt-1.5 flex items-center justify-between">
              <span className="font-medium text-ink-900">Inventory:</span>
              <span className="font-semibold text-ink-900">
                {listing.quantityAvailable} / {listing.quantityTotal} {listing.unit} available
              </span>
            </div>
          </div>

          {/* Verification timestamp and health indicator */}
          <div className="mt-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-ink-600">
              <Calendar className="size-3.5 shrink-0 text-timber-600" />
              <span>
                Stock verified: <strong>{formattedCheckedDate}</strong>
              </span>
            </div>
            {isNeedsCheck ? (
              <span className="text-warning-text font-semibold flex items-center gap-1 text-[11px]">
                <Clock className="size-3" />
                Check needed
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Card Footer / Action Buttons */}
      <div className="border-line bg-canvas/40 border-t p-3 sm:p-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {/* View Listing in buyer perspective */}
          <Button
            asChild
            variant="secondary"
            className="w-full text-xs min-h-11 px-2"
          >
            <Link href={`/app/materials/${listing.id}`}>
              <ExternalLink className="size-3.5" />
              View
            </Link>
          </Button>

          {/* Edit Specifications */}
          <Button
            asChild
            variant="secondary"
            className="w-full text-xs min-h-11 px-2"
          >
            <Link href={`/app/listings/${listing.id}/edit`}>
              <Edit2 className="size-3.5" />
              Edit
            </Link>
          </Button>

          {/* View Inquiries */}
          <Button
            asChild
            variant="secondary"
            className="w-full text-xs min-h-11 px-2"
          >
            <Link href={`/app/requests?view=incoming&listingId=${listing.id}`}>
              <MessageSquareText className="size-3.5" />
              Inquiries
            </Link>
          </Button>

          {/* Update Quantity */}
          <Button
            type="button"
            variant="secondary"
            onClick={() => onUpdateQuantity(listing)}
            className="w-full text-xs min-h-11 px-2"
          >
            <Sliders className="size-3.5" />
            Update qty
          </Button>

          {/* Confirm Availability (Quick Refresh) */}
          <Button
            type="button"
            variant="secondary"
            disabled={isConfirming || justConfirmed}
            onClick={handleConfirmAvailability}
            className={`w-full text-xs min-h-11 px-2 ${
              justConfirmed
                ? "bg-sage-100 text-brand-900 border-brand-900/30"
                : isNeedsCheck
                  ? "border-warning-text/40 text-warning-text"
                  : ""
            }`}
          >
            {justConfirmed ? (
              <>
                <Check className="size-3.5 text-brand-900" />
                Verified
              </>
            ) : isConfirming ? (
              "Saving..."
            ) : (
              <>
                <CheckCircle2 className="size-3.5" />
                Confirm stock
              </>
            )}
          </Button>

          {/* Mark unavailable / Make active */}
          <Button
            type="button"
            variant="secondary"
            onClick={() => onToggleAvailability(listing)}
            className="w-full text-xs min-h-11 px-2"
          >
            <Layers className="size-3.5" />
            {listing.status === "unavailable" ? "Make active" : "Unavailable"}
          </Button>
        </div>
      </div>
    </article>
  );
}
