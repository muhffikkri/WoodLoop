import type { Metadata } from "next";

import { SessionProfile } from "@/components/auth/session-profile";

export const metadata: Metadata = { title: "Demo profile" };

export default function ProfilePage() {
  return <SessionProfile />;
}
