"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type WizardStep = "photos" | "details" | "review" | "publish";

const STEPS: { id: WizardStep; label: string; number: number }[] = [
  { id: "photos", label: "Photos", number: 1 },
  { id: "details", label: "Details", number: 2 },
  { id: "review", label: "Review", number: 3 },
  { id: "publish", label: "Publish", number: 4 },
];

export function WizardProgress({
  currentStep,
  onStepClick,
}: {
  currentStep: WizardStep;
  onStepClick?: (step: WizardStep) => void;
}) {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <nav
      aria-label="Listing creation progress"
      className="border-line bg-surface rounded-lg border p-4 sm:p-5"
    >
      {/* Mobile progress indicator */}
      <div className="flex items-center justify-between sm:hidden">
        <div>
          <span className="text-brand-900 text-xs font-semibold uppercase tracking-wider">
            Step {currentIndex + 1} of {STEPS.length}
          </span>
          <p className="font-heading text-ink-900 text-base font-semibold">
            {STEPS[currentIndex]?.label}
          </p>
        </div>
        <div className="bg-sage-100 h-2 w-28 overflow-hidden rounded-full">
          <div
            className="bg-brand-900 h-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop progress steps */}
      <ol className="hidden items-center justify-between sm:flex sm:gap-4">
        {STEPS.map((step, index) => {
          const isDone = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isClickable = Boolean(onStepClick && index < currentIndex);

          return (
            <li
              key={step.id}
              className={cn(
                "flex flex-1 items-center gap-3",
                index < STEPS.length - 1 &&
                  "after:bg-line after:h-[2px] after:flex-1 after:content-['']",
              )}
            >
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => onStepClick?.(step.id)}
                className={cn(
                  "flex items-center gap-2.5 rounded-md text-left transition-colors",
                  isClickable && "cursor-pointer hover:opacity-80",
                  !isClickable && "cursor-default",
                )}
                aria-current={isCurrent ? "step" : undefined}
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
                    isDone && "bg-brand-900 text-white",
                    isCurrent &&
                      "border-brand-900 text-brand-900 bg-surface border-2",
                    !isDone && !isCurrent && "bg-sage-100 text-ink-600",
                  )}
                >
                  {isDone ? (
                    <Check aria-hidden="true" className="size-4 stroke-[3]" />
                  ) : (
                    step.number
                  )}
                </span>
                <span
                  className={cn(
                    "text-sm font-semibold",
                    isCurrent && "text-brand-900",
                    isDone && "text-ink-900",
                    !isDone && !isCurrent && "text-ink-600",
                  )}
                >
                  {step.label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
