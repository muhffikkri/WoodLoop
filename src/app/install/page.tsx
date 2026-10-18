import Link from "next/link";
import { AppLogo } from "@/components/layout/app-logo";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
export default function InstallPage() {
  return (
    <main className="min-h-svh py-8 sm:py-12">
      <PageContainer size="content">
        <AppLogo />
        <section className="border-line bg-surface mt-8 rounded-lg border p-6 sm:p-8">
          <p className="text-timber-600 text-sm font-semibold">
            WoodLoop installation
          </p>
          <h1 className="font-heading mt-2 text-3xl font-bold tracking-[-0.03em]">
            Install from your browser
          </h1>
          <p className="text-ink-600 mt-4 leading-7">
            Installation is offered by your browser when it supports this site.
            If no browser prompt appeared, use its add-to-home-screen option.
          </p>
          <ol className="text-ink-600 mt-6 list-decimal space-y-3 pl-5 leading-7">
            <li>
              On iPhone or iPad, open the Share menu and choose{" "}
              <strong className="text-ink-900">Add to Home Screen</strong>.
            </li>
            <li>
              On desktop Safari, use{" "}
              <strong className="text-ink-900">File → Add to Dock</strong> when
              available.
            </li>
            <li>
              On other browsers, look for Install, Add to Home screen, or Create
              shortcut in the browser menu.
            </li>
          </ol>
          <p className="text-ink-600 mt-6 text-sm">
            Quick access on your home screen. No app store needed on supported
            devices.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/app">Continue in browser</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/">Back to home</Link>
            </Button>
          </div>
        </section>
      </PageContainer>
    </main>
  );
}
