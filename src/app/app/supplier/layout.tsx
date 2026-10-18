import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";

export default function SupplierLayout({ children }: { children: ReactNode }) {
  return <AppShell workspace="supplying">{children}</AppShell>;
}
