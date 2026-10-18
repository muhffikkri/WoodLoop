import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

import { AppLogo } from "@/components/layout/app-logo";

function AuthFrame({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-svh lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(28rem,0.82fr)]">
      <section className="flex min-h-svh flex-col px-4 py-5 min-[360px]:px-5 sm:px-8 lg:px-12 lg:py-8">
        <div className="flex items-center justify-between gap-4">
          <AppLogo />
          <Link
            href="/"
            className="text-ink-600 hover:text-brand-900 inline-flex min-h-11 items-center gap-2 text-sm font-semibold"
          >
            <ArrowLeft aria-hidden="true" className="size-4" /> Home
          </Link>
        </div>
        <div className="mx-auto flex w-full max-w-[31rem] flex-1 items-center py-10 lg:py-14">
          {children}
        </div>
      </section>
      <aside className="border-line bg-surface relative hidden min-h-svh overflow-hidden border-l lg:block">
        <Image
          src="/images/demo/boards-offcuts-demo.webp"
          alt="Sorted production wood offcuts on a workshop bench"
          fill
          priority
          sizes="42vw"
          className="object-cover"
        />
        <div className="border-line bg-surface absolute right-8 bottom-8 left-8 rounded-lg border p-5">
          <p className="font-heading text-lg font-semibold">
            A local, functional product demo
          </p>
          <p className="text-ink-600 mt-2 text-sm leading-6">
            Profiles and marketplace state stay in this browser. No production
            account service is connected.
          </p>
        </div>
      </aside>
    </main>
  );
}

export { AuthFrame };

function AuthFormFallback() {
  return (
    <div
      className="grid w-full gap-4"
      aria-busy="true"
      aria-label="Loading account options"
    >
      <div className="bg-sage-100 h-5 w-28 animate-pulse rounded-sm" />
      <div className="bg-sage-100 h-10 w-3/4 animate-pulse rounded-sm" />
      <div className="bg-sage-100 h-20 w-full animate-pulse rounded-md" />
      <div className="bg-sage-100 h-12 w-full animate-pulse rounded-md" />
      <div className="bg-sage-100 h-12 w-full animate-pulse rounded-md" />
    </div>
  );
}

export { AuthFormFallback };
