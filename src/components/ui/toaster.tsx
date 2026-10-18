"use client";

import { Toaster as Sonner } from "sonner";

function Toaster() {
  return (
    <Sonner
      position="bottom-center"
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "!border-line !bg-surface !text-ink-900 !rounded-md !shadow-lg",
          description: "!text-ink-600",
          actionButton: "!bg-brand-900 !text-white",
          cancelButton: "!bg-sage-100 !text-brand-900",
        },
      }}
    />
  );
}

export { Toaster };
