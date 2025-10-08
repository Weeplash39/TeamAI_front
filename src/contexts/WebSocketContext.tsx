import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { WebSocketService } from "../services/websocket";
import { useChatStore } from "../store/chatStore";
import type { WebSocketMessage, AgentId, LLMConfig, WorkMode } from "../types";

interface WebSocketContextValue {
  sendMessage: (
    message: string,
    agentId?: AgentId,
    llmConfig?: LLMConfig
  ) => void;
  orchestrate: (
    message: string,
    mode: WorkMode,
    agentId?: AgentId,
    llmConfig?: LLMConfig
  ) => void; // ⚠️ AJOUTER
  isConnected: boolean;
  isStreaming: boolean;
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error(
      "useWebSocketContext must be used within WebSocketProvider"
    );
  }
  return context;
}

interface WebSocketProviderProps {
  projectId: string;
  children: ReactNode;
}

export function WebSocketProvider({
  projectId,
  children,
}: WebSocketProviderProps) {
  const wsRef = useRef<WebSocketService | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const currentStreamMessageRef = useRef<string>("");
  const mountedRef = useRef(true);

  const addMessage = useChatStore((state) => state.addMessage);
  const updateLastMessage = useChatStore((state) => state.updateLastMessage);
  const setStreaming = useChatStore((state) => state.setStreaming);
  const setConnectedStore = useChatStore((state) => state.setConnected);

  useEffect(() => {
    mountedRef.current = true;
    console.log("🔌 WebSocketProvider monté pour projet:", projectId);

    const ws = new WebSocketService(projectId);
    wsRef.current = ws;

    const handleMessage = (message: WebSocketMessage) => {
      if (!mountedRef.current) return;

      console.log("📨 Message WebSocket:", message.type, message);

      switch (message.type) {
        case "connected":
          console.log("✅ Connecté:", message.message);
          addMessage({
            id: Date.now().toString(),
            type: "system",
            content: message.message || "Connecté au serveur",
            timestamp: new Date().toISOString(),
          });
          break;

        case "notification":
          console.log("🔔 Notification:", message.message);
          addMessage({
            id: Date.now().toString(),
            type: "notification",
            content: message.message || "",
            timestamp: message.timestamp || new Date().toISOString(),
          });
          break;

        case "stream":
          console.log(
            "📝 Stream:",
            message.content?.substring(0, 20),
            "done:",
            message.done
          );

          if (!message.done && message.content) {
            currentStreamMessageRef.current += message.content;
            updateLastMessage(currentStreamMessageRef.current);
          } else if (message.done) {
            console.log("✅ Stream terminé");
            setStreaming(false);
            currentStreamMessageRef.current = "";
          }
          break;

        case "complete":
          console.log("✅ Message complet");
          setStreaming(false);
          break;

        case "error":
          console.error("❌ Erreur:", message.message);
          setStreaming(false);
          addMessage({
            id: Date.now().toString(),
            type: "error",
            content: message.message || "Une erreur est survenue",
            timestamp: message.timestamp || new Date().toISOString(),
          });
          break;

        case "pong":
          console.log("🏓 Pong");
          break;

        default:
          console.warn("⚠️ Type de message inconnu:", message.type);
      }
    };

    const handleConnection = (connected: boolean) => {
      if (!mountedRef.current) return;

      console.log("🔌 État connexion:", connected);
      setIsConnected(connected);
      setConnectedStore(connected);
    };

    const unsubMessage = ws.onMessage(handleMessage);
    const unsubConnection = ws.onConnection(handleConnection);

    console.log("🚀 Connexion WebSocket...");
    ws.connect()
      .then(() => {
        console.log("✅ WebSocket connecté !");
        ws.startHeartbeat();
      })
      .catch((err) => {
        console.error("❌ Erreur connexion WebSocket:", err);
      });

    return () => {
      console.log("🧹 WebSocketProvider cleanup");
      mountedRef.current = false;
      unsubMessage();
      unsubConnection();
      ws.disconnect();
      wsRef.current = null;
    };
  }, [projectId]);

  // Fonction pour chat simple (1 agent)
  const sendMessage = useCallback(
    (message: string, agentId?: AgentId, llmConfig?: LLMConfig) => {
      if (!wsRef.current || !isConnected) {
        console.error("❌ WebSocket pas connecté");
        return;
      }

      console.log("📤 Envoi message chat:", message, "à agent:", agentId);

      addMessage({
        id: Date.now().toString(),
        type: "user",
        content: message,
        timestamp: new Date().toISOString(),
      });

      currentStreamMessageRef.current = "";
      setStreaming(true);

      wsRef.current.sendMessage({
        type: "chat",
        message,
        agent_id: agentId,
        llm_config: llmConfig,
      });

      setTimeout(() => {
        addMessage({
          id: Date.now().toString(),
          type: "agent",
          content: "",
          agent_id: agentId,
          timestamp: new Date().toISOString(),
          streaming: true,
        });
      }, 100);
    },
    [isConnected, addMessage, setStreaming]
  );

  // ⚠️ NOUVELLE FONCTION : orchestrate (multi-agents)
  const orchestrate = useCallback(
    (
      message: string,
      mode: WorkMode,
      agentId?: AgentId,
      llmConfig?: LLMConfig
    ) => {
      if (!wsRef.current || !isConnected) {
        console.error("❌ WebSocket pas connecté");
        return;
      }

      console.log("🎭 Orchestration:", mode, "message:", message);

      // Ajouter message utilisateur
      addMessage({
        id: Date.now().toString(),
        type: "user",
        content: message,
        timestamp: new Date().toISOString(),
      });

      currentStreamMessageRef.current = "";
      setStreaming(true);

      // Envoyer orchestrate
      wsRef.current.sendMessage({
        type: "orchestrate",
        message,
        mode,
        agent_id: agentId, // Agent préféré (optionnel)
        llm_config: llmConfig,
      });

      // Ajouter placeholder pour réponse
      setTimeout(() => {
        addMessage({
          id: Date.now().toString(),
          type: "agent",
          content: "",
          timestamp: new Date().toISOString(),
          streaming: true,
        });
      }, 100);
    },
    [isConnected, addMessage, setStreaming]
  );

  const isStreamingValue = useChatStore((state) => state.isStreaming);

  const value = {
    sendMessage,
    orchestrate,
    isConnected,
    isStreaming: isStreamingValue,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}
