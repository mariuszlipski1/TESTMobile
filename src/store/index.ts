import { create } from 'zustand';
import {
  Project,
  Section,
  Note,
  Estimate,
  Expense,
  AISuggestion,
  SectionType,
  SyncQueueItem
} from '../types';

// Project Store
interface ProjectStore {
  currentProject: Project | null;
  sections: Section[];
  loading: boolean;
  error: string | null;

  setCurrentProject: (project: Project | null) => void;
  setSections: (sections: Section[]) => void;
  updateSection: (sectionId: string, updates: Partial<Section>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  currentProject: null,
  sections: [],
  loading: false,
  error: null,

  setCurrentProject: (project) => set({ currentProject: project }),
  setSections: (sections) => set({ sections }),
  updateSection: (sectionId, updates) => set((state) => ({
    sections: state.sections.map((s) =>
      s.id === sectionId ? { ...s, ...updates } : s
    ),
  })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));

// Notes Store
interface NotesStore {
  notesBySection: Record<string, Note[]>;
  loading: boolean;
  error: string | null;

  setNotes: (sectionId: string, notes: Note[]) => void;
  addNote: (sectionId: string, note: Note) => void;
  updateNote: (sectionId: string, noteId: string, updates: Partial<Note>) => void;
  deleteNote: (sectionId: string, noteId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useNotesStore = create<NotesStore>((set) => ({
  notesBySection: {},
  loading: false,
  error: null,

  setNotes: (sectionId, notes) => set((state) => ({
    notesBySection: {
      ...state.notesBySection,
      [sectionId]: notes,
    },
  })),

  addNote: (sectionId, note) => set((state) => ({
    notesBySection: {
      ...state.notesBySection,
      [sectionId]: [note, ...(state.notesBySection[sectionId] || [])],
    },
  })),

  updateNote: (sectionId, noteId, updates) => set((state) => ({
    notesBySection: {
      ...state.notesBySection,
      [sectionId]: (state.notesBySection[sectionId] || []).map((n) =>
        n.id === noteId ? { ...n, ...updates } : n
      ),
    },
  })),

  deleteNote: (sectionId, noteId) => set((state) => ({
    notesBySection: {
      ...state.notesBySection,
      [sectionId]: (state.notesBySection[sectionId] || []).filter(
        (n) => n.id !== noteId
      ),
    },
  })),

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));

// Estimates Store
interface EstimatesStore {
  estimatesBySection: Record<string, Estimate[]>;
  loading: boolean;
  error: string | null;

  setEstimates: (sectionId: string, estimates: Estimate[]) => void;
  addEstimate: (sectionId: string, estimate: Estimate) => void;
  updateEstimate: (sectionId: string, estimateId: string, updates: Partial<Estimate>) => void;
  deleteEstimate: (sectionId: string, estimateId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useEstimatesStore = create<EstimatesStore>((set) => ({
  estimatesBySection: {},
  loading: false,
  error: null,

  setEstimates: (sectionId, estimates) => set((state) => ({
    estimatesBySection: {
      ...state.estimatesBySection,
      [sectionId]: estimates,
    },
  })),

  addEstimate: (sectionId, estimate) => set((state) => ({
    estimatesBySection: {
      ...state.estimatesBySection,
      [sectionId]: [estimate, ...(state.estimatesBySection[sectionId] || [])],
    },
  })),

  updateEstimate: (sectionId, estimateId, updates) => set((state) => ({
    estimatesBySection: {
      ...state.estimatesBySection,
      [sectionId]: (state.estimatesBySection[sectionId] || []).map((e) =>
        e.id === estimateId ? { ...e, ...updates } : e
      ),
    },
  })),

  deleteEstimate: (sectionId, estimateId) => set((state) => ({
    estimatesBySection: {
      ...state.estimatesBySection,
      [sectionId]: (state.estimatesBySection[sectionId] || []).filter(
        (e) => e.id !== estimateId
      ),
    },
  })),

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));

// UI Store
interface UIStore {
  isOffline: boolean;
  pendingSyncCount: number;
  theme: 'light' | 'dark';
  syncQueue: SyncQueueItem[];

  setOffline: (isOffline: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  addToSyncQueue: (item: SyncQueueItem) => void;
  removeFromSyncQueue: (id: string) => void;
  clearSyncQueue: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isOffline: false,
  pendingSyncCount: 0,
  theme: 'light',
  syncQueue: [],

  setOffline: (isOffline) => set({ isOffline }),
  setTheme: (theme) => set({ theme }),
  addToSyncQueue: (item) => set((state) => ({
    syncQueue: [...state.syncQueue, item],
    pendingSyncCount: state.pendingSyncCount + 1,
  })),
  removeFromSyncQueue: (id) => set((state) => ({
    syncQueue: state.syncQueue.filter((i) => i.id !== id),
    pendingSyncCount: Math.max(0, state.pendingSyncCount - 1),
  })),
  clearSyncQueue: () => set({ syncQueue: [], pendingSyncCount: 0 }),
}));

// AI Suggestions Store
interface AISuggestionsStore {
  suggestions: AISuggestion[];
  loading: boolean;

  setSuggestions: (suggestions: AISuggestion[]) => void;
  addSuggestion: (suggestion: AISuggestion) => void;
  dismissSuggestion: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useAISuggestionsStore = create<AISuggestionsStore>((set) => ({
  suggestions: [],
  loading: false,

  setSuggestions: (suggestions) => set({ suggestions }),
  addSuggestion: (suggestion) => set((state) => ({
    suggestions: [suggestion, ...state.suggestions],
  })),
  dismissSuggestion: (id) => set((state) => ({
    suggestions: state.suggestions.map((s) =>
      s.id === id ? { ...s, dismissed: true } : s
    ),
  })),
  setLoading: (loading) => set({ loading }),
}));
