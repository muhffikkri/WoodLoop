import Link from "next/link";
import type { ReactNode } from "react";
import { AppLogo } from "@/components/layout/app-logo";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
export function AvailabilityPage({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <main className="flex min-h-svh items-center py-12">
      <PageContainer size="content">
        <div className="border-line bg-surface rounded-lg border p-6 sm:p-8">
          <AppLogo />
          <h1 className="font-heading mt-8 text-3xl font-bold tracking-[-0.03em] text-ink-900">
            {title}
          </h1>
          <div className="text-ink-600 mt-4 max-w-xl leading-7">{children}</div>
          <Button asChild className="mt-8">
            <Link href="/">Back to WoodLoop</Link>
          </Button>
        </div>
      </PageContainer>
    </main>
  );
}
