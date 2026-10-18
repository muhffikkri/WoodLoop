"use client";

import * as React from "react";
import { AlertCircle, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Listing } from "@/domain/types";
import { demoListingRepository } from "@/services/demo/listing-repository";

interface ToggleAvailabilityDialogProps {
  listing: Listing | null;
  heldReserved: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onSuccess?: () => void;
}

export function ToggleAvailabilityDialog({
  listing,
  heldReserved,
  open,
  onOpenChange,
  userId,
  onSuccess,
}: ToggleAvailabilityDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  if (!listing) return null;

  const isCurrentlyUnavailable = listing.status === "unavailable";
  const targetAction = isCurrentlyUnavailable ? "Make active" : "Mark unavailable";
  const targetStatus = isCurrentlyUnavailable ? "active" : "unavailable";

  async function handleConfirm() {
    if (!listing) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await demoListingRepository.setAvailability(listing.id, targetStatus, userId);
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update availability.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isCurrentlyUnavailable ? "Make batch active" : "Mark batch as unavailable"}
          </DialogTitle>
          <DialogDescription>
            {isCurrentlyUnavailable ? (
              <>
                Reactivate <strong>{listing.title}</strong> so buyers can find it
                in the material catalog.
              </>
            ) : (
              <>
                Hide <strong>{listing.title}</strong> from buyer searches and new inquiries.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {!isCurrentlyUnavailable && heldReserved > 0 ? (
          <div className="bg-warning-bg border-warning-text/30 text-ink-900 flex items-start gap-2.5 rounded-lg border p-3.5 text-xs leading-5">
            <AlertTriangle className="text-warning-text size-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-warning-text">
                Existing reservations preserved
              </p>
              <p className="mt-0.5">
                This batch has <strong>{heldReserved} {listing.unit}</strong> held in agreed buyer requests. Marking this batch unavailable will hide it from new catalog searches, but will <strong>not</strong> discard existing agreed requests.
              </p>
            </div>
          </div>
        ) : isCurrentlyUnavailable && listing.quantityAvailable <= 0 ? (
          <div className="bg-warning-bg border-warning-text/30 text-ink-900 flex items-start gap-2.5 rounded-lg border p-3.5 text-xs leading-5">
            <AlertTriangle className="text-warning-text size-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-warning-text">Stock is currently 0</p>
              <p className="mt-0.5">
                Because available quantity is 0, this batch will be listed as <strong>Reserved</strong> until you increase total inventory.
              </p>
            </div>
          </div>
        ) : null}

        {error ? (
          <div
            role="alert"
            className="bg-danger-bg text-danger border-danger/30 flex items-start gap-2 rounded-lg border p-3 text-xs leading-5"
          >
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        ) : null}

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary" disabled={isSubmitting}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant={isCurrentlyUnavailable ? "primary" : "secondary"}
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating..." : targetAction}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
