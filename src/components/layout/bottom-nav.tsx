"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { ActiveWorkspace } from "@/domain/types";
import { cn } from "@/lib/utils";
import {
  activeNavigationHref,
  navigationByWorkspace,
} from "@/components/layout/navigation";

function BottomNav({ workspace }: { workspace: ActiveWorkspace }) {
  const pathname = usePathname();
  const items = navigationByWorkspace[workspace];

  return (
    <nav
      aria-label={`${workspace === "buying" ? "Buyer" : "Supplier"} navigation`}
      className="border-line bg-surface safe-bottom fixed inset-x-0 bottom-0 z-40 border-t lg:hidden"
    >
      <div className="mx-auto grid min-h-18 max-w-xl grid-flow-col auto-cols-fr px-1">
        {items.map(({ href, icon: Icon, label, prominent }) => {
          const active = activeNavigationHref(items, pathname) === href;

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "text-ink-600 relative flex min-h-16 min-w-0 flex-col items-center justify-center gap-1 rounded-sm px-1 text-[0.6875rem] font-semibold",
                active && "text-brand-900",
                prominent && "text-brand-900",
              )}
            >
              <span
                className={cn(
                  "grid size-8 place-items-center rounded-full",
                  prominent && "bg-brand-900 text-white",
                )}
              >
                <Icon aria-hidden="true" className="size-5" strokeWidth={1.9} />
              </span>
              <span className="max-w-full truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export { BottomNav };
