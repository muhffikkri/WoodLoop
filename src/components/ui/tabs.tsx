"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        "border-line flex min-h-12 w-full items-end gap-1 overflow-x-auto border-b",
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "text-ink-600 hover:text-ink-900 data-[state=active]:text-brand-900 data-[state=active]:border-brand-900 inline-flex min-h-12 shrink-0 items-center justify-center border-b-2 border-transparent px-4 text-sm font-semibold disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content className={cn("pt-5", className)} {...props} />;
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
