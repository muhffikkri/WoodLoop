"use client";

import { useState } from "react";
import { Check, CheckCircle2, Clock, X, XCircle } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import type { Listing, MaterialRequest, User } from "@/domain/types";
import { demoRequestRepository } from "@/services/demo/request-repository";

export function RequestActions({
  request,
  listing,
  currentUser,
}: {
  request: MaterialRequest;
  listing?: Listing | null;
  currentUser: User;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [agreeDialogOpen, setAgreeDialogOpen] = useState(false);
  const [agreedQty, setAgreedQty] = useState(request.requestedQuantity);

  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [closeReason, setCloseReason] = useState("");
  const [closeActionTitle, setCloseActionTitle] = useState("");
  const [closeActionDescription, setCloseActionDescription] = useState("");

  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);

  const isBuyer = currentUser.id === request.buyerId;
  const isSupplier = currentUser.id === request.supplierId;

  const availableStock = listing?.quantityAvailable ?? 0;

  async function handleConfirmAvailability() {
    setIsSubmitting(true);
    setError(null);
    try {
      await demoRequestRepository.transition(
        request.id,
        "awaiting_supplier_confirmation",
        currentUser.id,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update request.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAgree() {
    setIsSubmitting(true);
    setError(null);
    try {
      await demoRequestRepository.transition(
        request.id,
        "agreed",
        currentUser.id,
        { agreedQuantity: agreedQty },
      );
      setAgreeDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to agree to request.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleComplete() {
    setIsSubmitting(true);
    setError(null);
    try {
      await demoRequestRepository.transition(
        request.id,
        "completed",
        currentUser.id,
      );
      setCompleteDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark completed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleClose() {
    setIsSubmitting(true);
    setError(null);
    try {
      await demoRequestRepository.transition(
        request.id,
        "closed",
        currentUser.id,
        { reason: closeReason.trim() || undefined },
      );
      setCloseDialogOpen(false);
      setCloseReason("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to close request.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function openCloseDialog(title: string, description: string) {
    setCloseActionTitle(title);
    setCloseActionDescription(description);
    setCloseReason("");
    setError(null);
    setCloseDialogOpen(true);
  }

  return (
    <div className="border-line bg-surface rounded-lg border p-5 sm:p-6">
      <h3 className="font-heading text-base font-semibold text-ink-900">
        Coordination actions
      </h3>
      <p className="text-ink-600 mt-1 text-xs sm:text-sm">
        Authorized status changes for {isSupplier ? "the supplier" : "the buyer"}.
      </p>

      {error ? (
        <Alert variant="error" className="mt-4 text-xs">
          {error}
        </Alert>
      ) : null}

      {/* Supplier actions */}
      {isSupplier && (
        <div className="mt-4">
          {request.status === "new" && (
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                onClick={handleConfirmAvailability}
                disabled={isSubmitting}
                className="h-9 px-4 text-xs font-semibold"
              >
                <Clock aria-hidden="true" className="mr-1.5 size-3.5" />
                Confirm availability
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setAgreedQty(request.requestedQuantity);
                  setAgreeDialogOpen(true);
                }}
                disabled={isSubmitting || availableStock <= 0}
                className="h-9 px-4 text-xs font-semibold"
              >
                <Check aria-hidden="true" className="mr-1.5 size-3.5" />
                Agree to request
              </Button>

              <Button
                type="button"
                variant="destructive"
                onClick={() =>
                  openCloseDialog(
                    "Decline Request",
                    "Are you sure you want to decline this request? The buyer will be notified.",
                  )
                }
                disabled={isSubmitting}
                className="h-9 px-4 text-xs font-semibold"
              >
                <X aria-hidden="true" className="mr-1.5 size-3.5" />
                Decline
              </Button>
            </div>
          )}

          {request.status === "awaiting_supplier_confirmation" && (
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                onClick={() => {
                  setAgreedQty(request.requestedQuantity);
                  setAgreeDialogOpen(true);
                }}
                disabled={isSubmitting || availableStock <= 0}
                className="h-9 px-4 text-xs font-semibold"
              >
                <Check aria-hidden="true" className="mr-1.5 size-3.5" />
                Agree to request
              </Button>

              <Button
                type="button"
                variant="destructive"
                onClick={() =>
                  openCloseDialog(
                    "Decline Request",
                    "Are you sure you want to decline this request? The buyer will be notified.",
                  )
                }
                disabled={isSubmitting}
                className="h-9 px-4 text-xs font-semibold"
              >
                <X aria-hidden="true" className="mr-1.5 size-3.5" />
                Decline
              </Button>
            </div>
          )}

          {request.status === "agreed" && (
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                onClick={() => setCompleteDialogOpen(true)}
                disabled={isSubmitting}
                className="h-9 px-4 text-xs font-semibold"
              >
                <CheckCircle2 aria-hidden="true" className="mr-1.5 size-3.5" />
                Mark handover completed
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  openCloseDialog(
                    "Cancel Agreed Request",
                    "Cancelling will release the reserved stock back to your active listing. Enter a reason for the record.",
                  )
                }
                disabled={isSubmitting}
                className="h-9 px-4 text-xs font-semibold"
              >
                <XCircle aria-hidden="true" className="mr-1.5 size-3.5 text-danger" />
                Cancel request
              </Button>
            </div>
          )}

          {(request.status === "completed" || request.status === "closed") && (
            <p className="text-ink-600 text-xs italic">
              This request is {request.status}. All specifications and history are preserved for audit.
            </p>
          )}
        </div>
      )}

      {/* Buyer actions */}
      {isBuyer && (
        <div className="mt-4">
          {(request.status === "new" ||
            request.status === "awaiting_supplier_confirmation") && (
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="destructive"
                onClick={() =>
                  openCloseDialog(
                    "Withdraw Request",
                    "Are you sure you want to withdraw this request before the supplier confirms?",
                  )
                }
                disabled={isSubmitting}
                className="h-9 px-4 text-xs font-semibold"
              >
                <X aria-hidden="true" className="mr-1.5 size-3.5" />
                Withdraw request
              </Button>
            </div>
          )}

          {request.status === "agreed" && (
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  openCloseDialog(
                    "Cancel Agreed Request",
                    "Cancelling will release the reserved stock back to the supplier. Please provide a reason.",
                  )
                }
                disabled={isSubmitting}
                className="h-9 px-4 text-xs font-semibold"
              >
                <XCircle aria-hidden="true" className="mr-1.5 size-3.5 text-danger" />
                Cancel request
              </Button>
            </div>
          )}

          {(request.status === "completed" || request.status === "closed") && (
            <p className="text-ink-600 text-xs italic">
              This request is {request.status}. All terms and messages are preserved for your records.
            </p>
          )}
        </div>
      )}

      {/* Agree Modal Dialog */}
      <Dialog open={agreeDialogOpen} onOpenChange={setAgreeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agree to Material Request</DialogTitle>
            <DialogDescription>
              Confirming this request will atomically reserve the agreed quantity
              from your listing stock.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <Field>
              <FieldLabel htmlFor="agreed-qty" required>
                Agreed quantity ({request.unit})
              </FieldLabel>
              <FieldDescription>
                Currently {availableStock} {request.unit} available in stock.
              </FieldDescription>
              <Input
                id="agreed-qty"
                type="number"
                min="1"
                max={availableStock}
                value={agreedQty}
                onChange={(e) => setAgreedQty(parseInt(e.target.value, 10) || 0)}
              />
            </Field>

            <Alert className="text-xs">
              Stock reservation is recorded immediately in the local demo database. If this request is cancelled before completion, stock will be restored automatically.
            </Alert>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setAgreeDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAgree}
              disabled={
                isSubmitting || agreedQty <= 0 || agreedQty > availableStock
              }
            >
              Confirm & Reserve {agreedQty} {request.unit}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Handover Dialog */}
      <Dialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Material Handover</DialogTitle>
            <DialogDescription>
              Confirm that the buyer has inspected and picked up this batch.
              The reserved quantity will become permanently consumed.
            </DialogDescription>
          </DialogHeader>

          <Alert className="text-xs">
            WoodLoop is a circular offcut coordination tool. Physical material verification occurs during pickup between supplier and buyer.
          </Alert>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setCompleteDialogOpen(false)}
            >
              Back
            </Button>
            <Button
              type="button"
              onClick={handleComplete}
              disabled={isSubmitting}
            >
              Confirm Handover Completed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Close / Decline / Cancel Dialog */}
      <Dialog open={closeDialogOpen} onOpenChange={setCloseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{closeActionTitle}</DialogTitle>
            <DialogDescription>{closeActionDescription}</DialogDescription>
          </DialogHeader>

          <Field className="py-2">
            <FieldLabel htmlFor="close-reason">Reason (Optional)</FieldLabel>
            <Textarea
              id="close-reason"
              value={closeReason}
              onChange={(e) => setCloseReason(e.target.value)}
              placeholder="e.g. Quantity no longer available, changed project needs, buyer did not pick up..."
              className="min-h-20 text-sm"
            />
          </Field>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setCloseDialogOpen(false)}
            >
              Keep request
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Confirm Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
