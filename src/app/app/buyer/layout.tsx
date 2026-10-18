import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { RouteGuard } from "@/components/auth/route-guard";

export default function BuyerLayout({ children }: { children: ReactNode }) {
  return (
    <RouteGuard workspace="buying">
      <AppShell workspace="buying">{children}</AppShell>
    </RouteGuard>
  );
}
