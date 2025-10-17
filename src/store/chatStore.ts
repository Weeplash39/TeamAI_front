import { create } from "zustand";
import type { ChatMessage, AgentId, WorkMode } from "../types";

interface ChatStore {
  // Messages par projet
  messagesByProject: Record<string, ChatMessage[]>;

  // État de streaming par projet
  streamingState: Record<string, boolean>;

  // Sélections globales (conservées entre projets)
  selectedAgent: AgentId | "auto";
  selectedMode: WorkMode;

  // Actions pour les messages
  addMessage: (projectId: string, message: ChatMessage) => void;
  updateLastMessage: (projectId: string, content: string) => void;
  clearMessages: (projectId: string) => void;
  getMessages: (projectId: string) => ChatMessage[];

  // Actions pour l'état
  setStreaming: (projectId: string, streaming: boolean) => void;
  isStreaming: (projectId: string) => boolean;

  // Actions pour les sélections
  setSelectedAgent: (agent: AgentId | "auto") => void;
  setSelectedMode: (mode: WorkMode) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  // État initial
  messagesByProject: {},
  streamingState: {},
  selectedAgent: "auto",
  selectedMode: "consultation",

  // Messages
  addMessage: (projectId, message) =>
    set((state) => ({
      messagesByProject: {
        ...state.messagesByProject,
        [projectId]: [...(state.messagesByProject[projectId] || []), message],
      },
    })),

  updateLastMessage: (projectId, content) =>
    set((state) => {
      const messages = state.messagesByProject[projectId] || [];
      if (messages.length === 0) return state;

      const updatedMessages = [...messages];
      const lastMessage = updatedMessages[updatedMessages.length - 1];
      updatedMessages[updatedMessages.length - 1] = {
        ...lastMessage,
        content: content,
      };

      return {
        messagesByProject: {
          ...state.messagesByProject,
          [projectId]: updatedMessages,
        },
      };
    }),

  clearMessages: (projectId) =>
    set((state) => ({
      messagesByProject: {
        ...state.messagesByProject,
        [projectId]: [],
      },
    })),

  getMessages: (projectId) => {
    return get().messagesByProject[projectId] || [];
  },

  // État de streaming
  setStreaming: (projectId, streaming) =>
    set((state) => ({
      streamingState: {
        ...state.streamingState,
        [projectId]: streaming,
      },
    })),

  isStreaming: (projectId) => {
    return get().streamingState[projectId] || false;
  },

  // Sélections
  setSelectedAgent: (agent) => set({ selectedAgent: agent }),
  setSelectedMode: (mode) => set({ selectedMode: mode }),
}));
