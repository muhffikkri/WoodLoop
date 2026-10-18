export type Role = "buyer" | "supplier" | "both";
export type ActiveWorkspace = "buying" | "supplying";
export type WoodForm = "board" | "strip" | "block" | "other";
export type VisibleCondition =
  "apparently_intact" | "crack" | "hole" | "stain" | "edge_damage" | "unclear";
export type ListingStatus = "draft" | "active" | "reserved" | "unavailable";
export type RequestStatus =
  "new" | "awaiting_supplier_confirmation" | "agreed" | "completed" | "closed";
export type SourceType = "supplier_declared" | "ai_suggestion" | "unknown";
export type QuantityUnit = "pieces" | "sets";
export type TreatmentDeclaration = "untreated" | "treated" | "unsure";
export type FulfillmentMethod = "pickup" | "delivery_to_discuss";
export type ReservationState = "none" | "held" | "released" | "consumed";

export type User = {
  id: string;
  displayName: string;
  email: string;
  role: Role;
  activeWorkspace: ActiveWorkspace;
  organizationName?: string;
  isDemo: boolean;
};

export type DimensionsMm = {
  length?: number | null;
  width?: number | null;
  thickness?: number | null;
  notes?: string;
  approximate: boolean;
};

export type AISuggestion = {
  id: string;
  modelId?: string;
  status: "demo_example" | "pending" | "completed" | "failed" | "not_connected";
  suggestedForm?: WoodForm;
  visibleConditions: VisibleCondition[];
  confidence?: number | null;
  explanation?: string;
  reviewedBySupplier: boolean;
  reviewedAt?: string;
};

export type Listing = {
  id: string;
  supplierId: string;
  title: string;
  description?: string;
  woodForm: WoodForm;
  dimensions: DimensionsMm;
  quantityTotal: number;
  quantityAvailable: number;
  unit: QuantityUnit;
  sourceProcess: string;
  region: string;
  pickupDetails?: string;
  availableFrom?: string;
  visibleConditionNotes?: string;
  declaredSpecies?: string | null;
  declaredTreatment?: TreatmentDeclaration | null;
  status: ListingStatus;
  stockCheckedAt?: string;
  photoIds: string[];
  aiSuggestion?: AISuggestion;
  createdAt: string;
  updatedAt: string;
  isDemo: boolean;
};

export type RequestHistoryEvent = {
  status: RequestStatus;
  at: string;
  byUserId: string;
  reason?: string;
};

export type MaterialRequest = {
  id: string;
  listingId: string;
  buyerId: string;
  supplierId: string;
  requestedQuantity: number;
  unit: QuantityUnit;
  message: string;
  fulfillmentMethod: FulfillmentMethod;
  status: RequestStatus;
  agreedQuantity?: number;
  reservedQuantity?: number;
  reservationState?: ReservationState;
  agreedPriceJpy?: number | null;
  createdAt: string;
  updatedAt: string;
  history: RequestHistoryEvent[];
};

export type RequestMessage = {
  id: string;
  requestId: string;
  senderId: string;
  body: string;
  createdAt: string;
};

export type StoredPhoto = {
  id: string;
  ownerId: string;
  listingId?: string;
  draftId?: string;
  blob: Blob;
  mimeType: "image/jpeg" | "image/png" | "image/webp";
  size: number;
  altText: string;
  position: number;
  createdAt: string;
};

export type ListingDraft = {
  id: string;
  supplierId: string;
  values: Partial<NewListingInput>;
  photoIds: string[];
  currentStep: "photos" | "details" | "review";
  updatedAt: string;
  schemaVersion: number;
};

export type ListingFilters = {
  query?: string;
  forms?: WoodForm[];
  minLengthMm?: number;
  minWidthMm?: number;
  minThicknessMm?: number;
  minimumQuantity?: number;
  quantityUnit?: QuantityUnit;
  region?: string;
  statuses?: ListingStatus[];
  requireMeasuredDimensions?: boolean;
};

export type ListingSort =
  "recent" | "quantity_desc" | "quantity_asc" | "best_match";

export type NewListingInput = Omit<
  Listing,
  | "id"
  | "supplierId"
  | "quantityAvailable"
  | "status"
  | "createdAt"
  | "updatedAt"
  | "isDemo"
> & {
  status?: Extract<ListingStatus, "draft" | "active">;
};

export type ListingPatch = Partial<
  Omit<Listing, "id" | "supplierId" | "createdAt" | "isDemo">
>;

export type NewRequestInput = Pick<
  MaterialRequest,
  "listingId" | "requestedQuantity" | "unit" | "message" | "fulfillmentMethod"
>;
