import { useEffect, useRef, useCallback } from "react";
import { WebSocketService } from "../services/websocket";
import { useChatStore } from "../store/chatStore";
import type { WebSocketMessage, AgentId, LLMConfig } from "../types";

interface UseWebSocketOptions {
  projectId: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export function useWebSocket({
  projectId,
  onConnect,
  onDisconnect,
  onError,
}: UseWebSocketOptions) {
  const wsRef = useRef<WebSocketService | null>(null);
  const currentStreamMessageRef = useRef<string>("");

  // ⚠️ IMPORTANT : Extraire les fonctions du store en dehors
  const addMessageToStore = useChatStore((state) => state.addMessage);
  const updateLastMessageInStore = useChatStore(
    (state) => state.updateLastMessage
  );
  const setStreamingInStore = useChatStore((state) => state.setStreaming);
  const setConnectedInStore = useChatStore((state) => state.setConnected);

  // ⚠️ CRITIQUE : useCallback pour stabiliser les handlers
  const handleMessage = useCallback(
    (message: WebSocketMessage) => {
      console.log("📨 Message WebSocket reçu:", message);

      switch (message.type) {
        case "connected":
          console.log("✅ Connected:", message.message);
          addMessageToStore({
            id: Date.now().toString(),
            type: "system",
            content: message.message || "Connecté au serveur",
            timestamp: new Date().toISOString(),
          });
          break;

        case "notification":
          addMessageToStore({
            id: Date.now().toString(),
            type: "notification",
            content: message.message || "",
            timestamp: message.timestamp || new Date().toISOString(),
          });
          break;

        case "stream":
          if (!message.done && message.content) {
            currentStreamMessageRef.current += message.content;
            updateLastMessageInStore(currentStreamMessageRef.current);
          } else if (message.done) {
            setStreamingInStore(false);
            currentStreamMessageRef.current = "";
          }
          break;

        case "complete":
          setStreamingInStore(false);
          console.log("✅ Message complet reçu");
          break;

        case "error":
          setStreamingInStore(false);
          addMessageToStore({
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
    [addMessageToStore, updateLastMessageInStore, setStreamingInStore]
  );

  const handleConnection = useCallback(
    (connected: boolean) => {
      console.log(
        "🔌 État connexion changé:",
        connected ? "CONNECTÉ" : "DÉCONNECTÉ"
      );
      setConnectedInStore(connected);
      if (connected) {
        onConnect?.();
      } else {
        onDisconnect?.();
      }
    },
    [setConnectedInStore, onConnect, onDisconnect]
  );

  // ⚠️ IMPORTANT : useEffect avec SEULEMENT projectId comme dépendance
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
        onError?.(error);
      });

    return () => {
      console.log("🧹 Nettoyage WebSocket");
      unsubscribeMessage();
      unsubscribeConnection();
      ws.disconnect();
    };
  }, [projectId, handleMessage, handleConnection, onError]);

  // Fonctions de send (stables grâce à useCallback)
  const sendMessage = useCallback(
    (message: string, agentId?: AgentId, llmConfig?: LLMConfig) => {
      if (!wsRef.current) {
        console.error("WebSocket not connected");
        return;
      }

      addMessageToStore({
        id: Date.now().toString(),
        type: "user",
        content: message,
        timestamp: new Date().toISOString(),
      });

      currentStreamMessageRef.current = "";
      addMessageToStore({
        id: (Date.now() + 1).toString(),
        type: "agent",
        content: "",
        agent_id: agentId,
        timestamp: new Date().toISOString(),
        streaming: true,
      });

      setStreamingInStore(true);

      wsRef.current.sendMessage({
        type: "chat",
        message,
        agent_id: agentId,
        llm_config: llmConfig,
      });
    },
    [addMessageToStore, setStreamingInStore]
  );

  const orchestrate = useCallback(
    (message: string, mode: string, llmConfig?: LLMConfig) => {
      if (!wsRef.current) {
        console.error("WebSocket not connected");
        return;
      }

      addMessageToStore({
        id: Date.now().toString(),
        type: "user",
        content: message,
        timestamp: new Date().toISOString(),
      });

      setStreamingInStore(true);

      wsRef.current.sendMessage({
        type: "orchestrate",
        message,
        mode,
        llm_config: llmConfig,
      });
    },
    [addMessageToStore, setStreamingInStore]
  );

  const isConnected = useChatStore((state) => state.isConnected);
  const isStreaming = useChatStore((state) => state.isStreaming);

  return {
    sendMessage,
    orchestrate,
    isConnected,
    isStreaming,
  };
}
