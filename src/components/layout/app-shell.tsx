import * as React from "react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import type { ActiveWorkspace } from "@/domain/types";

function AppShell({
  workspace,
  children,
}: {
  workspace: ActiveWorkspace;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-svh">
      <AppSidebar workspace={workspace} />
      <div className="page-safe-bottom min-h-svh lg:ml-60">{children}</div>
      <BottomNav workspace={workspace} />
    </div>
  );
}

export { AppShell };
