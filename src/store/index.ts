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

// Expenses Store
interface ExpensesStore {
  expenses: Expense[];
  loading: boolean;
  error: string | null;

  setExpenses: (expenses: Expense[]) => void;
  addExpense: (expense: Expense) => void;
  updateExpense: (expenseId: string, updates: Partial<Expense>) => void;
  deleteExpense: (expenseId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useExpensesStore = create<ExpensesStore>((set) => ({
  expenses: [],
  loading: false,
  error: null,

  setExpenses: (expenses) => set({ expenses }),
  addExpense: (expense) => set((state) => ({
    expenses: [expense, ...state.expenses],
  })),
  updateExpense: (expenseId, updates) => set((state) => ({
    expenses: state.expenses.map((e) =>
      e.id === expenseId ? { ...e, ...updates } : e
    ),
  })),
  deleteExpense: (expenseId) => set((state) => ({
    expenses: state.expenses.filter((e) => e.id !== expenseId),
  })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));

// Budget Summary Store (agregacja danych z sekcji)
interface BudgetSummaryItem {
  sectionType: SectionType;
  planned: number;
  actual: number;
  contractor?: string;
}

interface BudgetSummaryStore {
  summaryItems: BudgetSummaryItem[];
  totalPlanned: number;
  totalActual: number;
  loading: boolean;

  setSummaryItems: (items: BudgetSummaryItem[]) => void;
  updateSummaryItem: (sectionType: SectionType, updates: Partial<BudgetSummaryItem>) => void;
  setLoading: (loading: boolean) => void;
}

export const useBudgetSummaryStore = create<BudgetSummaryStore>((set, get) => ({
  summaryItems: [
    { sectionType: 'electrical', planned: 30000, actual: 32400, contractor: 'ElektroPro' },
    { sectionType: 'plumbing', planned: 15000, actual: 14200, contractor: 'HydroMax' },
    { sectionType: 'carpentry', planned: 20000, actual: 18500 },
    { sectionType: 'finishing', planned: 25000, actual: 2400 },
  ],
  totalPlanned: 90000,
  totalActual: 67500,
  loading: false,

  setSummaryItems: (items) => {
    const totalPlanned = items.reduce((sum, item) => sum + item.planned, 0);
    const totalActual = items.reduce((sum, item) => sum + item.actual, 0);
    set({ summaryItems: items, totalPlanned, totalActual });
  },
  updateSummaryItem: (sectionType, updates) => set((state) => {
    const newItems = state.summaryItems.map((item) =>
      item.sectionType === sectionType ? { ...item, ...updates } : item
    );
    const totalPlanned = newItems.reduce((sum, item) => sum + item.planned, 0);
    const totalActual = newItems.reduce((sum, item) => sum + item.actual, 0);
    return { summaryItems: newItems, totalPlanned, totalActual };
  }),
  setLoading: (loading) => set({ loading }),
}));
