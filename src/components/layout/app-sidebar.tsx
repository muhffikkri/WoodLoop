"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { AppLogo } from "@/components/layout/app-logo";
import {
  activeNavigationHref,
  navigationByWorkspace,
} from "@/components/layout/navigation";
import type { ActiveWorkspace } from "@/domain/types";
import { cn } from "@/lib/utils";

function AppSidebar({ workspace }: { workspace: ActiveWorkspace }) {
  const pathname = usePathname();

  return (
    <aside className="border-line bg-surface fixed inset-y-0 left-0 z-40 hidden w-60 border-r lg:flex lg:flex-col">
      <div className="flex min-h-20 items-center px-6">
        <AppLogo />
      </div>
      <nav className="grid gap-1 px-3" aria-label="Application navigation">
        {navigationByWorkspace[workspace].map(({ href, icon: Icon, label }) => {
          const active =
            activeNavigationHref(navigationByWorkspace[workspace], pathname) ===
            href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "text-ink-600 hover:bg-sage-100 hover:text-ink-900 flex min-h-12 items-center gap-3 rounded-md px-3 text-sm font-semibold",
                active && "bg-sage-100 text-brand-900",
              )}
            >
              <Icon aria-hidden="true" className="size-5" strokeWidth={1.9} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="text-ink-600 mt-auto px-6 py-5 text-xs leading-5">
        Demo mode · Data stays on this device.
      </div>
    </aside>
  );
}

export { AppSidebar };
