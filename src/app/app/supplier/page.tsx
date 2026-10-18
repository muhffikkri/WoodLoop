import type { Metadata } from "next";

import { WorkspaceHome } from "@/components/auth/workspace-home";

export const metadata: Metadata = { title: "Supplier home" };

export default function SupplierHomePage() {
  return <WorkspaceHome workspace="supplying" />;
}
