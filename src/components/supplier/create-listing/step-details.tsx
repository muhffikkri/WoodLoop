"use client";

import { useState } from "react";
import { AlertCircle, ShieldAlert } from "lucide-react";

import { AIAssistancePanel } from "@/components/supplier/create-listing/ai-assistance-panel";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  AISuggestion,
  QuantityUnit,
  TreatmentDeclaration,
  WoodForm,
} from "@/domain/types";

export type ListingDetailsFormState = {
  title: string;
  woodForm: WoodForm;
  lengthMm: number | null;
  lengthUnknown: boolean;
  widthMm: number | null;
  widthUnknown: boolean;
  thicknessMm: number | null;
  thicknessUnknown: boolean;
  approximate: boolean;
  dimensionsNotes: string;
  quantityTotal: number | "";
  unit: QuantityUnit;
  sourceProcess: string;
  region: string;
  availability: "active" | "from_date" | "draft";
  availableFrom: string;
  declaredSpecies: string;
  declaredTreatment: TreatmentDeclaration;
  surfaceNotes: string;
  pickupNotes: string;
  aiSuggestion?: AISuggestion;
};

const WOOD_FORMS: { value: WoodForm; label: string; desc: string }[] = [
  { value: "board", label: "Board", desc: "Flat, wide planks or cutoffs" },
  { value: "strip", label: "Strip", desc: "Long, narrow battens or edging" },
  { value: "block", label: "Block", desc: "Chunky 3D solid offcuts" },
  { value: "other", label: "Other", desc: "Irregular or specialty shapes" },
];

const SOURCE_PROCESSES = [
  "Cabinet panel trimming",
  "Frame component trimming",
  "Joinery component cutting",
  "Furniture sizing & dimensioning",
  "Production assembly offcut",
  "Turnery cutoff",
  "Other woodworking offcut",
];

const REGIONS = [
  "Setagaya, Tokyo",
  "Koto, Tokyo",
  "Shinagawa, Tokyo",
  "Ota, Tokyo",
  "Shinjuku, Tokyo",
  "Sumida, Tokyo",
  "Yokohama, Kanagawa",
  "Kawasaki, Kanagawa",
  "Saitama area",
  "Chiba area",
];

