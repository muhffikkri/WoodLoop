import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";

import { cn } from "@/lib/utils";

function Field({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("grid gap-2", className)} {...props} />;
}

function FieldLabel({
  className,
  required,
  children,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root> & { required?: boolean }) {
  return (
    <LabelPrimitive.Root
      className={cn("text-ink-900 text-sm font-semibold", className)}
      {...props}
    >
      {children}
      {required ? (
        <span className="text-danger ml-1" aria-hidden="true">
          *
        </span>
      ) : null}
    </LabelPrimitive.Root>
  );
}

function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p className={cn("text-ink-600 text-sm leading-5", className)} {...props} />
  );
}

function FieldError({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      role="alert"
      className={cn("text-danger text-sm font-medium", className)}
      {...props}
    />
  );
}

export { Field, FieldDescription, FieldError, FieldLabel };
