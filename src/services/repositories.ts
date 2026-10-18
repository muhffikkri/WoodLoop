import type {
  ActiveWorkspace,
  AISuggestion,
  Listing,
  ListingDraft,
  ListingFilters,
  ListingPatch,
  ListingSort,
  ListingStatus,
  MaterialRequest,
  NewListingInput,
  NewRequestInput,
  RequestMessage,
  RequestStatus,
  StoredPhoto,
  Role,
  User,
} from "@/domain/types";

export interface ListingRepository {
  list(filters?: ListingFilters, sort?: ListingSort): Promise<Listing[]>;
  getById(id: string): Promise<Listing | null>;
  listBySupplier(supplierId: string): Promise<Listing[]>;
  create(data: NewListingInput, actorId: string): Promise<Listing>;
  update(id: string, patch: ListingPatch, actorId: string): Promise<Listing>;
  setAvailability(
    id: string,
    status: ListingStatus,
    actorId: string,
  ): Promise<void>;
}

export interface RequestRepository {
  listForUser(
    userId: string,
    direction: "incoming" | "sent",
  ): Promise<MaterialRequest[]>;
  create(input: NewRequestInput, actorId: string): Promise<MaterialRequest>;
  getById(id: string): Promise<MaterialRequest | null>;
  transition(
    id: string,
    next: RequestStatus,
    actorId: string,
    options?: { agreedQuantity?: number; reason?: string },
  ): Promise<MaterialRequest>;
  addMessage(
    id: string,
    text: string,
    actorId: string,
  ): Promise<RequestMessage>;
}

export interface PhotoRepository {
  getById(id: string): Promise<StoredPhoto | null>;
  listByIds(ids: string[]): Promise<StoredPhoto[]>;
  save(photo: Omit<StoredPhoto, "id" | "createdAt">): Promise<StoredPhoto>;
  remove(id: string, actorId: string): Promise<void>;
}

export interface DraftRepository {
  getById(id: string, actorId: string): Promise<ListingDraft | null>;
  save(draft: ListingDraft, actorId: string): Promise<ListingDraft>;
  remove(id: string, actorId: string): Promise<void>;
}

export interface AiAnalysisService {
  analyzePhotos(photoIds: string[]): Promise<AISuggestion>;
}

export interface SessionService {
  getCurrentUser(): Promise<User | null>;
  getUserById(userId: string): Promise<User | null>;
  loginDemo(userId: string): Promise<User>;
  loginWithDemoCredentials(email: string, password: string): Promise<User>;
  createLocalProfile(input: {
    displayName: string;
    email: string;
    role: Role;
    activeWorkspace: ActiveWorkspace;
  }): Promise<User>;
  logout(): Promise<void>;
  setWorkspace(workspace: ActiveWorkspace): Promise<void>;
}

export interface DemoDataService {
  seedIfEmpty(): Promise<void>;
  reset(): Promise<void>;
}

export type WoodLoopRepositories = {
  listings: ListingRepository;
  requests: RequestRepository;
  photos: PhotoRepository;
  drafts: DraftRepository;
  session: SessionService;
  demoData: DemoDataService;
  ai: AiAnalysisService;
};
