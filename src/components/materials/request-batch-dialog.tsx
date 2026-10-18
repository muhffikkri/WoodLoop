"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type {
  FulfillmentMethod,
  Listing,
  NewRequestInput,
  User,
} from "@/domain/types";
import { formatDimensions, formatQuantity } from "@/lib/listing-format";
import { listingPhoto } from "@/services/demo/demo-listings";
import { demoRequestRepository } from "@/services/demo/request-repository";

type RequestBatchDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing: Listing;
  mode: "request" | "inquire";
  user: User | null;
};

function RequestBatchForm({
  listing,
  mode,
  user,
  onClose,
}: {
  listing: Listing;
  mode: "request" | "inquire";
  user: User | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const photo = listingPhoto(listing.photoIds[0] ?? "boards");

  const [quantity, setQuantity] = React.useState(
    mode === "request" ? String(listing.quantityAvailable) : "1",
  );
  const [fulfillment, setFulfillment] =
    React.useState<FulfillmentMethod>("pickup");
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!user) {
      const returnTo = encodeURIComponent(`/app/materials/${listing.id}`);
      router.push(`/login?returnTo=${returnTo}`);
      return;
    }

    if (user.id === listing.supplierId) {
      setError("You cannot request your own listing.");
      return;
    }

    const trimmedQty = quantity.trim();
    if (!trimmedQty) {
      setError("Please specify a quantity.");
      return;
    }

    const parsedQty = Number(trimmedQty);
    if (!Number.isInteger(parsedQty) || parsedQty <= 0) {
      setError("Quantity must be a positive whole number (no fractions).");
      return;
    }

    if (parsedQty > listing.quantityAvailable) {
      setError(
        `Quantity cannot exceed the available ${formatQuantity(listing)}.`,
      );
      return;
    }

    const trimmedMessage = message.trim();
    if (mode === "inquire" && !trimmedMessage) {
      setError("Please enter your message or question for the supplier.");
      return;
    }

    const resolvedMessage =
      trimmedMessage ||
      `Request for ${parsedQty} ${listing.unit} of ${listing.title}.`;

    const input: NewRequestInput = {
      listingId: listing.id,
      requestedQuantity: parsedQty,
      unit: listing.unit,
      fulfillmentMethod: fulfillment,
      message: resolvedMessage,
    };

    setSubmitting(true);
    try {
      const created = await demoRequestRepository.create(input, user.id);
      onClose();
      router.push(`/app/requests/${created.id}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create request. Please try again.",
      );
      setSubmitting(false);
    }
  }

  const isRequest = mode === "request";

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {isRequest ? "Request this batch" : "Ask a question"}
        </DialogTitle>
        <DialogDescription>
          {isRequest
            ? "Coordinate batch reservation and pickup with the supplier."
            : "Send a message to the supplier before requesting this batch."}
        </DialogDescription>
      </DialogHeader>

      {/* Batch summary card */}
      <div className="border-line bg-surface flex items-center gap-3 rounded-md border p-3">
        <div className="bg-sage-100 relative size-16 shrink-0 overflow-hidden rounded">
          <Image
            src={photo.src}
            alt=""
            fill
            sizes="64px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{listing.title}</p>
          <p className="text-ink-600 truncate text-xs">
            {formatDimensions(listing)}
          </p>
          <p className="text-timber-600 text-xs font-semibold">
            {formatQuantity(listing)} currently available
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
        {error ? (
          <div
            role="alert"
            className="border-danger/30 bg-danger-bg text-danger flex items-start gap-2 rounded-md border p-3 text-sm"
          >
            <AlertCircle
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0"
            />
            <span>{error}</span>
          </div>
        ) : null}

        <Field>
          <FieldLabel htmlFor="request-quantity">
            Requested quantity ({listing.unit})
          </FieldLabel>
          <Input
            id="request-quantity"
            type="number"
            min="1"
            max={listing.quantityAvailable}
            step="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder={`Max ${listing.quantityAvailable}`}
            required
          />
        </Field>

        <fieldset>
          <legend className="text-ink-900 text-sm font-semibold">
            Fulfillment preference
          </legend>
          <div className="mt-2 grid gap-2">
            <label className="border-line bg-surface hover:bg-sage-100/50 flex cursor-pointer items-start gap-3 rounded-md border p-3 text-sm">
              <input
                type="radio"
                name="fulfillment"
                value="pickup"
                checked={fulfillment === "pickup"}
                onChange={() => setFulfillment("pickup")}
                className="mt-0.5"
              />
              <div>
                <span className="font-semibold text-ink-900">
                  Pickup at workshop
                </span>
                <p className="text-ink-600 mt-0.5 text-xs">
                  Inspect dimensions and collect in {listing.region}.
                </p>
              </div>
            </label>

            <label className="border-line bg-surface hover:bg-sage-100/50 flex cursor-pointer items-start gap-3 rounded-md border p-3 text-sm">
              <input
                type="radio"
                name="fulfillment"
                value="delivery_to_discuss"
                checked={fulfillment === "delivery_to_discuss"}
                onChange={() => setFulfillment("delivery_to_discuss")}
                className="mt-0.5"
              />
              <div>
                <span className="font-semibold text-ink-900">
                  Delivery to discuss
                </span>
                <p className="text-ink-600 mt-0.5 text-xs">
                  Coordinate delivery terms directly with the supplier.
                </p>
              </div>
            </label>
          </div>
        </fieldset>

        <Field>
          <FieldLabel htmlFor="request-message">
            {isRequest ? "Notes for supplier (optional)" : "Your question"}
          </FieldLabel>
          <textarea
            id="request-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder={
              isRequest
                ? "e.g., Target pickup date, project use, or cutting plan questions..."
                : "Ask about specific dimensions, grain, condition, or pickup schedule..."
            }
            className="border-line bg-surface placeholder:text-ink-600/60 min-h-20 w-full rounded-md border p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-900"
            required={!isRequest}
          />
        </Field>

        <DialogFooter className="mt-2">
          <Button
            type="button"
            variant="text"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              "Submitting..."
            ) : isRequest ? (
              <>
                <CheckCircle2 aria-hidden="true" className="mr-1.5 size-4" />
                Submit request
              </>
            ) : (
              "Send question"
            )}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

function RequestBatchDialog({
  open,
  onOpenChange,
  listing,
  mode,
  user,
}: RequestBatchDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg">
        {open ? (
          <RequestBatchForm
            listing={listing}
            mode={mode}
            user={user}
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export { RequestBatchDialog };
