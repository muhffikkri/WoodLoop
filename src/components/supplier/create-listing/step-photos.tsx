"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Info,
  Star,
  Trash2,
  Upload,
} from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { StoredPhoto } from "@/domain/types";
import { photoMetadataSchema } from "@/domain/validators";
import { demoPhotoRepository } from "@/services/demo/photo-repository";

const MAX_PHOTOS = 8;
const MAX_BYTES = 10 * 1024 * 1024; // 10MB

export type UploadedPhotoItem = {
  id: string;
  src: string;
  alt: string;
  size: number;
};

export function StepPhotos({
  photos,
  onPhotosChange,
  onNext,
  supplierId,
  onSaveDraftBeforeNavigate,
}: {
  photos: UploadedPhotoItem[];
  onPhotosChange: (photos: UploadedPhotoItem[]) => void;
  onNext: () => void;
  supplierId: string;
  onSaveDraftBeforeNavigate: () => Promise<void>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);

    const availableSlots = MAX_PHOTOS - photos.length;
    if (availableSlots <= 0) {
      setError(`You can upload at most ${MAX_PHOTOS} photos per batch.`);
      return;
    }

    const filesToProcess = Array.from(files).slice(0, availableSlots);
    if (files.length > availableSlots) {
      setError(`Only the first ${availableSlots} photos were added (max ${MAX_PHOTOS}).`);
    }

    setIsProcessing(true);
    const addedPhotos: UploadedPhotoItem[] = [];

    try {
      for (const file of filesToProcess) {
        // Validate MIME type and size
        const validation = photoMetadataSchema.safeParse({
          type: file.type,
          size: file.size,
        });

        if (!validation.success) {
          if (file.size > MAX_BYTES) {
            setError(`"${file.name}" exceeds the 10 MB limit.`);
          } else {
            setError(
              `"${file.name}" has an unsupported format. Please use JPEG, PNG, or WebP.`,
            );
          }
          continue;
        }

        // Store in IndexedDB
        const stored = await demoPhotoRepository.save({
          ownerId: supplierId,
          blob: file,
          mimeType: file.type as StoredPhoto["mimeType"],
          size: file.size,
          altText: `Wood offcut photo: ${file.name.replace(/\.[^/.]+$/, "")}`,
          position: photos.length + addedPhotos.length,
        });

        const url = demoPhotoRepository.ensureObjectUrl(stored);
        addedPhotos.push({
          id: stored.id,
          src: url,
          alt: stored.altText,
          size: stored.size,
        });
      }

      if (addedPhotos.length > 0) {
        onPhotosChange([...photos, ...addedPhotos]);
      }
    } catch {
      setError("Failed to save photos to device storage. Please try again.");
    } finally {
      setIsProcessing(false);
      // Reset input value so same files can be re-selected if removed
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (cameraInputRef.current) cameraInputRef.current.value = "";
    }
  }

  function handleRemove(index: number) {
    const photoToRemove = photos[index];
    if (photoToRemove) {
      void demoPhotoRepository.remove(photoToRemove.id, supplierId);
    }
    const next = photos.filter((_, i) => i !== index);
    onPhotosChange(next);
    if (next.length === 0) {
      setError("At least 1 photo is required to continue.");
    }
  }

  function handleMakeCover(index: number) {
    if (index === 0) return;
    const item = photos[index];
    if (!item) return;
    const remaining = photos.filter((_, i) => i !== index);
    onPhotosChange([item, ...remaining]);
  }

  function handleMove(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= photos.length) return;
    const next = [...photos];
    const current = next[index];
    const target = next[targetIndex];
    if (!current || !target) return;
    next[index] = target;
    next[targetIndex] = current;
    onPhotosChange(next);
  }

  function handleContinue() {
    if (photos.length === 0) {
      setError("At least 1 photo of your wood offcuts is required.");
      return;
    }
    setError(null);
    onNext();
  }

  return (
    <div className="space-y-6">
      <div className="border-line bg-surface rounded-lg border p-5 sm:p-6">
        <h2 className="font-heading text-xl font-semibold text-ink-900">
          Upload batch photos
        </h2>
        <p className="text-ink-600 mt-2 text-sm leading-6">
          Start with clear photos of your offcuts. Place a ruler or tape measure
          in the frame if possible so buyers can gauge scale accurately.
        </p>

        <div className="bg-sage-100 border-line mt-4 flex items-start gap-3 rounded-md border p-3.5 text-xs sm:text-sm text-ink-900">
          <Info aria-hidden="true" className="text-brand-900 mt-0.5 size-4 shrink-0" />
          <div>
            <span className="font-semibold">Scope guardrail:</span> Only clean
            solid wood offcuts from furniture and woodworking production. No
            treated, painted, or demolition lumber.
          </div>
        </div>

        {/* Hidden inputs */}
        <input
          ref={fileInputRef}
          type="file"
          id="photo-file-input"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="sr-only"
          onChange={(e) => void handleFiles(e.target.files)}
          tabIndex={-1}
        />
        <input
          ref={cameraInputRef}
          type="file"
          id="photo-camera-input"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          className="sr-only"
          onChange={(e) => void handleFiles(e.target.files)}
          tabIndex={-1}
        />

        {/* Upload Action Zone */}
        <div className="border-line mt-6 rounded-lg border-2 border-dashed p-6 text-center sm:p-8">
          <Upload aria-hidden="true" className="text-timber-600 mx-auto size-8" />
          <h3 className="font-heading text-ink-900 mt-3 text-base font-semibold">
            Add 1 to {MAX_PHOTOS} photos
          </h3>
          <p className="text-ink-600 mt-1 text-xs sm:text-sm">
            JPEG, PNG, or WebP up to 10 MB each. First photo will be the cover.
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing || photos.length >= MAX_PHOTOS}
            >
              <Upload aria-hidden="true" className="mr-2 size-4" />
              Choose photos
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => cameraInputRef.current?.click()}
              disabled={isProcessing || photos.length >= MAX_PHOTOS}
            >
              <Camera aria-hidden="true" className="mr-2 size-4" />
              Take photo
            </Button>
            <Button
              asChild
              variant="secondary"
              className="text-xs sm:text-sm"
            >
              <Link
                href="/app/guidance?returnTo=/app/listings/new"
                onClick={() => void onSaveDraftBeforeNavigate()}
              >
                Photo tips
              </Link>
            </Button>
          </div>
        </div>

        {error ? (
          <Alert variant="error" className="mt-4">
            {error}
          </Alert>
        ) : null}

        {/* Photos Grid */}
        {photos.length > 0 ? (
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-sm font-semibold text-ink-900">
                Uploaded photos ({photos.length}/{MAX_PHOTOS})
              </h3>
              <span className="text-ink-600 text-xs">
                Photos are stored locally on this device
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {photos.map((item, index) => {
                const isCover = index === 0;
                return (
                  <div
                    key={item.id}
                    className="border-line bg-surface relative flex flex-col overflow-hidden rounded-md border"
                  >
                    <div className="relative aspect-4/3 w-full bg-sage-100">
                      <Image
                        src={item.src}
                        alt={item.alt}
                        fill
                        sizes="(min-width: 768px) 25vw, 50vw"
                        className="object-cover"
                        unoptimized={item.src.startsWith("blob:")}
                      />
                      {isCover ? (
                        <div className="absolute top-2 left-2">
                          <Badge variant="available" className="text-[11px]">
                            <Star aria-hidden="true" className="mr-1 size-3 fill-current" />
                            Cover
                          </Badge>
                        </div>
                      ) : null}
                    </div>

                    <div className="flex items-center justify-between p-2 text-xs">
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          className="size-8"
                          onClick={() => handleMove(index, -1)}
                          disabled={index === 0}
                          aria-label={`Move photo ${index + 1} left`}
                        >
                          <ChevronLeft className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          className="size-8"
                          onClick={() => handleMove(index, 1)}
                          disabled={index === photos.length - 1}
                          aria-label={`Move photo ${index + 1} right`}
                        >
                          <ChevronRight className="size-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-1">
                        {!isCover ? (
                          <Button
                            type="button"
                            variant="secondary"
                            className="h-8 px-2 text-[11px]"
                            onClick={() => handleMakeCover(index)}
                            aria-label={`Make photo ${index + 1} cover photo`}
                          >
                            Set cover
                          </Button>
                        ) : null}
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="size-8"
                          onClick={() => handleRemove(index)}
                          aria-label={`Remove photo ${index + 1}`}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-2">
        <Button asChild variant="secondary">
          <Link href="/app/supplier">Cancel</Link>
        </Button>
        <Button
          type="button"
          onClick={handleContinue}
          disabled={photos.length === 0}
        >
          Continue to Details
        </Button>
      </div>
    </div>
  );
}
