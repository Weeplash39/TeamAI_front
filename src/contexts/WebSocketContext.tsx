import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
  useState,
} from "react";
import { WebSocketService } from "../services/websocket";
import { useChatStore } from "../store/chatStore";
import type { WebSocketMessage, AgentId, LLMConfig } from "../types";

interface WebSocketContextType {
  sendMessage: (
    message: string,
    agentId?: AgentId,
    llmConfig?: LLMConfig
  ) => void;
  orchestrate: (message: string, mode: string, llmConfig?: LLMConfig) => void;
  isConnected: boolean;
  isStreaming: boolean;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

interface WebSocketProviderProps {
  projectId: string;
  children: React.ReactNode;
}

export function WebSocketProvider({
  projectId,
  children,
}: WebSocketProviderProps) {
  const wsRef = useRef<WebSocketService | null>(null);
  const currentStreamMessageRef = useRef<string>("");
  const [isConnected, setIsConnected] = useState(false);

  // Extraire les fonctions du store
  const addMessage = useChatStore((state) => state.addMessage);
  const updateLastMessage = useChatStore((state) => state.updateLastMessage);
  const setStreaming = useChatStore((state) => state.setStreaming);
  const isStreaming = useChatStore((state) => state.isStreaming(projectId));

  const handleMessage = useCallback(
    (message: WebSocketMessage) => {
      console.log("📨 Message WebSocket reçu:", message);

      switch (message.type) {
        case "connected":
          console.log("✅ Connected:", message.message);
          addMessage(projectId, {
            id: Date.now().toString(),
            type: "system",
            content: message.message || "Connecté au serveur",
            timestamp: new Date().toISOString(),
          });
          break;

        case "notification":
          addMessage(projectId, {
            id: Date.now().toString(),
            type: "notification",
            content: message.message || "",
            timestamp: message.timestamp || new Date().toISOString(),
          });
          break;

        case "stream":
          if (!message.done && message.content) {
            currentStreamMessageRef.current += message.content;
            updateLastMessage(projectId, currentStreamMessageRef.current);
          } else if (message.done) {
            setStreaming(projectId, false);
            currentStreamMessageRef.current = "";
          }
          break;

        case "complete":
          setStreaming(projectId, false);
          console.log("✅ Message complet reçu");
          break;

        case "error":
          setStreaming(projectId, false);
          addMessage(projectId, {
            id: Date.now().toString(),
            type: "error",
            content: message.message || "Une erreur est survenue",
            timestamp: message.timestamp || new Date().toISOString(),
          });
          break;

        case "pong":
          console.log("🏓 Pong reçu");
          break;
      }
    },
    [projectId, addMessage, updateLastMessage, setStreaming]
  );

  const handleConnection = useCallback((connected: boolean) => {
    console.log("🔌 État connexion:", connected ? "CONNECTÉ" : "DÉCONNECTÉ");
    setIsConnected(connected);
  }, []);

  useEffect(() => {
    console.log("🔄 Initialisation WebSocket pour projet:", projectId);

    const ws = new WebSocketService(projectId);
    wsRef.current = ws;

    const unsubscribeMessage = ws.onMessage(handleMessage);
    const unsubscribeConnection = ws.onConnection(handleConnection);

    console.log("🚀 Tentative de connexion WebSocket...");
    ws.connect()
      .then(() => {
        console.log("✅ WebSocket connected successfully");
        ws.startHeartbeat();
      })
      .catch((error) => {
        console.error("❌ Failed to connect WebSocket:", error);
      });

    return () => {
      console.log("🧹 Nettoyage WebSocket pour projet:", projectId);
      unsubscribeMessage();
      unsubscribeConnection();
      ws.disconnect();
    };
  }, [projectId, handleMessage, handleConnection]);

  const sendMessage = useCallback(
    (message: string, agentId?: AgentId, llmConfig?: LLMConfig) => {
      if (!wsRef.current) {
        console.error("WebSocket not connected");
        return;
      }

      addMessage(projectId, {
        id: Date.now().toString(),
        type: "user",
        content: message,
        timestamp: new Date().toISOString(),
      });

      currentStreamMessageRef.current = "";
      addMessage(projectId, {
        id: (Date.now() + 1).toString(),
        type: "agent",
        content: "",
        agent_id: agentId,
        timestamp: new Date().toISOString(),
        streaming: true,
      });

      setStreaming(projectId, true);

      wsRef.current.sendMessage({
        type: "chat",
        message,
        agent_id: agentId,
        llm_config: llmConfig,
      });
    },
    [projectId, addMessage, setStreaming]
  );

  const orchestrate = useCallback(
    (message: string, mode: string, llmConfig?: LLMConfig) => {
      if (!wsRef.current) {
        console.error("WebSocket not connected");
        return;
      }

      addMessage(projectId, {
        id: Date.now().toString(),
        type: "user",
        content: message,
        timestamp: new Date().toISOString(),
      });

      setStreaming(projectId, true);

      wsRef.current.sendMessage({
        type: "orchestrate",
        message,
        mode,
        llm_config: llmConfig,
      });
    },
    [projectId, addMessage, setStreaming]
  );

  return (
    <WebSocketContext.Provider
      value={{
        sendMessage,
        orchestrate,
        isConnected,
        isStreaming,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
}
