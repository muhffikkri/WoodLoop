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
import type { ListingFilters, QuantityUnit, WoodForm } from "@/domain/types";
import { cn } from "@/lib/utils";

const forms: Array<{ value: WoodForm; label: string }> = [
  { value: "board", label: "Board" },
  { value: "strip", label: "Strip" },
  { value: "block", label: "Block" },
  { value: "other", label: "Other" },
];

function numberOrUndefined(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

type ListingFilterFormProps = {
  initialFilters?: ListingFilters;
  onApply: (filters: ListingFilters) => void;
  idPrefix?: string;
};

/** Shared filter fields used by the mobile sheet and the desktop sidebar. */
function ListingFilterForm({
  initialFilters = {},
  onApply,
  idPrefix = "filter",
}: ListingFilterFormProps) {
  const [selectedForms, setSelectedForms] = React.useState<WoodForm[]>(
    initialFilters.forms ?? [],
  );
  const [minLength, setMinLength] = React.useState(
    initialFilters.minLengthMm?.toString() ?? "",
  );
  const [minWidth, setMinWidth] = React.useState(
    initialFilters.minWidthMm?.toString() ?? "",
  );
  const [minThickness, setMinThickness] = React.useState(
    initialFilters.minThicknessMm?.toString() ?? "",
  );
  const [quantity, setQuantity] = React.useState(
    initialFilters.minimumQuantity?.toString() ?? "",
  );
  const [unit, setUnit] = React.useState<QuantityUnit>(
    initialFilters.quantityUnit ?? "pieces",
  );
  const [region, setRegion] = React.useState(initialFilters.region ?? "");

  function toggleForm(value: WoodForm) {
    setSelectedForms((current) =>
      current.includes(value)
        ? current.filter((form) => form !== value)
        : [...current, value],
    );
  }

  function reset() {
    setSelectedForms([]);
    setMinLength("");
    setMinWidth("");
    setMinThickness("");
    setQuantity("");
    setUnit("pieces");
    setRegion("");
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const minimumQuantity = numberOrUndefined(quantity);
    onApply({
      forms: selectedForms.length ? selectedForms : undefined,
      minLengthMm: numberOrUndefined(minLength),
      minWidthMm: numberOrUndefined(minWidth),
      minThicknessMm: numberOrUndefined(minThickness),
      minimumQuantity,
      quantityUnit: minimumQuantity ? unit : undefined,
      region: region.trim() || undefined,
    });
  }

  return (
    <form className="grid gap-5" onSubmit={submit} noValidate>
      <fieldset>
        <legend className="text-ink-900 text-sm font-semibold">Form</legend>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {forms.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => toggleForm(option.value)}
              aria-pressed={selectedForms.includes(option.value)}
              className={cn(
                "border-line text-ink-600 min-h-11 rounded-md border px-3 text-sm font-semibold",
                selectedForms.includes(option.value) &&
                  "border-brand-900 bg-sage-100 text-brand-900",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <Field>
          <FieldLabel htmlFor={`${idPrefix}-min-length`}>
            Minimum length (mm)
          </FieldLabel>
          <Input
            id={`${idPrefix}-min-length`}
            type="number"
            min="1"
            inputMode="numeric"
            value={minLength}
            onChange={(event) => setMinLength(event.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={`${idPrefix}-min-width`}>
            Minimum width (mm)
          </FieldLabel>
          <Input
            id={`${idPrefix}-min-width`}
            type="number"
            min="1"
            inputMode="numeric"
            value={minWidth}
            onChange={(event) => setMinWidth(event.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={`${idPrefix}-min-thickness`}>
            Minimum thickness (mm)
          </FieldLabel>
          <Input
            id={`${idPrefix}-min-thickness`}
            type="number"
            min="1"
            inputMode="numeric"
            value={minThickness}
            onChange={(event) => setMinThickness(event.target.value)}
          />
        </Field>
        <div className="grid grid-cols-[1fr_auto] items-end gap-2">
          <Field>
            <FieldLabel htmlFor={`${idPrefix}-quantity`}>
              Minimum quantity
            </FieldLabel>
            <Input
              id={`${idPrefix}-quantity`}
              type="number"
              min="1"
              inputMode="numeric"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
            />
          </Field>
          <div>
            <label className="sr-only" htmlFor={`${idPrefix}-unit`}>
              Quantity unit
            </label>
            <select
              id={`${idPrefix}-unit`}
              value={unit}
              onChange={(event) => setUnit(event.target.value as QuantityUnit)}
              className="border-line bg-surface min-h-12 rounded-md border px-3 text-sm"
            >
              <option value="pieces">pieces</option>
              <option value="sets">sets</option>
            </select>
          </div>
        </div>
        <Field className="sm:col-span-2 lg:col-span-1">
          <FieldLabel htmlFor={`${idPrefix}-location`}>Location area</FieldLabel>
          <Input
            id={`${idPrefix}-location`}
            value={region}
            onChange={(event) => setRegion(event.target.value)}
            placeholder="e.g. Setagaya"
          />
        </Field>
      </div>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end lg:flex-col-reverse">
        <Button type="button" variant="text" onClick={reset}>
          Reset
        </Button>
        <Button type="submit">Apply filters</Button>
      </div>
    </form>
  );
}

type ListingFilterSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialFilters?: ListingFilters;
  onApply: (filters: ListingFilters) => void;
};

function ListingFilterSheet({
  open,
  onOpenChange,
  initialFilters = {},
  onApply,
}: ListingFilterSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="mx-auto max-w-2xl">
        <SheetHeader>
          <SheetTitle>Filter available offcuts</SheetTitle>
          <SheetDescription>
            Use supplier-declared details to narrow the local sample catalog.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          <ListingFilterForm
            initialFilters={initialFilters}
            idPrefix="sheet"
            onApply={(filters) => {
              onApply(filters);
              onOpenChange(false);
            }}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}

export { ListingFilterForm, ListingFilterSheet };
