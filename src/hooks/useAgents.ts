import { useQuery } from "@tanstack/react-query";
import { agentsApi } from "../services/api";

export function useAgents(projectId: string) {
  const agentsQuery = useQuery({
    queryKey: ["agents", projectId],
    queryFn: async () => {
      const response = await agentsApi.list(projectId);
      return response.data;
    },
    enabled: !!projectId,
  });

  return {
    agents: agentsQuery.data?.agents || [],
    isLoading: agentsQuery.isLoading,
    error: agentsQuery.error,
  };
}

// Hook pour le contexte d'un agent
export function useAgentContext(projectId: string, agentId: string) {
  const contextQuery = useQuery({
    queryKey: ["agent-context", projectId, agentId],
    queryFn: async () => {
      const response = await agentsApi.getContext(projectId, agentId);
      return response.data;
    },
    enabled: !!projectId && !!agentId,
  });

  return {
    context: contextQuery.data,
    isLoading: contextQuery.isLoading,
    error: contextQuery.error,
  };
}
