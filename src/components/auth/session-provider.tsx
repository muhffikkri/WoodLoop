"use client";

import * as React from "react";

import type { ActiveWorkspace, Role, User } from "@/domain/types";
import { demoSessionService } from "@/services/demo/session-service";

type SessionContextValue = {
  user: User | null;
  status: "loading" | "ready" | "error";
  error: string | null;
  loginDemo: (userId: string) => Promise<User>;
  loginWithDemoCredentials: (email: string, password: string) => Promise<User>;
  createLocalProfile: (input: {
    displayName: string;
    email: string;
    role: Role;
    activeWorkspace: ActiveWorkspace;
  }) => Promise<User>;
  logout: () => Promise<void>;
  setWorkspace: (workspace: ActiveWorkspace) => Promise<User>;
  retry: () => Promise<void>;
};

const SessionContext = React.createContext<SessionContextValue | null>(null);

function readableStorageError() {
  return "WoodLoop could not access local demo storage. Check this browser's site-storage settings, then try again.";
}

function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [status, setStatus] =
    React.useState<SessionContextValue["status"]>("loading");
  const [error, setError] = React.useState<string | null>(null);

  const retry = React.useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      setUser(await demoSessionService.getCurrentUser());
      setStatus("ready");
    } catch {
      setError(readableStorageError());
      setStatus("error");
    }
  }, []);

  React.useEffect(() => {
    let active = true;
    void demoSessionService
      .getCurrentUser()
      .then((currentUser) => {
        if (!active) return;
        setUser(currentUser);
        setStatus("ready");
      })
      .catch(() => {
        if (!active) return;
        setError(readableStorageError());
        setStatus("error");
      });
    return () => {
      active = false;
    };
  }, []);

  const value = React.useMemo<SessionContextValue>(
    () => ({
      user,
      status,
      error,
      loginDemo: async (userId) => {
        const nextUser = await demoSessionService.loginDemo(userId);
        setUser(nextUser);
        return nextUser;
      },
      loginWithDemoCredentials: async (email, password) => {
        const nextUser = await demoSessionService.loginWithDemoCredentials(
          email,
          password,
        );
        setUser(nextUser);
        return nextUser;
      },
      createLocalProfile: async (input) => {
        const nextUser = await demoSessionService.createLocalProfile(input);
        setUser(nextUser);
        return nextUser;
      },
      logout: async () => {
        await demoSessionService.logout();
        setUser(null);
      },
      setWorkspace: async (workspace) => {
        await demoSessionService.setWorkspace(workspace);
        const nextUser = await demoSessionService.getCurrentUser();
        if (!nextUser)
          throw new Error("The demo session is no longer available.");
        setUser(nextUser);
        return nextUser;
      },
      retry,
    }),
    [error, retry, status, user],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

function useSession() {
  const context = React.useContext(SessionContext);
  if (!context)
    throw new Error("useSession must be used inside SessionProvider.");
  return context;
}

export { SessionProvider, useSession };
