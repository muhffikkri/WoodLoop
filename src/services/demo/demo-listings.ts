import type { Listing } from "@/domain/types";

const seededAt = "2026-10-18T08:00:00.000Z";

export const DEMO_LISTINGS: readonly Listing[] = [
  {
    id: "demo-board-01",
    supplierId: "demo-supplier",
    title: "Wide board offcuts · sample batch",
    description:
      "Clean offcuts from cabinet panel trimming. Measure each board again for your finished cut plan.",
    woodForm: "board",
    dimensions: { length: 720, width: 180, thickness: 20, approximate: false },
    quantityTotal: 12,
    quantityAvailable: 12,
    unit: "pieces",
    sourceProcess: "Cabinet panel trimming",
    region: "Setagaya, Tokyo",
    visibleConditionNotes:
      "Stored indoors; some trimmed edges show minor marks.",
    declaredSpecies: "Oak",
    declaredTreatment: "untreated",
    status: "active",
    stockCheckedAt: seededAt,
    photoIds: ["boards"],
    createdAt: "2026-10-17T09:00:00.000Z",
    updatedAt: "2026-10-17T09:00:00.000Z",
    isDemo: true,
  },
  {
    id: "demo-strip-01",
    supplierId: "demo-supplier",
    title: "Narrow strip offcuts · sample batch",
    description:
      "Long, clean strips from frame-component production. Suitable dimensions depend on your own cut plan.",
    woodForm: "strip",
    dimensions: { length: 900, width: 42, thickness: 18, approximate: false },
    quantityTotal: 24,
    quantityAvailable: 24,
    unit: "pieces",
    sourceProcess: "Frame component trimming",
    region: "Koto, Tokyo",
    visibleConditionNotes: "Supplier notes a few short pieces in the batch.",
    declaredSpecies: null,
    declaredTreatment: "unsure",
    status: "active",
    stockCheckedAt: seededAt,
    photoIds: ["strips"],
    createdAt: "2026-10-16T11:30:00.000Z",
    updatedAt: "2026-10-16T11:30:00.000Z",
    isDemo: true,
  },
  {
    id: "demo-block-01",
    supplierId: "demo-both",
    title: "Solid wood blocks · sample batch",
    description:
      "Small reusable blocks from joinery production; confirm useful dimensions with the supplier.",
    woodForm: "block",
    dimensions: { length: 160, width: 85, thickness: 45, approximate: true },
    quantityTotal: 18,
    quantityAvailable: 18,
    unit: "pieces",
    sourceProcess: "Joinery component cutting",
    region: "Shinagawa, Tokyo",
    visibleConditionNotes:
      "Mixed grain and colour variation across the sample batch.",
    declaredSpecies: "Beech",
    declaredTreatment: "untreated",
    status: "active",
    stockCheckedAt: seededAt,
    photoIds: ["blocks"],
    createdAt: "2026-10-15T08:15:00.000Z",
    updatedAt: "2026-10-15T08:15:00.000Z",
    isDemo: true,
  },
  {
    id: "demo-board-02",
    supplierId: "demo-both",
    title: "Short board ends · sample batch",
    description:
      "Board ends from clean furniture production, kept together as one sample batch.",
    woodForm: "board",
    dimensions: { length: 360, width: 140, thickness: 20, approximate: false },
    quantityTotal: 8,
    quantityAvailable: 5,
    unit: "pieces",
    sourceProcess: "Tabletop panel finishing",
    region: "Meguro, Tokyo",
    visibleConditionNotes:
      "One visible edge mark in the sample photo; inspect before pickup.",
    declaredSpecies: null,
    declaredTreatment: "unsure",
    status: "active",
    stockCheckedAt: seededAt,
    photoIds: ["ruler"],
    createdAt: "2026-10-14T13:45:00.000Z",
    updatedAt: "2026-10-14T13:45:00.000Z",
    isDemo: true,
  },
  {
    id: "demo-strip-02",
    supplierId: "demo-supplier",
    title: "Reserved trim strips · sample batch",
    description: "A sample batch currently held for another local request.",
    woodForm: "strip",
    dimensions: { length: 650, width: 35, thickness: 15, approximate: false },
    quantityTotal: 10,
    quantityAvailable: 2,
    unit: "pieces",
    sourceProcess: "Cabinet trim cutting",
    region: "Setagaya, Tokyo",
    declaredSpecies: null,
    declaredTreatment: "untreated",
    status: "reserved",
    stockCheckedAt: seededAt,
    photoIds: ["strips"],
    createdAt: "2026-10-13T10:00:00.000Z",
    updatedAt: "2026-10-13T10:00:00.000Z",
    isDemo: true,
  },
  {
    id: "demo-block-02",
    supplierId: "demo-both",
    title: "Unavailable component blocks · sample batch",
    description:
      "This sample batch is retained to demonstrate unavailable stock handling.",
    woodForm: "block",
    dimensions: { length: 100, width: 60, thickness: 30, approximate: false },
    quantityTotal: 6,
    quantityAvailable: 0,
    unit: "pieces",
    sourceProcess: "Component offcut sorting",
    region: "Koto, Tokyo",
    declaredSpecies: null,
    declaredTreatment: "unsure",
    status: "unavailable",
    stockCheckedAt: seededAt,
    photoIds: ["blocks"],
    createdAt: "2026-10-12T10:00:00.000Z",
    updatedAt: "2026-10-12T10:00:00.000Z",
    isDemo: true,
  },
] as const;

const photoSources = {
  boards: {
    src: "/images/demo/boards-offcuts-demo.webp",
    alt: "Sorted solid-wood board offcuts on a clean workshop bench",
  },
  strips: {
    src: "/images/demo/strip-offcuts-demo.webp",
    alt: "Narrow solid-wood strip offcuts arranged on a workshop table",
  },
  blocks: {
    src: "/images/demo/block-offcuts-demo.webp",
    alt: "Reusable solid-wood blocks arranged by size on a clean table",
  },
  ruler: {
    src: "/images/demo/ruler-guidance-demo.webp",
    alt: "Production wood offcut beside a metric ruler with a visible edge mark",
  },
} as const;

export function listingPhoto(photoId: string) {
  return (
    photoSources[photoId as keyof typeof photoSources] ?? photoSources.boards
  );
}
