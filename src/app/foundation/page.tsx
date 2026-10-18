import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight, Search } from "lucide-react";

import { EmptyState } from "@/components/feedback/empty-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { AppHeader } from "@/components/layout/app-header";
import { AppLogo } from "@/components/layout/app-logo";
import { PageContainer } from "@/components/layout/page-container";
import { PhotoGallery } from "@/components/materials/photo-gallery";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export const metadata: Metadata = {
  title: "Foundation review",
  robots: { index: false, follow: false },
};

const galleryPhotos = [
  {
    id: "boards",
    src: "/images/demo/boards-offcuts-demo.webp",
    alt: "Demo sample of clean solid-wood board offcuts arranged on a workshop bench.",
  },
  {
    id: "strips",
    src: "/images/demo/strip-offcuts-demo.webp",
    alt: "Demo sample of sorted narrow solid-wood strip offcuts.",
  },
  {
    id: "blocks",
    src: "/images/demo/block-offcuts-demo.webp",
    alt: "Demo sample of reusable solid-wood block offcuts arranged by size.",
  },
];

export default function FoundationPage() {
  return (
    <main className="pb-16">
      <AppHeader
        title="Foundation review"
        description="Internal milestone 0 reference"
      />
      <PageContainer className="pt-8 sm:pt-10">
        <section className="grid gap-4 border-b pb-8 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <AppLogo href={null} />
            <h1 className="font-heading mt-6 max-w-2xl text-[2rem] leading-[1.12] font-semibold tracking-[-0.025em] sm:text-[2.375rem]">
              Eco-industrial foundations for a trustworthy material marketplace.
            </h1>
            <p className="text-ink-600 mt-4 max-w-2xl leading-7">
              This internal route validates tokens, components, imagery, and
              responsive behavior. It is not the WoodLoop landing page.
            </p>
          </div>
          <Badge variant="demo">Foundation only</Badge>
        </section>

        <section className="grid gap-6 py-8 lg:grid-cols-2 lg:py-12">
          <PhotoGallery photos={galleryPhotos} />
          <div className="grid content-start gap-5">
            <div className="flex flex-wrap gap-2">
              <Badge>Available</Badge>
              <Badge variant="reserved">Reserved</Badge>
              <Badge variant="unverified">Not verified</Badge>
              <Badge variant="demo">Demo listing</Badge>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Solid wood board offcuts</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-5">
                <Field>
                  <FieldLabel htmlFor="foundation-search">
                    Search materials
                  </FieldLabel>
                  <div className="relative">
                    <Search
                      aria-hidden="true"
                      className="text-ink-600 pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2"
                    />
                    <Input
                      id="foundation-search"
                      className="pl-12"
                      placeholder="What material does your project need?"
                    />
                  </div>
                  <FieldDescription>
                    Input labels and guidance remain visible and readable.
                  </FieldDescription>
                </Field>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button>
                    Primary action <ArrowRight aria-hidden="true" />
                  </Button>
                  <Button variant="secondary">Secondary action</Button>
                </div>
              </CardContent>
            </Card>
            <Alert variant="warning">
              AI suggestions do not verify wood species, strength, treatment, or
              safety.
            </Alert>
          </div>
        </section>

        <section className="grid gap-5 border-t pt-8 lg:grid-cols-2">
          <EmptyState
            title="No matching offcuts yet"
            description="Try adjusting dimensions or location."
            action={<Button variant="secondary">Clear filters</Button>}
          />
          <LoadingState rows={2} />
        </section>

        <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {galleryPhotos
            .concat({
              id: "guidance",
              src: "/images/demo/ruler-guidance-demo.webp",
              alt: "Demo photo guidance sample showing wood offcuts beside a metric ruler.",
            })
            .map((photo) => (
              <div
                key={photo.id}
                className="relative aspect-4/3 overflow-hidden rounded-md"
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="25vw"
                  className="object-cover"
                />
              </div>
            ))}
        </section>
      </PageContainer>
    </main>
  );
}
