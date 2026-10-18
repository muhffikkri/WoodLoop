import { AppLogo } from "@/components/layout/app-logo";
import { PageContainer } from "@/components/layout/page-container";

export default function Home() {
  return (
    <main className="flex min-h-svh items-center py-12">
      <PageContainer size="content">
        <div className="border-line bg-surface rounded-lg border p-6 sm:p-8">
          <AppLogo />
          <p className="text-ink-600 mt-8 max-w-xl text-sm leading-6">
            Project foundation is ready. The public landing experience belongs
            to the next milestone and has not been implemented yet.
          </p>
        </div>
      </PageContainer>
    </main>
  );
}
