import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi, sectionsApi } from '../services/api';
import { useProjectStore } from '../store';
import { Project, Section } from '../types';

export function useProject(projectId: string) {
  const queryClient = useQueryClient();
  const { setCurrentProject, setSections, setLoading, setError } = useProjectStore();

  const projectQuery = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const response = await projectsApi.getProject(projectId);
      if (response.error) {
        throw new Error(response.error);
      }
      if (response.data) {
        setCurrentProject(response.data);
      }
      return response.data;
    },
    enabled: !!projectId,
  });

  const sectionsQuery = useQuery({
    queryKey: ['sections', projectId],
    queryFn: async () => {
      const response = await sectionsApi.getSections(projectId);
      if (response.error) {
        throw new Error(response.error);
      }
      setSections(response.data);
      return response.data;
    },
    enabled: !!projectId,
  });

  const updateProjectMutation = useMutation({
    mutationFn: async (updates: Partial<Project>) => {
      const response = await projectsApi.updateProject(projectId, updates);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });

  const updateSectionMutation = useMutation({
    mutationFn: async ({ sectionId, updates }: { sectionId: string; updates: Partial<Section> }) => {
      const response = await sectionsApi.updateSection(sectionId, updates);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections', projectId] });
    },
  });

  return {
    project: projectQuery.data,
    sections: sectionsQuery.data || [],
    isLoading: projectQuery.isLoading || sectionsQuery.isLoading,
    error: projectQuery.error || sectionsQuery.error,
    refetch: () => {
      projectQuery.refetch();
      sectionsQuery.refetch();
    },
    updateProject: updateProjectMutation.mutate,
    updateSection: updateSectionMutation.mutate,
    isUpdating: updateProjectMutation.isPending || updateSectionMutation.isPending,
  };
}

export function useBudget(projectId: string) {
  const { currentProject } = useProjectStore();

  const planned = currentProject?.budgetPlanned || 0;
  const spent = currentProject?.budgetSpent || 0;
  const remaining = planned - spent;
  const percentage = planned > 0 ? Math.round((spent / planned) * 100) : 0;
  const isOverBudget = remaining < 0;

  return {
    planned,
    spent,
    remaining,
    percentage,
    isOverBudget,
  };
}
