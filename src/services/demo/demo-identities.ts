import type { User } from "@/domain/types";

export const DEMO_PASSWORD = "WoodLoopDemo1!";

export const DEMO_USERS: readonly User[] = [
  {
    id: "demo-buyer",
    displayName: "Demo Buyer",
    email: "buyer@demo.woodloop.app",
    role: "buyer",
    activeWorkspace: "buying",
    organizationName: "Sample maker profile",
    isDemo: true,
  },
  {
    id: "demo-supplier",
    displayName: "Demo Supplier",
    email: "supplier@demo.woodloop.app",
    role: "supplier",
    activeWorkspace: "supplying",
    organizationName: "Sample workshop profile",
    isDemo: true,
  },
  {
    id: "demo-both",
    displayName: "Demo Buyer & Supplier",
    email: "both@demo.woodloop.app",
    role: "both",
    activeWorkspace: "buying",
    organizationName: "Sample dual-role profile",
    isDemo: true,
  },
] as const;

export function isSeedDemoUser(userId: string) {
  return DEMO_USERS.some((user) => user.id === userId);
}
