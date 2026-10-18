export const en = {
  brand: {
    name: "WoodLoop AI",
  },
  common: {
    retry: "Try again",
    back: "Back",
    close: "Close",
    demoMode: "Demo mode · Data is saved on this device only.",
  },
  listing: {
    supplierConfirmed: "Supplier confirmed",
    aiSuggestion: "AI visual suggestion",
    notVerified: "Not verified",
    demoLabel: "Demo listing",
  },
  errors: {
    genericTitle: "We couldn't load this content",
    genericDescription: "Try again. Your saved demo data has not been removed.",
  },
} as const;

export type TranslationDictionary = typeof en;
