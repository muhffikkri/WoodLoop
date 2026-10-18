import Link from "next/link";
import { MessageSquareText } from "lucide-react";

import { RouteGuard } from "@/components/auth/route-guard";
import { EmptyState } from "@/components/feedback/empty-state";
import { AppHeader } from "@/components/layout/app-header";
import { AppShell } from "@/components/layout/app-shell";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";

export default function RequestsDependencyPage() {
  return (
    <RouteGuard workspace="buying">
      <AppShell workspace="buying">
        <AppHeader title="Requests" />
        <main className="py-8 lg:py-12">
          <PageContainer size="content">
            <EmptyState
              icon={MessageSquareText}
              title="Requests are not available yet"
              description="Request coordination begins after the listing and material-detail workflow is completed. No request has been created here."
              action={
                <Button asChild>
                  <Link href="/app/materials">Browse materials</Link>
                </Button>
              }
            />
          </PageContainer>
        </main>
      </AppShell>
    </RouteGuard>
  );
}
