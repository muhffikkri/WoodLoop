import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";

export default function BuyerLayout({ children }: { children: ReactNode }) {
  return <AppShell workspace="buying">{children}</AppShell>;
}
