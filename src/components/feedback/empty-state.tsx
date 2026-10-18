import * as React from "react";
import { PackageOpen, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: LucideIcon;
  className?: string;
};

function EmptyState({
  title,
  description,
  action,
  icon: Icon = PackageOpen,
  className,
}: EmptyStateProps) {
  return (
    <section
      className={cn(
        "border-line bg-surface flex flex-col items-start rounded-lg border p-6 sm:p-8",
        className,
      )}
      aria-labelledby="empty-state-title"
    >
      <span className="bg-sage-100 text-brand-900 grid size-11 place-items-center rounded-md">
        <Icon aria-hidden="true" className="size-5" strokeWidth={1.8} />
      </span>
      <h2
        id="empty-state-title"
        className="font-heading mt-5 text-xl font-semibold"
      >
        {title}
      </h2>
      <p className="text-ink-600 mt-2 max-w-md text-sm leading-6">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </section>
  );
}

export { EmptyState };
