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
  InspectionChecklist,
  InspectionChecklistItem,
  InspectionPhoto,
  PropertyData,
  ProjectWithInspection,
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

// Inspection API
export const inspectionApi = {
  // Save property data and generate checklist
  async savePropertyData(
    projectId: string,
    propertyData: PropertyData
  ): Promise<ApiResponse<ProjectWithInspection | null>> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update({
          area: propertyData.area,
          floor: propertyData.floor,
          year_built: propertyData.year,
          has_elevator: propertyData.hasElevator,
          has_parking: propertyData.hasParking,
          market_type: propertyData.marketType,
        })
        .eq('id', projectId)
        .select()
        .single();

      if (error) throw error;
      return createResponse(data);
    } catch (error) {
      return createResponse(null, (error as Error).message, 500);
    }
  },

  // Save inspection checklist
  async saveChecklist(
    projectId: string,
    checklist: InspectionChecklist
  ): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          inspection_checklist: checklist,
          checklist_progress: checklist.completedCount,
        })
        .eq('id', projectId);

      if (error) throw error;
      return createResponse(true);
    } catch (error) {
      return createResponse(false, (error as Error).message, 500);
    }
  },

  // Get inspection checklist
  async getChecklist(projectId: string): Promise<ApiResponse<InspectionChecklist | null>> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('inspection_checklist')
        .eq('id', projectId)
        .single();

      if (error) throw error;
      return createResponse(data?.inspection_checklist || null);
    } catch (error) {
      return createResponse(null, (error as Error).message, 500);
    }
  },

  // Upload floor plan
  async uploadFloorPlan(
    projectId: string,
    fileUri: string,
    fileName: string
  ): Promise<ApiResponse<string | null>> {
    try {
      // In real implementation, convert URI to blob and upload
      const path = `floor-plans/${projectId}/${fileName}`;

      // For now, just update the project with a placeholder URL
      const { error } = await supabase
        .from('projects')
        .update({ floor_plan_url: path })
        .eq('id', projectId);

      if (error) throw error;
      return createResponse(path);
    } catch (error) {
      return createResponse(null, (error as Error).message, 500);
    }
  },

  // Get inspection photos
  async getPhotos(projectId: string): Promise<ApiResponse<InspectionPhoto[]>> {
    try {
      const { data, error } = await supabase
        .from('inspection_photos')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return createResponse(data || []);
    } catch (error) {
      return createResponse([], (error as Error).message, 500);
    }
  },

  // Add inspection photo
  async addPhoto(
    projectId: string,
    photoUrl: string,
    checklistItemId?: string
  ): Promise<ApiResponse<InspectionPhoto | null>> {
    try {
      const { data, error } = await supabase
        .from('inspection_photos')
        .insert({
          project_id: projectId,
          photo_url: photoUrl,
          checklist_item_id: checklistItemId,
        })
        .select()
        .single();

      if (error) throw error;
      return createResponse(data);
    } catch (error) {
      return createResponse(null, (error as Error).message, 500);
    }
  },

  // Delete inspection photo
  async deletePhoto(photoId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('inspection_photos')
        .delete()
        .eq('id', photoId);

      if (error) throw error;
      return createResponse(true);
    } catch (error) {
      return createResponse(false, (error as Error).message, 500);
    }
  },

  // Generate AI checklist (mock - in real app, call backend which calls Claude)
  async generateChecklist(
    propertyData: PropertyData
  ): Promise<ApiResponse<InspectionChecklistItem[]>> {
    try {
      // This would call your backend which then calls Claude API
      // For now, return mock data
      const mockItems: InspectionChecklistItem[] = [
        {
          id: '1',
          category: 'hydraulika',
          task: 'Sprawdź stan pionów wodno-kanalizacyjnych',
          priority: 'high',
          completed: false,
        },
        {
          id: '2',
          category: 'elektryka',
          task: 'Zweryfikuj typ instalacji (aluminium/miedź)',
          priority: 'high',
          completed: false,
        },
        // More items would be generated by AI based on property data
      ];

      return createResponse(mockItems);
    } catch (error) {
      return createResponse([], (error as Error).message, 500);
    }
  },
};
