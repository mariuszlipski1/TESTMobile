import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notesApi } from '../services/api';
import { useNotesStore } from '../store';
import { Note, CreateNoteRequest, UpdateNoteRequest } from '../types';

export function useNotes(sectionId: string) {
  const queryClient = useQueryClient();
  const { setNotes, setLoading, setError } = useNotesStore();

  const notesQuery = useQuery({
    queryKey: ['notes', sectionId],
    queryFn: async () => {
      const response = await notesApi.getNotes(sectionId);
      if (response.error) {
        throw new Error(response.error);
      }
      setNotes(sectionId, response.data.data);
      return response.data;
    },
    enabled: !!sectionId,
  });

  const createNoteMutation = useMutation({
    mutationFn: async (note: CreateNoteRequest) => {
      const response = await notesApi.createNote(note);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', sectionId] });
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: async ({ noteId, updates }: { noteId: string; updates: UpdateNoteRequest }) => {
      const response = await notesApi.updateNote(noteId, updates);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', sectionId] });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      const response = await notesApi.deleteNote(noteId);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', sectionId] });
    },
  });

  return {
    notes: notesQuery.data?.data || [],
    isLoading: notesQuery.isLoading,
    error: notesQuery.error,
    refetch: notesQuery.refetch,
    createNote: createNoteMutation.mutate,
    updateNote: updateNoteMutation.mutate,
    deleteNote: deleteNoteMutation.mutate,
    isCreating: createNoteMutation.isPending,
    isUpdating: updateNoteMutation.isPending,
    isDeleting: deleteNoteMutation.isPending,
  };
}

export function useNote(noteId: string) {
  return useQuery({
    queryKey: ['note', noteId],
    queryFn: async () => {
      // In real implementation, fetch single note
      return null as Note | null;
    },
    enabled: !!noteId,
  });
}
