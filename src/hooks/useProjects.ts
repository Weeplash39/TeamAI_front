import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsApi } from "../services/api";
import { useProjectStore } from "../store/projectStore";
import type { Project } from "../types";

export function useProjects() {
  const queryClient = useQueryClient();
  const { setProjects, setLoading, setError } = useProjectStore();

  // Query pour lister les projets
  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await projectsApi.list();
      return response.data;
    },
    onSuccess: (data) => {
      setProjects(data.projects);
    },
    onError: (error: any) => {
      setError(error.message || "Erreur lors du chargement des projets");
    },
  });

  // Mutation pour créer un projet
  const createProjectMutation = useMutation({
    mutationFn: (data: {
      project_id: string;
      name: string;
      description?: string;
    }) => projectsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (error: any) => {
      setError(error.message || "Erreur lors de la création du projet");
    },
  });

  // Mutation pour mettre à jour un projet
  const updateProjectMutation = useMutation({
    mutationFn: ({
      projectId,
      data,
    }: {
      projectId: string;
      data: Partial<Project>;
    }) => projectsApi.update(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (error: any) => {
      setError(error.message || "Erreur lors de la mise à jour du projet");
    },
  });

  // Mutation pour supprimer un projet
  const deleteProjectMutation = useMutation({
    mutationFn: (projectId: string) => projectsApi.delete(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (error: any) => {
      setError(error.message || "Erreur lors de la suppression du projet");
    },
  });

  return {
    projects: projectsQuery.data?.projects || [],
    isLoading: projectsQuery.isLoading,
    error: projectsQuery.error,
    createProject: createProjectMutation.mutate,
    updateProject: updateProjectMutation.mutate,
    deleteProject: deleteProjectMutation.mutate,
    isCreating: createProjectMutation.isPending,
    isUpdating: updateProjectMutation.isPending,
    isDeleting: deleteProjectMutation.isPending,
  };
}

// Hook pour un projet spécifique
export function useProject(projectId: string) {
  const queryClient = useQueryClient();

  const projectQuery = useQuery({
    queryKey: ["projects", projectId],
    queryFn: async () => {
      const response = await projectsApi.get(projectId);
      return response.data;
    },
    enabled: !!projectId,
  });

  return {
    project: projectQuery.data,
    isLoading: projectQuery.isLoading,
    error: projectQuery.error,
  };
}
