// Types pour les agents
export type AgentId = "ceo" | "cto" | "frontend_dev" | "backend_dev";

export type WorkMode =
  | "consultation"
  | "collaboration"
  | "validation"
  | "exploration";

export interface Agent {
  id: AgentId;
  name: string;
  role: string;
  icon: string;
  color: string;
  capabilities: string[];
}

// Types pour les projets
export interface Project {
  project_id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  status: string;
  metadata: Record<string, any>;
}

// Types pour les messages
export interface ChatMessage {
  id: string;
  type: "user" | "agent" | "notification" | "error" | "system";
  content: string;
  agent_id?: AgentId;
  agent_name?: string;
  timestamp: string;
  streaming?: boolean;
}

// Types pour la configuration LLM
export interface LLMConfig {
  provider: "claude" | "ollama";
  model: string;
  temperature?: number;
  max_tokens?: number;
}

export interface LLMProvider {
  id: string;
  name: string;
  type: "cloud_api" | "local";
  requires_api_key: boolean;
  models: Array<{
    id: string;
    name: string;
    description: string;
    cost: string;
  }>;
  default_model: string;
}

// Types pour WebSocket
export interface WebSocketMessage {
  type: "connected" | "notification" | "stream" | "complete" | "error" | "pong";
  content?: string;
  message?: string;
  agent_id?: string;
  timestamp?: string;
  done?: boolean;
}

// Types pour les requêtes API
export interface ChatRequest {
  message: string;
  agent_id?: AgentId;
  llm_config?: LLMConfig;
}

export interface OrchestrateRequest {
  message: string;
  mode: WorkMode;
  agent_preference?: AgentId;
  proposing_agent?: AgentId;
  llm_config?: LLMConfig;
}
