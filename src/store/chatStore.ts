import { create } from "zustand";
import type { ChatMessage, AgentId, WorkMode } from "../types";

interface ChatStore {
  messages: ChatMessage[];
  isStreaming: boolean;
  isConnected: boolean;
  selectedAgent: AgentId;
  selectedMode: WorkMode;

  // Actions
  addMessage: (message: ChatMessage) => void;
  updateLastMessage: (content: string) => void;
  clearMessages: () => void;
  setStreaming: (isStreaming: boolean) => void;
  setConnected: (isConnected: boolean) => void;
  setSelectedAgent: (agent: AgentId) => void;
  setSelectedMode: (mode: WorkMode) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isStreaming: false,
  isConnected: false,
  selectedAgent: "cto",
  selectedMode: "consultation",

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  updateLastMessage: (content) =>
    set((state) => {
      const messages = [...state.messages];
      const lastMessage = messages[messages.length - 1];

      if (lastMessage && lastMessage.type === "agent") {
        lastMessage.content = content;
      }

      return { messages };
    }),

  clearMessages: () => set({ messages: [] }),

  setStreaming: (isStreaming) => set({ isStreaming }),

  setConnected: (isConnected) => set({ isConnected }),

  setSelectedAgent: (agent) => set({ selectedAgent: agent }),

  setSelectedMode: (mode) => set({ selectedMode: mode }),
}));
