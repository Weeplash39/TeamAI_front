import { create } from "zustand";
import type { ChatMessage, AgentId, WorkMode } from "../types";

interface ChatStore {
  messages: ChatMessage[];
  isStreaming: boolean;
  isConnected: boolean;
  selectedAgent: AgentId;
  selectedMode: WorkMode;

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
  selectedAgent: "cto", // ⚠️ Valeur par défaut
  selectedMode: "consultation", // ⚠️ Valeur par défaut

  addMessage: (message) => {
    console.log("➕ Store: Ajout message", message.type, message.id);
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  updateLastMessage: (content) => {
    set((state) => {
      const messages = [...state.messages];

      if (messages.length === 0) {
        return state;
      }

      const lastMessage = messages[messages.length - 1];

      if (lastMessage && lastMessage.type === "agent") {
        lastMessage.content = content;
        lastMessage.streaming = true;
      }

      return { messages };
    });
  },

  clearMessages: () => set({ messages: [] }),

  setStreaming: (isStreaming) => {
    console.log("🎬 Store: setStreaming:", isStreaming);
    set({ isStreaming });
  },

  setConnected: (isConnected) => {
    console.log("🔌 Store: setConnected:", isConnected);
    set({ isConnected });
  },

  setSelectedAgent: (agent) => {
    console.log("🎯 Store: setSelectedAgent:", agent);
    set({ selectedAgent: agent });
  },

  setSelectedMode: (mode) => {
    console.log("🎭 Store: setSelectedMode:", mode);
    set({ selectedMode: mode });
  },
}));
