import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { RouteGuard } from "@/components/auth/route-guard";

export default function SupplierLayout({ children }: { children: ReactNode }) {
  return (
    <RouteGuard workspace="supplying">
      <AppShell workspace="supplying">{children}</AppShell>
    </RouteGuard>
  );
}
