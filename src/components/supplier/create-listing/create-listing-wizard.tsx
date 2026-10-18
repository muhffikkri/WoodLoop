"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, CloudOff, RefreshCw, Trash2 } from "lucide-react";

import {
  WizardProgress,
  type WizardStep,
} from "@/components/supplier/create-listing/wizard-progress";
import {
  StepPhotos,
  type UploadedPhotoItem,
} from "@/components/supplier/create-listing/step-photos";
import {
  StepDetails,
  type ListingDetailsFormState,
} from "@/components/supplier/create-listing/step-details";
import { StepReview } from "@/components/supplier/create-listing/step-review";
import { StepConfirmation } from "@/components/supplier/create-listing/step-confirmation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Listing, NewListingInput, User } from "@/domain/types";
import { demoListingRepository } from "@/services/demo/listing-repository";
import { demoPhotoRepository } from "@/services/demo/photo-repository";
import { demoDraftRepository } from "@/services/demo/draft-repository";
import { listingPhoto } from "@/services/demo/demo-listings";

const DEFAULT_DETAILS: ListingDetailsFormState = {
  title: "",
  woodForm: "board",
  lengthMm: null,
  lengthUnknown: false,
  widthMm: null,
  widthUnknown: false,
  thicknessMm: null,
  thicknessUnknown: false,
  approximate: true,
  dimensionsNotes: "",
  quantityTotal: "",
  unit: "pieces",
  sourceProcess: "Cabinet panel trimming",
  region: "Setagaya, Tokyo",
  availability: "active",
  availableFrom: "",
  declaredSpecies: "",
  declaredTreatment: "untreated",
  surfaceNotes: "",
  pickupNotes: "",
};

