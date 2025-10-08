import { useQuery } from "@tanstack/react-query";
import { llmApi } from "../services/api";

export function useLLMProviders() {
  const providersQuery = useQuery({
    queryKey: ["llm-providers"],
    queryFn: async () => {
      const response = await llmApi.getProviders();
      return response.data;
    },
  });

  return {
    providers: providersQuery.data?.providers || [],
    isLoading: providersQuery.isLoading,
    error: providersQuery.error,
  };
}

export function useCurrentLLM() {
  const currentQuery = useQuery({
    queryKey: ["llm-current"],
    queryFn: async () => {
      const response = await llmApi.getCurrent();
      return response.data;
    },
  });

  return {
    current: currentQuery.data,
    isLoading: currentQuery.isLoading,
    error: currentQuery.error,
  };
}
