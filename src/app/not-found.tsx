import Link from "next/link";

import { EmptyState } from "@/components/feedback/empty-state";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-svh items-center py-12">
      <PageContainer size="content">
        <EmptyState
          title="Page not found"
          description="The page may have moved or the address may be incomplete."
          action={
            <Button asChild>
              <Link href="/">Back to WoodLoop</Link>
            </Button>
          }
        />
      </PageContainer>
    </main>
  );
}
