"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;

function SheetContent({
  className,
  children,
  side = "bottom",
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  side?: "bottom" | "right";
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40" />
      <DialogPrimitive.Content
        className={cn(
          "border-line bg-surface fixed z-50 overflow-y-auto border p-5 shadow-xl sm:p-6",
          side === "bottom" &&
            "safe-bottom inset-x-0 bottom-0 max-h-[90svh] rounded-t-xl border-x-0 border-b-0",
          side === "right" &&
            "inset-y-0 right-0 h-full w-[min(26rem,calc(100%-2rem))] border-y-0 border-r-0",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="text-ink-600 hover:bg-sage-100 absolute top-3 right-3 inline-flex size-11 items-center justify-center rounded-md">
          <X aria-hidden="true" className="size-5" />
          <span className="sr-only">Close panel</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

const SheetHeader = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div className={cn("grid gap-2 pr-10", className)} {...props} />
);
const SheetTitle = ({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) => (
  <DialogPrimitive.Title
    className={cn("font-heading text-xl font-semibold", className)}
    {...props}
  />
);
const SheetDescription = ({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) => (
  <DialogPrimitive.Description
    className={cn("text-ink-600 text-sm leading-6", className)}
    {...props}
  />
);

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
};
