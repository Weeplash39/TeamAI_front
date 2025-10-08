import axios from "axios";
import type { Project, Agent, LLMProvider, OrchestrateRequest } from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ========= PROJECTS =========

export const projectsApi = {
  list: () => api.get<{ projects: Project[]; total: number }>("/projects"),

  get: (projectId: string) => api.get<Project>(`/projects/${projectId}`),

  create: (data: { project_id: string; name: string; description?: string }) =>
    api.post<Project>("/projects", data),

  update: (projectId: string, data: Partial<Project>) =>
    api.put<Project>(`/projects/${projectId}`, data),

  delete: (projectId: string) =>
    api.delete(`/projects/${projectId}`, { params: { confirm: true } }),
};

// ========= AGENTS =========

export const agentsApi = {
  list: (projectId: string) =>
    api.get<{ project_id: string; agents: Agent[] }>(
      `/projects/${projectId}/agents`
    ),

  getContext: (projectId: string, agentId: string) =>
    api.get(`/projects/${projectId}/agents/${agentId}/context`),
};

// ========= ORCHESTRATION =========

export const orchestrateApi = {
  process: (projectId: string, request: OrchestrateRequest) =>
    api.post(`/projects/${projectId}/orchestrate`, request),
};

// ========= LLM =========

export const llmApi = {
  getProviders: () => api.get<{ providers: LLMProvider[] }>("/llm/providers"),

  getCurrent: () => api.get("/llm/current"),
};

// ========= HEALTH =========

export const healthApi = {
  check: () => api.get("/health"),

  stats: () => api.get("/stats"),
};

export default api;
