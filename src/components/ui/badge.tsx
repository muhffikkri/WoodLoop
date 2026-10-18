import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex min-h-6 w-fit items-center rounded-sm border px-2 py-0.5 text-xs font-semibold",
  {
    variants: {
      variant: {
        available: "border-brand-900/20 bg-sage-100 text-brand-900",
        reserved: "border-warning-text/20 bg-warning-bg text-warning-text",
        unavailable: "border-line bg-canvas text-ink-600",
        demo: "border-line bg-info-bg text-ink-900",
        unverified: "border-warning-text/20 bg-warning-bg text-warning-text",
        danger: "border-danger/20 bg-danger-bg text-danger",
      },
    },
    defaultVariants: { variant: "available" },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
