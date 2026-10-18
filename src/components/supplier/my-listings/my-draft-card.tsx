"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Clock,
  FileEdit,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
import type { ListingDraft } from "@/domain/types";
import { formatWoodForm } from "@/lib/listing-format";
import { demoDraftRepository } from "@/services/demo/draft-repository";

interface MyDraftCardProps {
  draft: ListingDraft;
  userId: string;
  onDiscardSuccess?: () => void;
}

export function MyDraftCard({
  draft,
  userId,
  onDiscardSuccess,
}: MyDraftCardProps) {
  const [discardOpen, setDiscardOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const title = draft.values.title?.trim() || "Untitled wood offcut";
  const woodForm = draft.values.woodForm
    ? formatWoodForm(draft.values.woodForm)
    : "Unspecified form";
  const photoCount = draft.photoIds?.length ?? 0;

  const stepLabel =
    draft.currentStep === "photos"
      ? "Step 1 · Photos"
      : draft.currentStep === "details"
        ? "Step 2 · Specifications"
        : "Step 3 · Review & Publish";

  const updatedDateStr = React.useMemo(() => {
    try {
      const d = new Date(draft.updatedAt);
      if (isNaN(d.getTime())) return "Recently";
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return "Recently";
    }
  }, [draft.updatedAt]);

  async function handleDiscard() {
    setIsDeleting(true);
    setError(null);
    try {
      await demoDraftRepository.remove(draft.id, userId);
      setDiscardOpen(false);
      onDiscardSuccess?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to discard draft.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <article className="border-line bg-surface flex flex-col justify-between overflow-hidden rounded-lg border border-dashed shadow-xs">
        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Badge variant="unverified">Draft</Badge>
                <span className="text-ink-600 text-xs font-medium">
                  {stepLabel}
                </span>
              </div>
              <h3 className="font-heading text-lg font-semibold text-ink-900 leading-snug">
                {title}
              </h3>
              <p className="text-ink-600 mt-1 text-xs">
                {woodForm} · {photoCount} {photoCount === 1 ? "photo" : "photos"} attached
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-1.5 text-xs text-ink-600">
            <Clock className="size-3.5 text-timber-600" />
            <span>Last edited: {updatedDateStr}</span>
          </div>
        </div>

        <div className="border-line bg-canvas/40 flex items-center justify-between border-t p-3 sm:p-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setDiscardOpen(true)}
            className="text-danger hover:text-danger hover:bg-danger-bg text-xs min-h-10 px-3"
          >
            <Trash2 className="size-3.5" />
            Discard
          </Button>

          <Button asChild className="text-xs min-h-10 px-3">
            <Link href="/app/listings/new">
              <FileEdit className="size-3.5" />
              Continue editing
              <ArrowRight className="size-3.5 ml-1" />
            </Link>
          </Button>
        </div>
      </article>

      {/* Discard Confirmation Dialog */}
      <Dialog open={discardOpen} onOpenChange={setDiscardOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discard listing draft?</DialogTitle>
            <DialogDescription>
              Are you sure you want to discard this draft? Any uploaded photos and details entered for &quot;{title}&quot; will be permanently removed.
            </DialogDescription>
          </DialogHeader>

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
              <Button type="button" variant="secondary" disabled={isDeleting}>
                Keep draft
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="secondary"
              className="text-danger border-danger/30 hover:bg-danger-bg"
              onClick={handleDiscard}
              disabled={isDeleting}
            >
              {isDeleting ? "Discarding..." : "Discard draft"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
