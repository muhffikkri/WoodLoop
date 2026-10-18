"use client";

import * as React from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

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
import { Input } from "@/components/ui/input";
import type { Listing } from "@/domain/types";
import { demoListingRepository } from "@/services/demo/listing-repository";

interface UpdateStockDialogProps {
  listing: Listing | null;
  heldReserved: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onSuccess?: () => void;
}

function UpdateStockForm({
  listing,
  heldReserved,
  onOpenChange,
  userId,
  onSuccess,
}: {
  listing: Listing;
  heldReserved: number;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onSuccess?: () => void;
}) {
  const [newTotalStr, setNewTotalStr] = React.useState<string>(
    String(listing.quantityTotal),
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const parsedTotal = parseInt(newTotalStr, 10);
  const isValidNumber =
    !isNaN(parsedTotal) &&
    parsedTotal > 0 &&
    String(parsedTotal) === newTotalStr.trim();
  const calculatedAvailable = isValidNumber ? parsedTotal - heldReserved : null;
  const isBelowReserved = isValidNumber && parsedTotal < heldReserved;

  let validationMessage: string | null = null;
  if (newTotalStr.trim() !== "" && !isValidNumber) {
    validationMessage = "Total quantity must be a positive whole number.";
  } else if (isBelowReserved) {
    validationMessage = `Cannot reduce total quantity below ${heldReserved} ${listing.unit} currently reserved for agreed requests.`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidNumber || isBelowReserved) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await demoListingRepository.updateStock(listing.id, parsedTotal, userId);
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update listing stock.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>Update batch quantity</DialogTitle>
        <DialogDescription>
          Adjust total inventory for <strong>{listing.title}</strong>. This updates
          available stock and refreshes your verification timestamp.
        </DialogDescription>
      </DialogHeader>

      {/* Current Stock Summary */}
      <div className="bg-sage-100 border-line rounded-lg border p-3.5 text-sm space-y-1.5">
        <div className="flex justify-between text-ink-900">
          <span className="text-ink-600">Current total:</span>
          <span className="font-semibold">
            {listing.quantityTotal} {listing.unit}
          </span>
        </div>
        <div className="flex justify-between text-ink-900">
          <span className="text-ink-600">Currently available:</span>
          <span className="font-semibold">
            {listing.quantityAvailable} {listing.unit}
          </span>
        </div>
        {heldReserved > 0 ? (
          <div className="flex justify-between text-warning-text pt-1 border-t border-line/60 font-medium">
            <span>Reserved for agreed requests:</span>
            <span>
              {heldReserved} {listing.unit}
            </span>
          </div>
        ) : null}
      </div>

      {/* Input field */}
      <div className="space-y-2">
        <label
          htmlFor="total-quantity-input"
          className="text-ink-900 block text-sm font-medium"
        >
          New total quantity ({listing.unit})
        </label>
        <Input
          id="total-quantity-input"
          type="number"
          min={Math.max(1, heldReserved)}
          step="1"
          value={newTotalStr}
          onChange={(e) => {
            setNewTotalStr(e.target.value);
            setError(null);
          }}
          required
          autoFocus
        />
      </div>

      {/* Live Preview / Validation Feedback */}
      {validationMessage ? (
        <div
          role="alert"
          className="bg-danger-bg text-danger border-danger/30 flex items-start gap-2 rounded-lg border p-3 text-xs leading-5"
        >
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>{validationMessage}</span>
        </div>
      ) : isValidNumber && calculatedAvailable !== null ? (
        <div className="bg-canvas border-line text-ink-900 flex items-start gap-2 rounded-lg border p-3 text-xs leading-5">
          <CheckCircle2 className="text-brand-900 size-4 shrink-0 mt-0.5" />
          <div>
            <p>
              New available stock: <strong>{calculatedAvailable} {listing.unit}</strong>
              {heldReserved > 0
                ? ` (${heldReserved} ${listing.unit} will remain reserved)`
                : null}
            </p>
            {calculatedAvailable === 0 ? (
              <p className="text-warning-text mt-0.5">
                Listing status will switch to <strong>Reserved</strong> until more stock is added.
              </p>
            ) : null}
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
          type="submit"
          disabled={
            isSubmitting ||
            !isValidNumber ||
            Boolean(isBelowReserved) ||
            parsedTotal === listing.quantityTotal
          }
        >
          {isSubmitting ? "Saving..." : "Save changes"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function UpdateStockDialog({
  listing,
  heldReserved,
  open,
  onOpenChange,
  userId,
  onSuccess,
}: UpdateStockDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {listing && open ? (
          <UpdateStockForm
            key={listing.id}
            listing={listing}
            heldReserved={heldReserved}
            onOpenChange={onOpenChange}
            userId={userId}
            onSuccess={onSuccess}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
