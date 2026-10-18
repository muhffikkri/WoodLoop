"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { useSession } from "@/components/auth/session-provider";
import type { User } from "@/domain/types";
import { destinationAfterAuth, workspaceForDestination } from "@/services/demo/auth-routing";

function useAuthNavigation(options: { returnTo?: string | null; intent?: string | null }) {
  const router = useRouter();
  const session = useSession();

  return React.useCallback(
    async (user: User) => {
      const destination = destinationAfterAuth(user, options);
      const workspace = workspaceForDestination(destination);
      if (workspace && user.role === "both" && user.activeWorkspace !== workspace) {
        await session.setWorkspace(workspace);
      }
      router.replace(destination);
    },
    [options, router, session],
  );
}

export { useAuthNavigation };
