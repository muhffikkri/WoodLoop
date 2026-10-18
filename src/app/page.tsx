import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Search, Upload } from "lucide-react";

import { InstallButton } from "@/components/install/install-button";
import { PageContainer } from "@/components/layout/page-container";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { Button } from "@/components/ui/button";

const steps = [
  [
    "01",
    "Photograph",
    "Capture the offcut and its useful details in a few clear photos.",
  ],
  [
    "02",
    "Review",
    "Suppliers confirm material details before a listing is shared.",
  ],
  [
    "03",
    "Match",
    "Makers review the information and confirm suitability before pickup.",
  ],
] as const;

export default function Home() {
  return (
    <>
      <MarketingHeader />
      <main>
        <section className="py-10 sm:py-14 lg:py-18">
          <PageContainer size="marketing">
            <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
              <div className="max-w-2xl">
                <p className="text-timber-600 text-sm font-semibold">
                  A better path for production offcuts
                </p>
                <h1 className="font-heading mt-3 text-[2.15rem] leading-[1.12] font-bold tracking-[-0.045em] text-ink-900 min-[390px]:text-[2.35rem] md:text-5xl">
                  Give production wood offcuts another life.
                </h1>
                <p className="text-ink-600 mt-5 max-w-xl text-base leading-7 md:text-lg">
                  A simpler way for workshops to list reusable offcuts—and for
                  makers to find material that fits.
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <InstallButton fullWidth className="sm:w-auto" size="large" />
                  <Button
                    asChild
                    fullWidth
                    variant="secondary"
                    size="large"
                    className="sm:w-auto"
                  >
                    <Link href="/app/materials">
                      Explore materials <Search aria-hidden="true" />
                    </Link>
                  </Button>
                </div>
                <Link
                  href="/login?intent=supplier&returnTo=%2Fapp%2Flistings%2Fnew"
                  className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-900 underline underline-offset-4 hover:text-brand-700"
                >
                  List your offcuts{" "}
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
                <p className="text-ink-600 mt-5 text-sm">
                  Quick access on your home screen. No app store needed on
                  supported devices.
                </p>
              </div>
              <figure className="border-line bg-surface overflow-hidden rounded-lg border">
                <Image
                  src="/images/demo/boards-offcuts-demo.webp"
                  alt="Sorted production wood offcuts on a clean workshop bench"
                  width={1200}
                  height={900}
                  priority
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="aspect-[4/3] w-full object-cover"
                />
                <figcaption className="text-ink-600 border-line border-t px-4 py-3 text-xs">
                  Demo image: sorted boards, strips, and blocks for material
                  reference.
                </figcaption>
              </figure>
            </div>
          </PageContainer>
        </section>
        <section
          id="how-it-works"
          className="border-line border-y bg-surface py-12 sm:py-16"
        >
          <PageContainer size="marketing">
            <div className="max-w-2xl">
              <p className="text-timber-600 text-sm font-semibold">
                How it works
              </p>
              <h2 className="font-heading mt-2 text-3xl font-bold tracking-[-0.035em]">
                A clear handoff from workshop to maker.
              </h2>
            </div>
            <ol className="mt-8 grid gap-4 md:grid-cols-3">
              {steps.map(([number, title, description]) => (
                <li key={title} className="border-line rounded-md border p-5">
                  <span className="text-timber-600 text-sm font-bold">
                    {number}
                  </span>
                  <h3 className="font-heading mt-6 text-xl font-bold">
                    {title}
                  </h3>
                  <p className="text-ink-600 mt-2 text-sm leading-6">
                    {description}
                  </p>
                </li>
              ))}
            </ol>
          </PageContainer>
        </section>
        <section className="py-12 sm:py-16">
          <PageContainer size="marketing">
            <div className="grid gap-4 md:grid-cols-2">
              <article className="border-line bg-surface rounded-lg border p-6 sm:p-8">
                <Upload aria-hidden="true" className="text-timber-600 size-6" />
                <p className="text-timber-600 mt-6 text-sm font-semibold">
                  For workshops
                </p>
                <h2 className="font-heading mt-2 text-2xl font-bold tracking-[-0.03em]">
                  Give usable offcuts a visible next step.
                </h2>
                <p className="text-ink-600 mt-3 leading-7">
                  Document material you can offer, then let makers review the
                  details before arranging pickup.
                </p>
                <Link
                  className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-900 underline underline-offset-4"
                  href="/login?intent=supplier&returnTo=%2Fapp%2Flistings%2Fnew"
                >
                  List your offcuts{" "}
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </article>
              <article className="border-line bg-surface rounded-lg border p-6 sm:p-8">
                <Search aria-hidden="true" className="text-timber-600 size-6" />
                <p className="text-timber-600 mt-6 text-sm font-semibold">
                  For makers
                </p>
                <h2 className="font-heading mt-2 text-2xl font-bold tracking-[-0.03em]">
                  Start with material that fits the job.
                </h2>
                <p className="text-ink-600 mt-3 leading-7">
                  Browse supplier-confirmed material details and ask the right
                  questions before pickup.
                </p>
                <Link
                  className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-900 underline underline-offset-4"
                  href="/app/materials"
                >
                  Explore materials{" "}
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </article>
            </div>
            <p className="text-ink-600 border-line mt-10 border-l-2 pl-4 text-sm leading-6">
              Material details are provided by suppliers. Buyers confirm
              suitability before pickup.
            </p>
          </PageContainer>
        </section>
      </main>
      <footer className="border-line border-t py-8">
        <PageContainer
          size="marketing"
          className="flex flex-col gap-4 text-sm text-ink-600 sm:flex-row sm:items-center sm:justify-between"
        >
          <p>
            WoodLoop AI demo — no live supplier inventory or account service is
            connected.
          </p>
          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap gap-x-4 gap-y-2"
          >
            <Link href="#how-it-works">How it works</Link>
            <Link href="/app/materials">Explore</Link>
            <Link href="/install">Install guidance</Link>
          </nav>
        </PageContainer>
      </footer>
    </>
  );
}
