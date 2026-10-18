"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type GalleryPhoto = {
  id: string;
  src: string;
  alt: string;
};

function PhotoGallery({
  photos,
  className,
}: {
  photos: GalleryPhoto[];
  className?: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = photos[activeIndex];

  if (!active) {
    return (
      <div
        className={cn(
          "bg-sage-100 text-ink-600 grid aspect-4/3 place-items-center rounded-lg text-sm",
          className,
        )}
      >
        No photo provided
      </div>
    );
  }

  const showPrevious = () =>
    setActiveIndex((current) => (current - 1 + photos.length) % photos.length);
  const showNext = () =>
    setActiveIndex((current) => (current + 1) % photos.length);

  return (
    <div className={cn("grid gap-3", className)}>
      <div className="bg-sage-100 relative aspect-4/3 overflow-hidden rounded-lg">
        <Image
          key={active.id}
          src={active.src}
          alt={active.alt}
          fill
          priority={activeIndex === 0}
          sizes="(min-width: 1024px) 56vw, 100vw"
          className="object-cover"
          unoptimized={active.src.startsWith("blob:")}
        />
        {photos.length > 1 ? (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-1/2 left-3 -translate-y-1/2 bg-white/95"
              onClick={showPrevious}
              aria-label="Show previous photo"
            >
              <ChevronLeft aria-hidden="true" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-1/2 right-3 -translate-y-1/2 bg-white/95"
              onClick={showNext}
              aria-label="Show next photo"
            >
              <ChevronRight aria-hidden="true" />
            </Button>
          </>
        ) : null}
      </div>
      {photos.length > 1 ? (
        <div
          className="grid grid-cols-4 gap-2 sm:grid-cols-6"
          aria-label="Photo thumbnails"
        >
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show photo ${index + 1} of ${photos.length}`}
              aria-current={index === activeIndex ? "true" : undefined}
              className={cn(
                "border-line relative aspect-4/3 min-h-11 overflow-hidden rounded-sm border-2",
                index === activeIndex && "border-brand-900",
              )}
            >
              <Image
                src={photo.src}
                alt=""
                fill
                sizes="120px"
                className="object-cover"
                unoptimized={photo.src.startsWith("blob:")}
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export { PhotoGallery };
