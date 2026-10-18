import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const alertVariants = cva("rounded-md border p-4 text-sm", {
  variants: {
    variant: {
      info: "border-line bg-info-bg text-ink-900",
      warning: "border-warning-text/20 bg-warning-bg text-warning-text",
      error: "border-danger/20 bg-danger-bg text-danger",
    },
  },
  defaultVariants: { variant: "info" },
});

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Alert, alertVariants };
