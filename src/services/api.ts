import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Note,
  Estimate,
  Expense,
  Project,
  Section,
  CreateNoteRequest,
  UpdateNoteRequest,
  CreateEstimateRequest,
  CreateExpenseRequest,
  ApiResponse,
  PaginatedResponse,
} from '../types';

// Supabase configuration - replace with your actual values
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Helper function for API responses
function createResponse<T>(data: T, error: string | null = null, status: number = 200): ApiResponse<T> {
  return { data, error, status };
}

// Projects API
export const projectsApi = {
  async getProject(projectId: string): Promise<ApiResponse<Project | null>> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) throw error;
      return createResponse(data);
    } catch (error) {
      return createResponse(null, (error as Error).message, 500);
    }
  },

  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Project | null>> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert(project)
        .select()
        .single();

      if (error) throw error;
      return createResponse(data);
    } catch (error) {
      return createResponse(null, (error as Error).message, 500);
    }
  },

  async updateProject(projectId: string, updates: Partial<Project>): Promise<ApiResponse<Project | null>> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId)
        .select()
        .single();

      if (error) throw error;
      return createResponse(data);
    } catch (error) {
      return createResponse(null, (error as Error).message, 500);
    }
  },
};

// Sections API
export const sectionsApi = {
  async getSections(projectId: string): Promise<ApiResponse<Section[]>> {
    try {
      const { data, error } = await supabase
        .from('sections')
        .select('*')
        .eq('project_id', projectId)
        .order('type');

      if (error) throw error;
      return createResponse(data || []);
    } catch (error) {
      return createResponse([], (error as Error).message, 500);
    }
  },

  async updateSection(sectionId: string, updates: Partial<Section>): Promise<ApiResponse<Section | null>> {
    try {
      const { data, error } = await supabase
        .from('sections')
        .update(updates)
        .eq('id', sectionId)
        .select()
        .single();

      if (error) throw error;
      return createResponse(data);
    } catch (error) {
      return createResponse(null, (error as Error).message, 500);
    }
  },
};

// Notes API
export const notesApi = {
  async getNotes(
    sectionId: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<ApiResponse<PaginatedResponse<Note>>> {
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await supabase
        .from('notes')
        .select('*', { count: 'exact' })
        .eq('section_id', sectionId)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      return createResponse({
        data: data || [],
        total: count || 0,
        page,
        pageSize,
        hasMore: (count || 0) > to + 1,
      });
    } catch (error) {
      return createResponse(
        { data: [], total: 0, page, pageSize, hasMore: false },
        (error as Error).message,
        500
      );
    }
  },

  async createNote(note: CreateNoteRequest): Promise<ApiResponse<Note | null>> {
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert({
          section_id: note.sectionId,
          project_id: note.projectId,
          content: note.content,
          tags: note.tags || [],
          media: [],
        })
        .select()
        .single();

      if (error) throw error;
      return createResponse(data);
    } catch (error) {
      return createResponse(null, (error as Error).message, 500);
    }
  },

  async updateNote(noteId: string, updates: UpdateNoteRequest): Promise<ApiResponse<Note | null>> {
    try {
      const { data, error } = await supabase
        .from('notes')
        .update(updates)
        .eq('id', noteId)
        .select()
        .single();

      if (error) throw error;
      return createResponse(data);
    } catch (error) {
      return createResponse(null, (error as Error).message, 500);
    }
  },

  async deleteNote(noteId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;
      return createResponse(true);
    } catch (error) {
      return createResponse(false, (error as Error).message, 500);
    }
  },
};

// Estimates API
export const estimatesApi = {
  async getEstimates(sectionId: string): Promise<ApiResponse<Estimate[]>> {
    try {
      const { data, error } = await supabase
        .from('estimates')
        .select('*')
        .eq('section_id', sectionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return createResponse(data || []);
    } catch (error) {
      return createResponse([], (error as Error).message, 500);
    }
  },

  async createEstimate(estimate: CreateEstimateRequest): Promise<ApiResponse<Estimate | null>> {
    try {
      const { data, error } = await supabase
        .from('estimates')
        .insert({
          section_id: estimate.sectionId,
          project_id: estimate.projectId,
          contractor_name: estimate.contractorName,
          total_amount: estimate.totalAmount,
          items: [],
          is_accepted: false,
        })
        .select()
        .single();

      if (error) throw error;
      return createResponse(data);
    } catch (error) {
      return createResponse(null, (error as Error).message, 500);
    }
  },

  async acceptEstimate(estimateId: string): Promise<ApiResponse<Estimate | null>> {
    try {
      const { data, error } = await supabase
        .from('estimates')
        .update({ is_accepted: true })
        .eq('id', estimateId)
        .select()
        .single();

      if (error) throw error;
      return createResponse(data);
    } catch (error) {
      return createResponse(null, (error as Error).message, 500);
    }
  },
};

// Expenses API
export const expensesApi = {
  async getExpenses(projectId: string): Promise<ApiResponse<Expense[]>> {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('project_id', projectId)
        .order('date', { ascending: false });

      if (error) throw error;
      return createResponse(data || []);
    } catch (error) {
      return createResponse([], (error as Error).message, 500);
    }
  },

  async createExpense(expense: CreateExpenseRequest): Promise<ApiResponse<Expense | null>> {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          section_id: expense.sectionId,
          project_id: expense.projectId,
          description: expense.description,
          amount: expense.amount,
          date: expense.date,
        })
        .select()
        .single();

      if (error) throw error;
      return createResponse(data);
    } catch (error) {
      return createResponse(null, (error as Error).message, 500);
    }
  },
};

// Storage API for file uploads
export const storageApi = {
  async uploadFile(
    bucket: string,
    path: string,
    file: Blob | ArrayBuffer,
    contentType: string
  ): Promise<ApiResponse<string | null>> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          contentType,
          upsert: true,
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return createResponse(urlData.publicUrl);
    } catch (error) {
      return createResponse(null, (error as Error).message, 500);
    }
  },

  async deleteFile(bucket: string, path: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) throw error;
      return createResponse(true);
    } catch (error) {
      return createResponse(false, (error as Error).message, 500);
    }
  },
};
