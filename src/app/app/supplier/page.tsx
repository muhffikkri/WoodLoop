import type { Metadata } from "next";

import { SupplierHome } from "@/components/supplier/supplier-home";

export const metadata: Metadata = { title: "Supplier home" };

export default function SupplierHomePage() {
  return <SupplierHome />;
}