export function CreateListingWizard({
  user,
  mode = "create",
  initialListing,
}: {
  user: User;
  mode?: "create" | "edit";
  initialListing?: Listing;
}) {
  const [step, setStep] = useState<WizardStep>("photos");
  const [photos, setPhotos] = useState<UploadedPhotoItem[]>([]);
  const [details, setDetails] = useState<ListingDetailsFormState>(() => {
    if (initialListing) {
      return {
        title: initialListing.title,
        woodForm: initialListing.woodForm,
        lengthMm: initialListing.dimensions.length ?? null,
        lengthUnknown: initialListing.dimensions.length == null,
        widthMm: initialListing.dimensions.width ?? null,
        widthUnknown: initialListing.dimensions.width == null,
        thicknessMm: initialListing.dimensions.thickness ?? null,
        thicknessUnknown: initialListing.dimensions.thickness == null,
        approximate: initialListing.dimensions.approximate,
        dimensionsNotes: initialListing.dimensions.notes ?? "",
        quantityTotal: initialListing.quantityTotal,
        unit: initialListing.unit,
        sourceProcess: initialListing.sourceProcess,
        region: initialListing.region,
        availability:
          initialListing.status === "draft"
            ? "draft"
            : initialListing.availableFrom
              ? "from_date"
              : "active",
        availableFrom: initialListing.availableFrom ?? "",
        declaredSpecies: initialListing.declaredSpecies ?? "",
        declaredTreatment: initialListing.declaredTreatment ?? "untreated",
        surfaceNotes: initialListing.visibleConditionNotes ?? "",
        pickupNotes: initialListing.pickupDetails ?? "",
        aiSuggestion: initialListing.aiSuggestion,
      };
    }
    return DEFAULT_DETAILS;
  });

  const [publishedListing, setPublishedListing] = useState<Listing | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [draftSaveStatus, setDraftSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);

  const draftIdRef = useRef<string>(`draft-user-${user.id}`);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isHydratedRef = useRef(false);

  // Load photos if initialListing is provided (edit mode)
  useEffect(() => {
    if (initialListing && initialListing.photoIds.length > 0) {
      void demoPhotoRepository
        .listByIds(initialListing.photoIds)
        .then((stored) => {
          if (stored.length > 0) {
            setPhotos(
              stored.map((p) => ({
                id: p.id,
                src: demoPhotoRepository.ensureObjectUrl(p),
                alt: p.altText,
                size: p.size,
              })),
            );
          } else {
            // Fallback for demo seeded photos ("boards", "strips", "blocks")
            setPhotos(
              initialListing.photoIds.map((id) => {
                const info = listingPhoto(id);
                return {
                  id,
                  src: info.src,
                  alt: info.alt,
                  size: 100000,
                };
              }),
            );
          }
        });
    }
  }, [initialListing]);

  // Restore draft on mount if in create mode
  useEffect(() => {
    if (mode === "edit" || isHydratedRef.current) return;

    let active = true;
    void demoDraftRepository
      .getLatestForSupplier(user.id)
      .then(async (draft) => {
        if (!active || !draft) {
          isHydratedRef.current = true;
          return;
        }

        // Restore photo items from repository
        const restoredPhotos: UploadedPhotoItem[] = [];
        if (draft.photoIds.length > 0) {
          const storedPhotos = await demoPhotoRepository.listByIds(
            draft.photoIds,
          );
          for (const sp of storedPhotos) {
            restoredPhotos.push({
              id: sp.id,
              src: demoPhotoRepository.ensureObjectUrl(sp),
              alt: sp.altText,
              size: sp.size,
            });
          }
        }

        if (!active) return;
        setPhotos(restoredPhotos);

        const v = draft.values;
        if (v) {
          setDetails({
            title: v.title ?? "",
            woodForm: v.woodForm ?? "board",
            lengthMm: v.dimensions?.length ?? null,
            lengthUnknown: v.dimensions?.length == null,
            widthMm: v.dimensions?.width ?? null,
            widthUnknown: v.dimensions?.width == null,
            thicknessMm: v.dimensions?.thickness ?? null,
            thicknessUnknown: v.dimensions?.thickness == null,
            approximate: v.dimensions?.approximate ?? true,
            dimensionsNotes: v.dimensions?.notes ?? "",
            quantityTotal: v.quantityTotal ?? "",
            unit: v.unit ?? "pieces",
            sourceProcess: v.sourceProcess ?? "Cabinet panel trimming",
            region: v.region ?? "Setagaya, Tokyo",
            availability:
              v.status === "draft"
                ? "draft"
                : v.availableFrom
                  ? "from_date"
                  : "active",
            availableFrom: v.availableFrom ?? "",
            declaredSpecies: v.declaredSpecies ?? "",
            declaredTreatment: v.declaredTreatment ?? "untreated",
            surfaceNotes: v.visibleConditionNotes ?? "",
            pickupNotes: v.pickupDetails ?? "",
            aiSuggestion: v.aiSuggestion,
          });
        }

        if (draft.currentStep) {
          setStep(draft.currentStep);
        }

        setDraftSaveStatus("saved");
        isHydratedRef.current = true;
      });

    return () => {
      active = false;
    };
  }, [mode, user.id]);

  // Persist draft to repository
  const persistDraft = useCallback(
    async (
      currentStep: WizardStep,
      currentPhotos: UploadedPhotoItem[],
      currentDetails: ListingDetailsFormState,
    ) => {
      if (mode === "edit" || !isHydratedRef.current) return;

      setDraftSaveStatus("saving");
      try {
        const photoIds = currentPhotos.map((p) => p.id);
        const draftInput: Partial<NewListingInput> = {
          title: currentDetails.title,
          woodForm: currentDetails.woodForm,
          dimensions: {
            length: currentDetails.lengthUnknown
              ? null
              : currentDetails.lengthMm,
            width: currentDetails.widthUnknown ? null : currentDetails.widthMm,
            thickness: currentDetails.thicknessUnknown
              ? null
              : currentDetails.thicknessMm,
            approximate: currentDetails.approximate,
            notes: currentDetails.dimensionsNotes || undefined,
          },
          quantityTotal:
            typeof currentDetails.quantityTotal === "number"
              ? currentDetails.quantityTotal
              : 0,
          unit: currentDetails.unit,
          sourceProcess: currentDetails.sourceProcess,
          region: currentDetails.region,
          pickupDetails: currentDetails.pickupNotes || undefined,
          availableFrom:
            currentDetails.availability === "from_date"
              ? currentDetails.availableFrom
              : undefined,
          visibleConditionNotes: currentDetails.surfaceNotes || undefined,
          declaredSpecies: currentDetails.declaredSpecies || null,
          declaredTreatment: currentDetails.declaredTreatment,
          status: currentDetails.availability === "draft" ? "draft" : "active",
          photoIds,
          aiSuggestion: currentDetails.aiSuggestion,
        };

        await demoDraftRepository.save(
          {
            id: draftIdRef.current,
            supplierId: user.id,
            values: draftInput,
            photoIds,
            currentStep: currentStep === "publish" ? "review" : currentStep,
            updatedAt: new Date().toISOString(),
            schemaVersion: 1,
          },
          user.id,
        );

        setDraftSaveStatus("saved");
      } catch {
        setDraftSaveStatus("error");
      }
    },
    [mode, user.id],
  );

  // Auto-save debounce effect
  useEffect(() => {
    if (mode === "edit" || !isHydratedRef.current || step === "publish") return;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      void persistDraft(step, photos, details);
    }, 800);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [step, photos, details, mode, persistDraft]);

  // Discard draft handler
  async function handleDiscardDraft() {
    setDiscardDialogOpen(false);
    if (mode === "create") {
      // Clean up draft photos
      for (const p of photos) {
        await demoPhotoRepository.remove(p.id, user.id);
      }
      await demoDraftRepository.remove(draftIdRef.current, user.id);
      setPhotos([]);
      setDetails(DEFAULT_DETAILS);
      setStep("photos");
      setDraftSaveStatus("idle");
    }
  }

  // Publish / Save handler
  async function handlePublish(targetStatus?: "active" | "draft") {
    if (isSubmitting) return; // Prevent double submit
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const photoIds = photos.map((p) => p.id);
      const isDraft =
        targetStatus === "draft" || details.availability === "draft";

      const dimensions = {
        length: details.lengthUnknown ? null : details.lengthMm,
        width: details.widthUnknown ? null : details.widthMm,
        thickness: details.thicknessUnknown ? null : details.thicknessMm,
        approximate: details.approximate,
        notes: details.dimensionsNotes || undefined,
      };

      if (mode === "edit" && initialListing) {
        const updated = await demoListingRepository.update(
          initialListing.id,
          {
            title: details.title,
            woodForm: details.woodForm,
            dimensions,
            quantityTotal: Number(details.quantityTotal),
            unit: details.unit,
            sourceProcess: details.sourceProcess,
            region: details.region,
            pickupDetails: details.pickupNotes || undefined,
            availableFrom:
              details.availability === "from_date"
                ? details.availableFrom
                : undefined,
            visibleConditionNotes: details.surfaceNotes || undefined,
            declaredSpecies: details.declaredSpecies || null,
            declaredTreatment: details.declaredTreatment,
            status: isDraft ? "draft" : "active",
            photoIds,
            aiSuggestion: details.aiSuggestion,
          },
          user.id,
        );
        setPublishedListing(updated);
      } else {
        const newListing = await demoListingRepository.create(
          {
            title: details.title,
            woodForm: details.woodForm,
            dimensions,
            quantityTotal: Number(details.quantityTotal),
            unit: details.unit,
            sourceProcess: details.sourceProcess,
            region: details.region,
            pickupDetails: details.pickupNotes || undefined,
            availableFrom:
              details.availability === "from_date"
                ? details.availableFrom
                : undefined,
            visibleConditionNotes: details.surfaceNotes || undefined,
            declaredSpecies: details.declaredSpecies || null,
            declaredTreatment: details.declaredTreatment,
            status: isDraft ? "draft" : "active",
            photoIds,
            aiSuggestion: details.aiSuggestion,
          },
          user.id,
        );

        // Clean up draft after successful creation
        await demoDraftRepository.remove(draftIdRef.current, user.id);
        setPublishedListing(newListing);
      }

      setStep("publish");
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to save listing. Please check your connection and inputs.";
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleReset() {
    setPhotos([]);
    setDetails(DEFAULT_DETAILS);
    setPublishedListing(null);
    setSubmitError(null);
    setStep("photos");
    setDraftSaveStatus("idle");
  }

  return (
    <div className="space-y-6">
      {/* Top Wizard Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <WizardProgress
          currentStep={step}
          onStepClick={(targetStep) => {
            if (targetStep !== "publish") setStep(targetStep);
          }}
        />

        {mode === "create" && step !== "publish" ? (
          <div className="flex items-center gap-3 text-xs text-ink-600">
            {draftSaveStatus === "saving" ? (
              <span className="flex items-center gap-1.5 text-ink-600">
                <RefreshCw aria-hidden="true" className="size-3.5 animate-spin" />
                Saving draft...
              </span>
            ) : draftSaveStatus === "saved" ? (
              <span className="flex items-center gap-1.5 text-brand-900 font-medium">
                <Check aria-hidden="true" className="size-3.5" />
                Draft saved locally
              </span>
            ) : draftSaveStatus === "error" ? (
              <span className="flex items-center gap-1.5 text-amber-800">
                <CloudOff aria-hidden="true" className="size-3.5" />
                Draft offline
              </span>
            ) : null}

            {photos.length > 0 || details.title ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setDiscardDialogOpen(true)}
                className="h-8 px-2 text-xs"
              >
                <Trash2 aria-hidden="true" className="mr-1 size-3.5" />
                Discard draft
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Wizard Steps */}
      {step === "photos" && (
        <StepPhotos
          photos={photos}
          onPhotosChange={setPhotos}
          onNext={() => setStep("details")}
          supplierId={user.id}
          onSaveDraftBeforeNavigate={() =>
            persistDraft(step, photos, details)
          }
        />
      )}

      {step === "details" && (
        <StepDetails
          values={details}
          onChange={(patch) => setDetails((prev) => ({ ...prev, ...patch }))}
          onNext={() => setStep("review")}
          onBack={() => setStep("photos")}
          photoIds={photos.map((p) => p.id)}
        />
      )}

      {step === "review" && (
        <StepReview
          photos={photos}
          details={details}
          onEditPhotos={() => setStep("photos")}
          onEditDetails={() => setStep("details")}
          onPublish={() => handlePublish("active")}
          onSaveDraft={() => handlePublish("draft")}
          isSubmitting={isSubmitting}
          submitError={submitError}
          mode={mode}
        />
      )}

      {step === "publish" && publishedListing && (
        <StepConfirmation
          listing={publishedListing}
          isDraftOnly={publishedListing.status === "draft"}
          onReset={handleReset}
        />
      )}

      {/* Discard Draft Confirmation Dialog */}
      <Dialog open={discardDialogOpen} onOpenChange={setDiscardDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discard draft?</DialogTitle>
            <DialogDescription>
              This will remove all uploaded photos and form inputs saved for this
              draft on your device. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDiscardDialogOpen(false)}
            >
              Keep draft
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void handleDiscardDraft()}
            >
              Discard draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
