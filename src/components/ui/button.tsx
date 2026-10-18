import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { LoaderCircle } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-md px-5 text-sm font-semibold transition-colors duration-150 select-none focus-visible:ring-0 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-brand-900 text-white hover:bg-brand-700 active:bg-brand-900",
        secondary:
          "border-line bg-surface text-brand-900 border hover:bg-sage-100 active:bg-info-bg",
        text: "text-brand-900 hover:bg-sage-100 px-3",
        destructive: "bg-danger text-white hover:bg-[#963129] active:bg-danger",
      },
      size: {
        default: "min-h-12",
        large: "min-h-13 px-6 text-base",
        icon: "h-12 min-h-12 w-12 px-0",
      },
      fullWidth: {
        true: "w-full",
        false: null,
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      fullWidth: false,
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingLabel?: string;
}

function Button({
  className,
  variant,
  size,
  fullWidth,
  asChild = false,
  loading = false,
  loadingLabel = "Working…",
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot : "button";

  if (asChild) {
    return (
      <Slot
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        aria-disabled={disabled || loading || undefined}
        aria-busy={loading || undefined}
        {...props}
      >
        {children}
      </Slot>
    );
  }

  return (
    <Component
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      disabled={disabled || loading}
      aria-disabled={disabled || loading || undefined}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <>
          <LoaderCircle aria-hidden="true" className="animate-spin" />
          <span>{loadingLabel}</span>
        </>
      ) : (
        children
      )}
    </Component>
  );
}

export { Button, buttonVariants };
