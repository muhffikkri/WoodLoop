import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "border-line bg-surface text-ink-900 placeholder:text-ink-600/75 min-h-12 w-full rounded-md border px-4 py-3 text-base transition-colors duration-150 disabled:cursor-not-allowed disabled:bg-sage-100 disabled:opacity-70 aria-invalid:border-danger aria-invalid:bg-danger-bg sm:text-sm",
        className,
      )}
      {...props}
    />
  );
}

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "border-line bg-surface text-ink-900 placeholder:text-ink-600/75 min-h-28 w-full resize-y rounded-md border px-4 py-3 text-base transition-colors duration-150 disabled:cursor-not-allowed disabled:bg-sage-100 disabled:opacity-70 aria-invalid:border-danger aria-invalid:bg-danger-bg sm:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Input, Textarea };
