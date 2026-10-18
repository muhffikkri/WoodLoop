import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { listingPhoto } from "@/services/demo/demo-listings";

export const metadata: Metadata = { title: "Photo tips" };

const tips = [
  "Place offcuts beside a metric ruler so size is visible.",
  "Use daylight or even light; avoid shadows over edges.",
  "Show visible cracks, holes, stains or edge damage.",
  "Photograph the batch together, then one close-up piece.",
];

export default function GuidancePage() {
  const photo = listingPhoto("ruler");
  return (
    <>
      <AppHeader title="Photo tips" backHref="/app/supplier" />
      <main className="py-6 lg:py-10">
        <PageContainer size="content">
          <div className="bg-sage-100 relative aspect-4/3 overflow-hidden rounded-lg">
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(min-width: 768px) 42rem, 100vw"
              className="object-cover"
            />
          </div>
          <ul className="mt-6 grid gap-3">
            {tips.map((tip) => (
              <li
                key={tip}
                className="border-line bg-surface rounded-md border p-4 text-sm leading-6"
              >
                {tip}
              </li>
            ))}
          </ul>
          <p className="text-ink-600 mt-5 text-sm leading-6">
            Photos do not verify wood species, grade or treatment. State only
            what you know.
          </p>
          <Button asChild className="mt-6">
            <Link href="/app/listings/new">Add wood offcut</Link>
          </Button>
        </PageContainer>
      </main>
    </>
  );
}
