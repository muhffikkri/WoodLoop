import Link from "next/link";
import { InstallButton } from "@/components/install/install-button";
import { AppLogo } from "@/components/layout/app-logo";
import { PageContainer } from "@/components/layout/page-container";
export function MarketingHeader() {
  return (
    <header className="border-line bg-canvas/95 sticky top-0 z-20 border-b backdrop-blur-sm">
      <PageContainer
        size="marketing"
        className="flex min-h-16 items-center justify-between gap-3"
      >
        <AppLogo />
        <nav
          aria-label="Public navigation"
          className="flex items-center gap-1 sm:gap-3"
        >
          <Link
            className="hidden min-h-11 items-center px-2 text-sm font-semibold text-ink-600 hover:text-brand-900 md:inline-flex"
            href="/app/materials"
          >
            Explore materials
          </Link>
          <Link
            className="hidden min-h-11 items-center px-2 text-sm font-semibold text-ink-600 hover:text-brand-900 md:inline-flex"
            href="#how-it-works"
          >
            How it works
          </Link>
          <Link
            className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-brand-900 hover:text-brand-700"
            href="/login"
          >
            Log in
          </Link>
          <div className="hidden sm:block">
            <InstallButton />
          </div>
        </nav>
      </PageContainer>
    </header>
  );
}
