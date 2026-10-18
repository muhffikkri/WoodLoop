"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { ListingFilters, WoodForm } from "@/domain/types";
import { cn } from "@/lib/utils";

const forms: Array<{ value: WoodForm; label: string }> = [
  { value: "board", label: "Board" },
  { value: "strip", label: "Strip" },
  { value: "block", label: "Block" },
  { value: "other", label: "Other" },
];

type ListingFilterSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialFilters?: ListingFilters;
  onApply: (filters: ListingFilters) => void;
};

function numberOrUndefined(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function ListingFilterSheet({
  open,
  onOpenChange,
  initialFilters = {},
  onApply,
}: ListingFilterSheetProps) {
  const [form, setForm] = React.useState<WoodForm | undefined>(
    initialFilters.forms?.[0],
  );
  const [minLength, setMinLength] = React.useState(
    initialFilters.minLengthMm?.toString() ?? "",
  );
  const [minWidth, setMinWidth] = React.useState(
    initialFilters.minWidthMm?.toString() ?? "",
  );
  const [quantity, setQuantity] = React.useState(
    initialFilters.minimumQuantity?.toString() ?? "",
  );
  const [region, setRegion] = React.useState(initialFilters.region ?? "");

  function apply() {
    onApply({
      forms: form ? [form] : undefined,
      minLengthMm: numberOrUndefined(minLength),
      minWidthMm: numberOrUndefined(minWidth),
      minimumQuantity: numberOrUndefined(quantity),
      quantityUnit: numberOrUndefined(quantity) ? "pieces" : undefined,
      region: region.trim() || undefined,
    });
    onOpenChange(false);
  }

  function reset() {
    setForm(undefined);
    setMinLength("");
    setMinWidth("");
    setQuantity("");
    setRegion("");
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="mx-auto max-w-2xl">
        <SheetHeader>
          <SheetTitle>Filter available offcuts</SheetTitle>
          <SheetDescription>
            Use supplier-declared details to narrow the local sample catalog.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 grid gap-5">
          <fieldset>
            <legend className="text-ink-900 text-sm font-semibold">Form</legend>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {forms.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setForm((current) =>
                      current === option.value ? undefined : option.value,
                    )
                  }
                  aria-pressed={form === option.value}
                  className={cn(
                    "border-line min-h-11 rounded-md border px-3 text-sm font-semibold text-ink-600",
                    form === option.value &&
                      "border-brand-900 bg-sage-100 text-brand-900",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="filter-min-length">
                Minimum length (mm)
              </FieldLabel>
              <Input
                id="filter-min-length"
                type="number"
                min="1"
                inputMode="numeric"
                value={minLength}
                onChange={(event) => setMinLength(event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="filter-min-width">
                Minimum width (mm)
              </FieldLabel>
              <Input
                id="filter-min-width"
                type="number"
                min="1"
                inputMode="numeric"
                value={minWidth}
                onChange={(event) => setMinWidth(event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="filter-quantity">
                Minimum quantity (pieces)
              </FieldLabel>
              <Input
                id="filter-quantity"
                type="number"
                min="1"
                inputMode="numeric"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="filter-location">Location area</FieldLabel>
              <Input
                id="filter-location"
                value={region}
                onChange={(event) => setRegion(event.target.value)}
                placeholder="e.g. Setagaya"
              />
            </Field>
          </div>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="text" onClick={reset}>
              Reset
            </Button>
            <Button onClick={apply}>Apply filters</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export { ListingFilterSheet };
