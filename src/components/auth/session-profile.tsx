"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, LogOut, MonitorSmartphone } from "lucide-react";

import { RouteGuard } from "@/components/auth/route-guard";
import { useSession } from "@/components/auth/session-provider";
import { AppHeader } from "@/components/layout/app-header";
import { AppShell } from "@/components/layout/app-shell";
import { PageContainer } from "@/components/layout/page-container";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function ProfileContent() {
  const router = useRouter();
  const session = useSession();
  const [pending, setPending] = React.useState<string | null>(null);
  const user = session.user!;

  async function changeWorkspace(workspace: "buying" | "supplying") {
    setPending(workspace);
    await session.setWorkspace(workspace);
    router.replace(workspace === "buying" ? "/app/buyer" : "/app/supplier");
  }

  async function changeProfile(userId: string) {
    setPending(userId);
    const nextUser = await session.loginDemo(userId);
    router.replace(
      nextUser.activeWorkspace === "buying" ? "/app/buyer" : "/app/supplier",
    );
  }

  async function logout() {
    setPending("logout");
    await session.logout();
    window.location.replace("/login");
  }

  return (
    <AppShell workspace={user.activeWorkspace}>
      <AppHeader title="Demo profile" description="Session and workspace" />
      <main className="py-8 lg:py-12">
        <PageContainer size="content">
          <div className="grid gap-5">
            <section className="border-line bg-surface rounded-lg border p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-ink-600 text-sm">Signed in locally as</p>
                  <h1 className="font-heading mt-1 text-2xl font-semibold">
                    {user.displayName}
                  </h1>
                  <p className="text-ink-600 mt-1 break-all text-sm">
                    {user.email}
                  </p>
                </div>
                <Badge variant="demo">Demo</Badge>
              </div>
              <Alert className="mt-6">
                <MonitorSmartphone
                  aria-hidden="true"
                  className="mr-2 inline size-4"
                />
                This session exists only in this browser. Logging out does not
                delete demo marketplace data.
              </Alert>
            </section>

            {user.role === "both" ? (
              <section className="border-line bg-surface rounded-lg border p-6 sm:p-8">
                <ArrowLeftRight
                  aria-hidden="true"
                  className="text-timber-600 size-6"
                />
                <h2 className="font-heading mt-4 text-xl font-semibold">
                  Switch workspace
                </h2>
                <p className="text-ink-600 mt-2 text-sm leading-6">
                  The same local profile keeps its data while navigation
                  changes.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Button
                    variant={
                      user.activeWorkspace === "buying"
                        ? "primary"
                        : "secondary"
                    }
                    loading={pending === "buying"}
                    disabled={Boolean(pending)}
                    onClick={() => void changeWorkspace("buying")}
                  >
                    Buying
                  </Button>
                  <Button
                    variant={
                      user.activeWorkspace === "supplying"
                        ? "primary"
                        : "secondary"
                    }
                    loading={pending === "supplying"}
                    disabled={Boolean(pending)}
                    onClick={() => void changeWorkspace("supplying")}
                  >
                    Supplying
                  </Button>
                </div>
              </section>
            ) : null}

            <section className="border-line bg-surface rounded-lg border p-6 sm:p-8">
              <h2 className="font-heading text-xl font-semibold">
                Change demo identity
              </h2>
              <p className="text-ink-600 mt-2 text-sm leading-6">
                Use a seeded identity to test role-specific navigation on this
                device.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <Button
                  variant="secondary"
                  loading={pending === "demo-buyer"}
                  disabled={Boolean(pending)}
                  onClick={() => void changeProfile("demo-buyer")}
                >
                  Demo Buyer
                </Button>
                <Button
                  variant="secondary"
                  loading={pending === "demo-supplier"}
                  disabled={Boolean(pending)}
                  onClick={() => void changeProfile("demo-supplier")}
                >
                  Demo Supplier
                </Button>
                <Button
                  variant="secondary"
                  loading={pending === "demo-both"}
                  disabled={Boolean(pending)}
                  onClick={() => void changeProfile("demo-both")}
                >
                  Demo Both
                </Button>
              </div>
            </section>

            <section className="border-line bg-surface rounded-lg border p-6 sm:p-8">
              <h2 className="font-heading text-xl font-semibold">
                End local session
              </h2>
              <p className="text-ink-600 mt-2 text-sm leading-6">
                This removes only the active session. It does not reset future
                listings or requests.
              </p>
              <Button
                variant="secondary"
                className="mt-5"
                loading={pending === "logout"}
                disabled={Boolean(pending)}
                onClick={() => void logout()}
              >
                <LogOut aria-hidden="true" />
                Log out
              </Button>
            </section>
          </div>
        </PageContainer>
      </main>
    </AppShell>
  );
}

function SessionProfile() {
  return (
    <RouteGuard>
      <ProfileContent />
    </RouteGuard>
  );
}

export { SessionProfile };
