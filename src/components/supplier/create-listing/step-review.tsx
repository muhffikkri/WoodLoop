"use client";

import Image from "next/image";
import { useState } from "react";
import {
  Bot,
  CheckCircle2,
  Edit2,
  MapPin,
  Package,
  Ruler,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { UploadedPhotoItem } from "@/components/supplier/create-listing/step-photos";
import type { ListingDetailsFormState } from "@/components/supplier/create-listing/step-details";

export function StepReview({
  photos,
  details,
  onEditPhotos,
  onEditDetails,
  onPublish,
  onSaveDraft,
  isSubmitting,
  submitError,
  mode = "create",
}: {
  photos: UploadedPhotoItem[];
  details: ListingDetailsFormState;
  onEditPhotos: () => void;
  onEditDetails: () => void;
  onPublish: () => Promise<void>;
  onSaveDraft: () => Promise<void>;
  isSubmitting: boolean;
  submitError: string | null;
  mode?: "create" | "edit";
}) {
  const [acknowledged, setAcknowledged] = useState(false);
  const isTreated = details.declaredTreatment === "treated";

  const dimensionText = [
    details.lengthUnknown
      ? "Length unmeasured"
      : `${details.lengthMm ?? "?"} mm L`,
    details.widthUnknown
      ? "Width unmeasured"
      : `${details.widthMm ?? "?"} mm W`,
    details.thicknessUnknown
      ? "Thickness unmeasured"
      : `${details.thicknessMm ?? "?"} mm T`,
  ].join(" × ");

  const canPublish =
    acknowledged &&
    !isTreated &&
    photos.length > 0 &&
    Boolean(details.title.trim()) &&
    Boolean(details.quantityTotal) &&
    !isSubmitting;

  return (
    <div className="space-y-6">
      <div className="border-line bg-surface rounded-lg border p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <div>
            <h2 className="font-heading text-xl font-semibold text-ink-900">
              Review your batch listing
            </h2>
            <p className="text-ink-600 mt-1 text-sm">
              Verify accuracy before publishing. All specifications will be
              visible to buyers in the catalog.
            </p>
          </div>
          <Badge
            variant={details.availability === "draft" ? "unavailable" : "available"}
          >
            {details.availability === "draft"
              ? "Draft / Unavailable"
              : details.availability === "from_date"
                ? `Available from ${details.availableFrom}`
                : "Ready to publish active"}
          </Badge>
        </div>

        {/* Section 1: Photos */}
        <div className="mt-6 border-b border-line pb-6">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-base font-semibold text-ink-900 flex items-center gap-2">
              <Package aria-hidden="true" className="size-4 text-timber-600" />
              Batch photos ({photos.length})
            </h3>
            <Button
              type="button"
              variant="secondary"
              onClick={onEditPhotos}
              className="h-8 px-2.5 text-xs"
            >
              <Edit2 aria-hidden="true" className="mr-1.5 size-3.5" />
              Edit photos
            </Button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {photos.map((item, index) => (
              <div
                key={item.id}
                className="border-line bg-surface relative aspect-4/3 overflow-hidden rounded-md border"
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="200px"
                  className="object-cover"
                  unoptimized={item.src.startsWith("blob:")}
                />
                {index === 0 ? (
                  <div className="absolute top-2 left-2">
                    <Badge variant="available" className="text-[10px]">
                      Cover photo
                    </Badge>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Material Specifications */}
        <div className="mt-6 border-b border-line pb-6">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-base font-semibold text-ink-900 flex items-center gap-2">
              <Ruler aria-hidden="true" className="size-4 text-timber-600" />
              Material specifications
            </h3>
            <Button
              type="button"
              variant="secondary"
              onClick={onEditDetails}
              className="h-8 px-2.5 text-xs"
            >
              <Edit2 aria-hidden="true" className="mr-1.5 size-3.5" />
              Edit details
            </Button>
          </div>

          <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            <div>
              <dt className="text-ink-600 text-xs font-medium uppercase tracking-wider">
                Title
              </dt>
              <dd className="font-heading text-ink-900 mt-1 text-sm font-semibold">
                {details.title}
              </dd>
            </div>

            <div>
              <dt className="text-ink-600 text-xs font-medium uppercase tracking-wider">
                Wood Form
              </dt>
              <dd className="font-heading text-ink-900 mt-1 text-sm font-semibold capitalize">
                {details.woodForm}
              </dd>
            </div>

            <div>
              <dt className="text-ink-600 text-xs font-medium uppercase tracking-wider">
                Dimensions
              </dt>
              <dd className="text-ink-900 mt-1 text-sm flex items-center gap-2">
                <span className="font-semibold">{dimensionText}</span>
                {details.approximate ? (
                  <Badge variant="unverified" className="text-[11px]">
                    Approx.
                  </Badge>
                ) : null}
              </dd>
            </div>

            <div>
              <dt className="text-ink-600 text-xs font-medium uppercase tracking-wider">
                Quantity
              </dt>
              <dd className="text-ink-900 mt-1 text-sm font-semibold">
                {details.quantityTotal} {details.unit}
              </dd>
            </div>

            <div>
              <dt className="text-ink-600 text-xs font-medium uppercase tracking-wider">
                Source Process
              </dt>
              <dd className="text-ink-900 mt-1 text-sm">
                {details.sourceProcess}
              </dd>
            </div>

            <div>
              <dt className="text-ink-600 text-xs font-medium uppercase tracking-wider">
                Region
              </dt>
              <dd className="text-ink-900 mt-1 text-sm flex items-center gap-1.5">
                <MapPin aria-hidden="true" className="size-3.5 text-timber-600" />
                {details.region}
              </dd>
            </div>

            <div>
              <dt className="text-ink-600 text-xs font-medium uppercase tracking-wider">
                Declared Species
              </dt>
              <dd className="text-ink-900 mt-1 text-sm">
                {details.declaredSpecies ? (
                  <span>
                    {details.declaredSpecies}{" "}
                    <span className="text-ink-600 text-xs block">
                      (Supplier-declared, not independently verified)
                    </span>
                  </span>
                ) : (
                  <span className="text-ink-600 italic">Not specified</span>
                )}
              </dd>
            </div>

            <div>
              <dt className="text-ink-600 text-xs font-medium uppercase tracking-wider">
                Treatment Status
              </dt>
              <dd className="mt-1 text-sm">
                {details.declaredTreatment === "untreated" ? (
                  <Badge variant="available">Untreated solid wood</Badge>
                ) : details.declaredTreatment === "unsure" ? (
                  <Badge variant="unverified">Unsure of chemical history</Badge>
                ) : (
                  <Badge variant="unavailable">Chemically treated (Out of scope)</Badge>
                )}
              </dd>
            </div>

            {details.surfaceNotes ? (
              <div className="sm:col-span-2">
                <dt className="text-ink-600 text-xs font-medium uppercase tracking-wider">
                  Surface Observations & Imperfections
                </dt>
                <dd className="text-ink-900 mt-1 text-sm whitespace-pre-line bg-sage-100/40 p-3 rounded-md">
                  {details.surfaceNotes}
                </dd>
              </div>
            ) : null}

            {details.pickupNotes ? (
              <div className="sm:col-span-2">
                <dt className="text-ink-600 text-xs font-medium uppercase tracking-wider">
                  Pickup & Access Notes
                </dt>
                <dd className="text-ink-900 mt-1 text-sm whitespace-pre-line">
                  {details.pickupNotes}
                </dd>
              </div>
            ) : null}
          </dl>
        </div>

        {/* Section 3: AI Assistance Provenance Module */}
        <div className="mt-6 border-b border-line pb-6">
          <h3 className="font-heading text-base font-semibold text-ink-900 flex items-center gap-2">
            <Bot aria-hidden="true" className="size-4 text-timber-600" />
            AI Suggestions Provenance
          </h3>

          <div className="bg-sage-100/50 mt-3 rounded-md p-4 text-xs sm:text-sm text-ink-900">
            {details.aiSuggestion?.reviewedBySupplier ? (
              <div className="flex items-start gap-2.5">
                <CheckCircle2 aria-hidden="true" className="text-brand-900 mt-0.5 size-4 shrink-0" />
                <div>
                  <span className="font-semibold text-brand-900">
                    AI suggestions reviewed and accepted by supplier:
                  </span>
                  <p className="text-ink-600 mt-0.5">
                    Wood form &ldquo;{details.aiSuggestion.suggestedForm}&rdquo; accepted. Visual surface tags reviewed.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2.5 text-ink-600">
                <Sparkles aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                <span>
                  No AI suggestions were applied. All attributes were entered
                  directly by the supplier.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Mandatory Scope & Accuracy Acknowledgment */}
        <div className="mt-6 space-y-4">
          {isTreated ? (
            <Alert variant="error">
              <ShieldAlert aria-hidden="true" className="size-5 shrink-0" />
              <div>
                <span className="font-bold">Active Publication Blocked:</span> Chemically
                treated or contaminated wood cannot be published active in WoodLoop
                circular marketplace. You can save this batch as an offline draft
                only.
              </div>
            </Alert>
          ) : null}

          <label className="border-line bg-sage-100/30 flex items-start gap-3 rounded-md border p-4 cursor-pointer">
            <input
              type="checkbox"
              id="scope-acknowledgment"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              disabled={isTreated || isSubmitting}
              className="mt-1 size-5 rounded border-line"
            />
            <span className="text-ink-900 text-xs sm:text-sm leading-5">
              <strong className="font-semibold">Required Acknowledgment: </strong>
              I confirm these details are my own best account of the batch and that
              the batch is within MVP scope (clean solid woodworking offcuts, no
              chemical contamination).
            </span>
          </label>
        </div>

        {submitError ? (
          <Alert variant="error" className="mt-4">
            {submitError}
          </Alert>
        ) : null}
      </div>

      {/* Footer Navigation & Publishing Actions */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onEditDetails}
          disabled={isSubmitting}
        >
          Back to Details
        </Button>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onSaveDraft}
            disabled={isSubmitting}
          >
            Save as draft
          </Button>

          <Button
            type="button"
            onClick={onPublish}
            disabled={!canPublish}
            className="min-w-36"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Publishing…
              </span>
            ) : mode === "edit" ? (
              "Save changes"
            ) : (
              "Publish listing"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
