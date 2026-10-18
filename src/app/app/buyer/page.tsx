import type { Metadata } from "next";

import { BuyerHome } from "@/components/buyer/buyer-home";

export const metadata: Metadata = { title: "Buyer home" };

export default function BuyerHomePage() {
  return <BuyerHome />;
}
