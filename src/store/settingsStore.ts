import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LLMConfig } from "../types";

interface SettingsStore {
  llmConfig: LLMConfig;
  theme: "light" | "dark";
  autoScroll: boolean;

  // Actions
  setLLMConfig: (config: LLMConfig) => void;
  setTheme: (theme: "light" | "dark") => void;
  setAutoScroll: (autoScroll: boolean) => void;
  resetSettings: () => void;
}

const defaultSettings = {
  llmConfig: {
    provider: "ollama" as const,
    model: "llama3.2:3b",
    temperature: 0.7,
  },
  theme: "light" as const,
  autoScroll: true,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...defaultSettings,

      setLLMConfig: (config) => set({ llmConfig: config }),

      setTheme: (theme) => set({ theme }),

      setAutoScroll: (autoScroll) => set({ autoScroll }),

      resetSettings: () => set(defaultSettings),
    }),
    {
      name: "teamai-settings",
    }
  )
);