export function StepDetails({
  values,
  onChange,
  onNext,
  onBack,
  photoIds,
}: {
  values: ListingDetailsFormState;
  onChange: (patch: Partial<ListingDetailsFormState>) => void;
  onNext: () => void;
  onBack: () => void;
  photoIds: string[];
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const errs: Record<string, string> = {};

    if (!values.title.trim()) {
      errs.title = "Listing title is required.";
    } else if (values.title.trim().length < 5) {
      errs.title = "Title must be at least 5 characters.";
    } else if (values.title.trim().length > 80) {
      errs.title = "Title must be under 80 characters.";
    }

    if (!values.quantityTotal || Number(values.quantityTotal) <= 0) {
      errs.quantity = "Enter a whole quantity greater than 0.";
    }

    if (!values.lengthUnknown && (!values.lengthMm || values.lengthMm <= 0)) {
      errs.length = "Enter a positive length or mark as unmeasured.";
    }

    if (!values.widthUnknown && (!values.widthMm || values.widthMm <= 0)) {
      errs.width = "Enter a positive width or mark as unmeasured.";
    }

    if (
      !values.thicknessUnknown &&
      (!values.thicknessMm || values.thicknessMm <= 0)
    ) {
      errs.thickness = "Enter a positive thickness or mark as unmeasured.";
    }

    if (!values.sourceProcess.trim()) {
      errs.sourceProcess = "Specify the origin or production process.";
    }

    if (!values.region.trim()) {
      errs.region = "Select a region.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleContinue() {
    if (validate()) {
      onNext();
    }
  }

  return (
    <div className="space-y-6">
      <div className="border-line bg-surface rounded-lg border p-5 sm:p-6">
        <h2 className="font-heading text-xl font-semibold text-ink-900">
          Batch specifications & origin
        </h2>
        <p className="text-ink-600 mt-2 text-sm leading-6">
          Provide accurate, supplier-confirmed details. WoodLoop prioritizes
          trust and transparency over guesswork.
        </p>

        <div className="mt-6 space-y-6">
          {/* Title */}
          <Field>
            <FieldLabel htmlFor="listing-title" required>
              Listing title
            </FieldLabel>
            <FieldDescription>
              5–80 characters. Use species name only if declared/known (e.g.,
              &ldquo;Solid wood board offcuts&rdquo; or &ldquo;Oak panel offcuts&rdquo;).
            </FieldDescription>
            <Input
              id="listing-title"
              value={values.title}
              onChange={(e) => {
                onChange({ title: e.target.value });
                if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
              }}
              placeholder="e.g. Solid wood board offcuts · cabinet trimming"
              maxLength={80}
              aria-invalid={Boolean(errors.title)}
            />
            {errors.title ? <FieldError>{errors.title}</FieldError> : null}
          </Field>

          {/* Wood Form */}
          <Field>
            <FieldLabel required>Wood form (Supplier-confirmed)</FieldLabel>
            <FieldDescription>
              Select the primary shape of the offcut pieces in this batch.
            </FieldDescription>
            <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {WOOD_FORMS.map((form) => {
                const selected = values.woodForm === form.value;
                return (
                  <button
                    key={form.value}
                    type="button"
                    onClick={() => onChange({ woodForm: form.value })}
                    className={`border-line text-left rounded-md border p-3.5 transition-all ${
                      selected
                        ? "border-brand-900 bg-sage-100 ring-brand-900 ring-1"
                        : "bg-surface hover:bg-sage-100/50"
                    }`}
                  >
                    <span className="font-heading text-ink-900 block text-sm font-semibold">
                      {form.label}
                    </span>
                    <span className="text-ink-600 mt-1 block text-xs leading-4">
                      {form.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </Field>

          {/* AI Assistance Area */}
          <AIAssistancePanel
            photoIds={photoIds}
            currentWoodForm={values.woodForm}
            initialSuggestion={values.aiSuggestion}
            onAcceptSuggestion={(form, noteTag) => {
              onChange({
                woodForm: form,
                surfaceNotes: values.surfaceNotes
                  ? `${values.surfaceNotes}\n${noteTag ?? ""}`
                  : (noteTag ?? ""),
                aiSuggestion: {
                  id: `ai-accepted-${Date.now()}`,
                  status: "demo_example",
                  suggestedForm: form,
                  visibleConditions: ["apparently_intact"],
                  reviewedBySupplier: true,
                  reviewedAt: new Date().toISOString(),
                },
              });
            }}
            onDismissSuggestion={() => {
              onChange({ aiSuggestion: undefined });
            }}
          />

          {/* Dimensions Section */}
          <div className="border-line rounded-lg border p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-heading text-sm font-semibold text-ink-900">
                  Dimensions (mm)
                </h3>
                <p className="text-ink-600 text-xs">
                  Measure in millimeters. Positives only. Do not invent dimensions.
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Length */}
              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="length-mm">Length (mm)</FieldLabel>
                  <label className="text-ink-600 flex items-center gap-1.5 text-xs">
                    <input
                      type="checkbox"
                      checked={values.lengthUnknown}
                      onChange={(e) =>
                        onChange({
                          lengthUnknown: e.target.checked,
                          lengthMm: e.target.checked ? null : values.lengthMm,
                        })
                      }
                      className="rounded border-line size-3.5"
                    />
                    Unknown
                  </label>
                </div>
                <Input
                  id="length-mm"
                  type="number"
                  min="1"
                  step="1"
                  disabled={values.lengthUnknown}
                  value={values.lengthMm ?? ""}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : null;
                    onChange({ lengthMm: val });
                    if (errors.length)
                      setErrors((prev) => ({ ...prev, length: "" }));
                  }}
                  placeholder={values.lengthUnknown ? "Unmeasured" : "e.g. 720"}
                />
                {errors.length ? <FieldError>{errors.length}</FieldError> : null}
              </Field>

              {/* Width */}
              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="width-mm">Width (mm)</FieldLabel>
                  <label className="text-ink-600 flex items-center gap-1.5 text-xs">
                    <input
                      type="checkbox"
                      checked={values.widthUnknown}
                      onChange={(e) =>
                        onChange({
                          widthUnknown: e.target.checked,
                          widthMm: e.target.checked ? null : values.widthMm,
                        })
                      }
                      className="rounded border-line size-3.5"
                    />
                    Unknown
                  </label>
                </div>
                <Input
                  id="width-mm"
                  type="number"
                  min="1"
                  step="1"
                  disabled={values.widthUnknown}
                  value={values.widthMm ?? ""}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : null;
                    onChange({ widthMm: val });
                    if (errors.width)
                      setErrors((prev) => ({ ...prev, width: "" }));
                  }}
                  placeholder={values.widthUnknown ? "Unmeasured" : "e.g. 180"}
                />
                {errors.width ? <FieldError>{errors.width}</FieldError> : null}
              </Field>

              {/* Thickness */}
              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="thickness-mm">Thickness (mm)</FieldLabel>
                  <label className="text-ink-600 flex items-center gap-1.5 text-xs">
                    <input
                      type="checkbox"
                      checked={values.thicknessUnknown}
                      onChange={(e) =>
                        onChange({
                          thicknessUnknown: e.target.checked,
                          thicknessMm: e.target.checked
                            ? null
                            : values.thicknessMm,
                        })
                      }
                      className="rounded border-line size-3.5"
                    />
                    Unknown
                  </label>
                </div>
                <Input
                  id="thickness-mm"
                  type="number"
                  min="1"
                  step="1"
                  disabled={values.thicknessUnknown}
                  value={values.thicknessMm ?? ""}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : null;
                    onChange({ thicknessMm: val });
                    if (errors.thickness)
                      setErrors((prev) => ({ ...prev, thickness: "" }));
                  }}
                  placeholder={
                    values.thicknessUnknown ? "Unmeasured" : "e.g. 20"
                  }
                />
                {errors.thickness ? (
                  <FieldError>{errors.thickness}</FieldError>
                ) : null}
              </Field>
            </div>

            {/* Approximate checkbox */}
            <div className="mt-4 flex items-center gap-2">
              <input
                type="checkbox"
                id="dimensions-approximate"
                checked={values.approximate}
                onChange={(e) => onChange({ approximate: e.target.checked })}
                className="rounded border-line size-4"
              />
              <label
                htmlFor="dimensions-approximate"
                className="text-ink-900 text-xs sm:text-sm font-medium"
              >
                Measurements are approximate / estimated (will display &ldquo;Approx.&rdquo; publicly)
              </label>
            </div>

            {/* Warning if any unknown */}
            {values.lengthUnknown ||
            values.widthUnknown ||
            values.thicknessUnknown ? (
              <p className="text-amber-800 text-xs mt-3 flex items-center gap-1.5">
                <AlertCircle aria-hidden="true" className="size-3.5 shrink-0" />
                Unmeasured dimensions rank lower for buyers looking for specific cut plans.
              </p>
            ) : null}
          </div>

          {/* Quantity & Unit */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="batch-quantity" required>
                Quantity
              </FieldLabel>
              <FieldDescription>Total available in this batch.</FieldDescription>
              <Input
                id="batch-quantity"
                type="number"
                min="1"
                step="1"
                value={values.quantityTotal}
                onChange={(e) => {
                  const val = e.target.value ? parseInt(e.target.value, 10) : "";
                  onChange({ quantityTotal: val });
                  if (errors.quantity)
                    setErrors((prev) => ({ ...prev, quantity: "" }));
                }}
                placeholder="e.g. 12"
              />
              {errors.quantity ? (
                <FieldError>{errors.quantity}</FieldError>
              ) : null}
            </Field>

            <Field>
              <FieldLabel htmlFor="quantity-unit" required>
                Unit
              </FieldLabel>
              <FieldDescription>Pieces or bundled sets.</FieldDescription>
              <Select
                value={values.unit}
                onValueChange={(val: QuantityUnit) => onChange({ unit: val })}
              >
                <SelectTrigger id="quantity-unit">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pieces">Pieces</SelectItem>
                  <SelectItem value="sets">Sets</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          {/* Source Process & Region */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="source-process" required>
                Source woodworking process
              </FieldLabel>
              <FieldDescription>
                Where did these offcuts originate?
              </FieldDescription>
              <Select
                value={
                  SOURCE_PROCESSES.includes(values.sourceProcess)
                    ? values.sourceProcess
                    : values.sourceProcess
                      ? "other"
                      : undefined
                }
                onValueChange={(val) => {
                  if (val !== "other") onChange({ sourceProcess: val });
                }}
              >
                <SelectTrigger id="source-process">
                  <SelectValue placeholder="Select process" />
                </SelectTrigger>
                <SelectContent>
                  {SOURCE_PROCESSES.map((proc) => (
                    <SelectItem key={proc} value={proc}>
                      {proc}
                    </SelectItem>
                  ))}
                  <SelectItem value="other">Custom process...</SelectItem>
                </SelectContent>
              </Select>
              {/* Custom input if not in standard list or custom chosen */}
              {(!SOURCE_PROCESSES.includes(values.sourceProcess) &&
                values.sourceProcess) ||
              values.sourceProcess === "Custom process..." ? (
                <Input
                  className="mt-2"
                  value={values.sourceProcess}
                  onChange={(e) => onChange({ sourceProcess: e.target.value })}
                  placeholder="Describe your woodworking process"
                />
              ) : null}
              {errors.sourceProcess ? (
                <FieldError>{errors.sourceProcess}</FieldError>
              ) : null}
            </Field>

            <Field>
              <FieldLabel htmlFor="listing-region" required>
                Region
              </FieldLabel>
              <FieldDescription>
                City or ward area. No private workshop address disclosed.
              </FieldDescription>
              <Select
                value={values.region}
                onValueChange={(val) => {
                  onChange({ region: val });
                  if (errors.region)
                    setErrors((prev) => ({ ...prev, region: "" }));
                }}
              >
                <SelectTrigger id="listing-region">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS.map((reg) => (
                    <SelectItem key={reg} value={reg}>
                      {reg}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.region ? <FieldError>{errors.region}</FieldError> : null}
            </Field>
          </div>

          {/* Availability Status */}
          <Field>
            <FieldLabel htmlFor="availability-status" required>
              Listing availability
            </FieldLabel>
            <FieldDescription>
              When can buyers request this batch?
            </FieldDescription>
            <Select
              value={values.availability}
              onValueChange={(val: "active" | "from_date" | "draft") =>
                onChange({ availability: val })
              }
            >
              <SelectTrigger id="availability-status">
                <SelectValue placeholder="Select availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Available now (Publish active)</SelectItem>
                <SelectItem value="from_date">Available from specific date</SelectItem>
                <SelectItem value="draft">Save as offline draft (Unavailable)</SelectItem>
              </SelectContent>
            </Select>

            {values.availability === "from_date" ? (
              <Input
                type="date"
                className="mt-2"
                value={values.availableFrom}
                onChange={(e) => onChange({ availableFrom: e.target.value })}
                min={new Date().toISOString().split("T")[0]}
              />
            ) : null}
          </Field>

          {/* Declared Species */}
          <Field>
            <FieldLabel htmlFor="declared-species">
              Declared species (Supplier-declared, not independently verified)
            </FieldLabel>
            <FieldDescription>
              Leave blank if species is unknown or mixed. Do not claim certification.
            </FieldDescription>
            <Input
              id="declared-species"
              value={values.declaredSpecies}
              onChange={(e) => onChange({ declaredSpecies: e.target.value })}
              placeholder="e.g. Oak, Beech, Walnut, or leave blank"
            />
          </Field>

          {/* Treatment Status - Critical Scope Check */}
          <Field>
            <FieldLabel required>Chemical treatment declaration</FieldLabel>
            <FieldDescription>
              WoodLoop circular MVP only accepts clean, untreated solid wood.
            </FieldDescription>
            <div className="mt-2 space-y-2">
              <label className="border-line bg-surface flex items-start gap-3 rounded-md border p-3 cursor-pointer">
                <input
                  type="radio"
                  name="treatment"
                  value="untreated"
                  checked={values.declaredTreatment === "untreated"}
                  onChange={() => onChange({ declaredTreatment: "untreated" })}
                  className="mt-1 size-4"
                />
                <div>
                  <span className="font-heading text-sm font-semibold text-ink-900 block">
                    Untreated solid wood (Clean offcut)
                  </span>
                  <span className="text-ink-600 text-xs">
                    No pressure treatment, pesticides, synthetic stains, or toxic finishes.
                  </span>
                </div>
              </label>

              <label className="border-line bg-surface flex items-start gap-3 rounded-md border p-3 cursor-pointer">
                <input
                  type="radio"
                  name="treatment"
                  value="unsure"
                  checked={values.declaredTreatment === "unsure"}
                  onChange={() => onChange({ declaredTreatment: "unsure" })}
                  className="mt-1 size-4"
                />
                <div>
                  <span className="font-heading text-sm font-semibold text-ink-900 block">
                    Unsure of treatment history
                  </span>
                  <span className="text-ink-600 text-xs">
                    Appears clean, but exact chemical history is unconfirmed.
                  </span>
                </div>
              </label>

              <label className="border-line bg-surface flex items-start gap-3 rounded-md border p-3 cursor-pointer">
                <input
                  type="radio"
                  name="treatment"
                  value="treated"
                  checked={values.declaredTreatment === "treated"}
                  onChange={() => onChange({ declaredTreatment: "treated" })}
                  className="mt-1 size-4"
                />
                <div>
                  <span className="font-heading text-sm font-semibold text-danger block">
                    Chemically treated / painted / pressure-treated
                  </span>
                  <span className="text-ink-600 text-xs">
                    Contains wood preservatives, heavy paint, or chemical finishes.
                  </span>
                </div>
              </label>
            </div>

            {/* Out-of-scope warning */}
            {values.declaredTreatment === "treated" ? (
              <Alert variant="error" className="mt-3">
                <ShieldAlert aria-hidden="true" className="size-4 shrink-0" />
                <div>
                  <span className="font-bold">Outside WoodLoop Scope:</span> Chemically
                  treated or contaminated wood is excluded from circular reuse in
                  the MVP. This batch cannot be published active. You can save it
                  as an offline draft only.
                </div>
              </Alert>
            ) : null}
          </Field>

          {/* Surface & Condition notes */}
          <Field>
            <FieldLabel htmlFor="surface-notes">
              Surface observations & visible imperfections (Optional)
            </FieldLabel>
            <FieldDescription>
              Note any knots, surface marks, minor edge chips, or storage conditions.
            </FieldDescription>
            <Textarea
              id="surface-notes"
              value={values.surfaceNotes}
              onChange={(e) => onChange({ surfaceNotes: e.target.value })}
              placeholder="e.g. Stored indoors in clean dry rack; minor trimmed edge marks on two pieces."
              maxLength={500}
            />
          </Field>

          {/* Pickup & Contact notes */}
          <Field>
            <FieldLabel htmlFor="pickup-notes">
              Pickup & access notes (Optional)
            </FieldLabel>
            <FieldDescription>
              General loading dock or workshop hours. Do not disclose personal phone or private address publicly.
            </FieldDescription>
            <Textarea
              id="pickup-notes"
              value={values.pickupNotes}
              onChange={(e) => onChange({ pickupNotes: e.target.value })}
              placeholder="e.g. Pickup available weekdays 09:00-17:00. Ground floor access with loading bay."
              maxLength={500}
            />
          </Field>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-2">
        <Button type="button" variant="secondary" onClick={onBack}>
          Back to Photos
        </Button>
        <Button type="button" onClick={handleContinue}>
          Review Listing
        </Button>
      </div>
    </div>
  );
}
