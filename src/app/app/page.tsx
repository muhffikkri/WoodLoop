import { AppLogo } from "@/components/layout/app-logo";
import { PageContainer } from "@/components/layout/page-container";

export default function AppEntryFoundation() {
  return (
    <main className="flex min-h-svh items-center py-12">
      <PageContainer size="content">
        <div className="border-line bg-surface rounded-lg border p-6 sm:p-8">
          <AppLogo />
          <h1 className="font-heading mt-8 text-2xl font-semibold">
            Application foundation
          </h1>
          <p className="text-ink-600 mt-3 leading-7">
            Role-aware session routing and demo data begin in Milestone 2. This
            route exists now so the documented PWA start URL resolves safely.
          </p>
        </div>
      </PageContainer>
    </main>
  );
}
