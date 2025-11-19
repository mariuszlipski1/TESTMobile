// Types - Aplikacja Remontowa

// Enum dla typów sekcji
export type SectionType =
  | 'plan'
  | 'electrical'
  | 'plumbing'
  | 'carpentry'
  | 'finishing'
  | 'costs';

// Status sekcji
export type SectionStatus = 'not_started' | 'in_progress' | 'completed';

// Typ rynku nieruchomości
export type MarketType = 'primary' | 'secondary';

// Projekt
export interface Project {
  id: string;
  userId: string;
  name: string;
  address: string;
  area: number;
  floor: number;
  hasElevator: boolean;
  marketType: MarketType;
  budgetPlanned: number;
  budgetSpent: number;
  createdAt: string;
  updatedAt: string;
}

// Sekcja projektu
export interface Section {
  id: string;
  projectId: string;
  type: SectionType;
  status: SectionStatus;
  notes: string;
  updatedAt: string;
}

// Media attachment
export interface MediaAttachment {
  id: string;
  type: 'image' | 'audio' | 'video' | 'document';
  url: string;
  thumbnailUrl?: string;
  mimeType: string;
  size: number;
  name: string;
  createdAt: string;
}

// Notatka multi-modalna
export interface Note {
  id: string;
  sectionId: string;
  projectId: string;
  content: string;
  media: MediaAttachment[];
  audioTranscript?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// Pozycja wyceny
export interface EstimateItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  category?: string;
}

// Wycena
export interface Estimate {
  id: string;
  sectionId: string;
  projectId: string;
  contractorName: string;
  fileUrl: string;
  totalAmount: number;
  items: EstimateItem[];
  isAccepted: boolean;
  createdAt: string;
  updatedAt: string;
}

// Wydatek
export interface Expense {
  id: string;
  sectionId: string;
  projectId: string;
  description: string;
  amount: number;
  date: string;
  receiptUrl?: string;
  createdAt: string;
}

// Sugestia AI
export interface AISuggestion {
  id: string;
  projectId: string;
  suggestionText: string;
  context: Record<string, unknown>;
  shownAt: string;
  dismissed: boolean;
}

// Checklista inspekcji - punkt
export interface InspectionChecklistItem {
  id: string;
  category: 'hydraulika' | 'elektryka' | 'konstrukcja' | 'stolarka' | 'wentylacja' | 'inne';
  task: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  completedAt?: string;
  notes?: string;
  photoIds?: string[];
}

// Pełna checklista inspekcji
export interface InspectionChecklist {
  items: InspectionChecklistItem[];
  generatedAt: string;
  completedCount: number;
  totalCount: number;
}

// Zdjęcie inspekcyjne
export interface InspectionPhoto {
  id: string;
  projectId: string;
  photoUrl: string;
  thumbnailUrl?: string;
  checklistItemId?: string;
  createdAt: string;
}

// Dane właściwości (do AI generacji checklisty)
export interface PropertyData {
  area: number;
  year: number;
  floor: number;
  hasElevator: boolean;
  hasParking: boolean;
  marketType: MarketType;
}

// Rozszerzone dane projektu z inspekcją
export interface ProjectWithInspection extends Project {
  yearBuilt?: number;
  hasParking?: boolean;
  floorPlanUrl?: string;
  inspectionChecklist?: InspectionChecklist;
  checklistProgress: number;
}

// Legacy ChecklistItem for backwards compatibility
export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  category?: string;
}

// Request/Response types
export interface CreateNoteRequest {
  sectionId: string;
  projectId: string;
  content: string;
  tags?: string[];
}

export interface UpdateNoteRequest {
  content?: string;
  tags?: string[];
}

export interface CreateEstimateRequest {
  sectionId: string;
  projectId: string;
  contractorName: string;
  totalAmount: number;
}

export interface CreateExpenseRequest {
  sectionId: string;
  projectId: string;
  description: string;
  amount: number;
  date: string;
}

// Navigation types
export type RootStackParamList = {
  Main: undefined;
  NoteDetail: { noteId: string; sectionId: string };
  NoteEditor: { noteId?: string; sectionId: string; projectId: string };
  EstimateDetail: { estimateId: string };
  ProjectSettings: { projectId: string };
};

export type MainTabParamList = {
  Dashboard: undefined;
  Plan: { projectId: string };
  Electrical: { projectId: string };
  Plumbing: { projectId: string };
  Carpentry: { projectId: string };
  Finishing: { projectId: string };
  Costs: { projectId: string };
};

// Store types
export interface NotesState {
  notes: Record<string, Note[]>; // key = sectionId
  loading: boolean;
  error: string | null;
}

export interface ProjectState {
  currentProject: Project | null;
  sections: Section[];
  loading: boolean;
  error: string | null;
}

export interface UIState {
  isOffline: boolean;
  pendingSyncCount: number;
  theme: 'light' | 'dark';
}

// Filter/Sort types
export interface NotesFilter {
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  hasMedia?: boolean;
}

export type SortOrder = 'asc' | 'desc';

export interface NotesSort {
  field: 'createdAt' | 'updatedAt';
  order: SortOrder;
}

// API Response wrapper
export interface ApiResponse<T> {
  data: T;
  error: string | null;
  status: number;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Offline sync
export interface SyncQueueItem {
  id: string;
  action: 'create' | 'update' | 'delete';
  entity: 'note' | 'estimate' | 'expense';
  data: unknown;
  timestamp: number;
  retries: number;
}
