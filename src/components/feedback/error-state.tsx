"use client";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function ErrorState({
  title = "We couldn't load this content",
  description = "Try again. Your saved demo data has not been removed.",
  onRetry,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <section
      role="alert"
      className={cn(
        "border-danger/20 bg-danger-bg rounded-lg border p-5",
        className,
      )}
    >
      <div className="flex gap-3">
        <AlertTriangle
          aria-hidden="true"
          className="text-danger mt-0.5 size-5 shrink-0"
        />
        <div>
          <h2 className="font-heading text-base font-semibold">{title}</h2>
          <p className="text-ink-600 mt-1 text-sm leading-6">{description}</p>
          {onRetry ? (
            <Button variant="secondary" className="mt-4" onClick={onRetry}>
              Try again
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export { ErrorState };
