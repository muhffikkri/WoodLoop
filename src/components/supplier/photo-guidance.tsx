"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Boxes, Ruler, ScanSearch, Sun, TriangleAlert } from "lucide-react";

import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/layout/page-container";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { safeReturnTo } from "@/services/demo/auth-routing";

const WIZARD_PATH = "/app/listings/new";

const checklist = [
  { icon: Sun, text: "Use even, natural light." },
  { icon: Boxes, text: "Show the whole batch." },
  {
    icon: ScanSearch,
    text: "Capture any visible cracks, holes or edge damage.",
  },
  {
    icon: Ruler,
    text: "Place a ruler or known-size reference nearby; enter measurements yourself.",
  },
];

const examples = [
  {
    key: "good",
    label: "Good example",
    badge: "available" as const,
    src: "/images/demo/ruler-guidance-demo.webp",
    alt: "Wood offcut in even light beside a metric ruler, with a visible edge mark in view",
    caption: "Even light, a ruler for scale, and the edge mark left visible.",
  },
  {
    key: "retry",
    label: "Try again",
    badge: "reserved" as const,
    src: "/images/demo/poor-photo-example-demo.jpg",
    alt: "Dim workshop floor with a loose pile of wood offcuts, uneven shadows and no ruler",
    caption: "Dim light, a cluttered floor and no size reference.",
  },
];

function PhotoGuidance() {
  const returnTo = safeReturnTo(useSearchParams().get("returnTo"));
  const startHref = returnTo?.startsWith(WIZARD_PATH) ? returnTo : WIZARD_PATH;
  const skipHref = returnTo ?? "/app/supplier";

  return (
    <>
      <AppHeader title="Photo guidance" backHref={skipHref} />
      <main className="py-6 lg:py-10">
        <PageContainer size="content">
          <h2 className="font-heading text-3xl leading-tight font-semibold tracking-[-0.04em] sm:text-4xl">
            Photograph your offcuts clearly
          </h2>
          <p className="text-ink-600 mt-3 leading-7">
            Good photos help buyers understand your batch.
          </p>

          <ol className="mt-6 grid gap-3" aria-label="Photo checklist">
            {checklist.map(({ icon: Icon, text }, index) => (
              <li
                key={text}
                className="border-line bg-surface flex items-start gap-3 rounded-md border p-4"
              >
                <span className="bg-sage-100 text-brand-900 grid size-9 shrink-0 place-items-center rounded-md">
                  <Icon aria-hidden="true" className="size-5" strokeWidth={1.8} />
                </span>
                <p className="text-sm leading-6">
                  <span className="sr-only">Step {index + 1}: </span>
                  {text}
                </p>
              </li>
            ))}
          </ol>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {examples.map((example) => (
              <figure
                key={example.key}
                className="border-line bg-surface overflow-hidden rounded-lg border"
              >
                <div className="bg-sage-100 relative aspect-4/3">
                  <Image
                    src={example.src}
                    alt={example.alt}
                    fill
                    sizes="(min-width: 640px) 21rem, 100vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="p-4">
                  <Badge variant={example.badge}>{example.label}</Badge>
                  <p className="text-ink-600 mt-2 text-sm leading-6">
                    {example.caption}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>

          <Alert className="mt-8 flex items-start gap-3">
            <TriangleAlert
              aria-hidden="true"
              className="text-timber-600 mt-0.5 size-4 shrink-0"
            />
            <span>
              AI suggestions are visual estimates. Species, structural
              strength, treatment and safety aren&apos;t verified from a photo.
            </span>
          </Alert>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="large">
              <Link href={startHref}>Start listing</Link>
            </Button>
            <Button asChild size="large" variant="secondary">
              <Link href={skipHref}>Skip for now</Link>
            </Button>
          </div>
        </PageContainer>
      </main>
    </>
  );
}

export { PhotoGuidance };
