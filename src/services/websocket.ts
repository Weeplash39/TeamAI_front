import type { WebSocketMessage, AgentId, LLMConfig } from "../types";

export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageHandlers: Set<(message: WebSocketMessage) => void> = new Set();
  private connectionHandlers: Set<(connected: boolean) => void> = new Set();

  constructor(
    private projectId: string,
    private baseUrl: string = import.meta.env.DEV
      ? "ws://localhost:8000/api" // Dev : direct vers le backend
      : `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${
          window.location.host
        }/api` // Prod : même domaine
  ) {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const clientId = `web_${Date.now()}`;
      const url = `${this.baseUrl}/ws/chat/${this.projectId}?client_id=${clientId}`;

      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log("✅ WebSocket connected");
        this.reconnectAttempts = 0;
        this.notifyConnection(true);
        resolve();
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.notifyHandlers(message);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        reject(error);
      };

      this.ws.onclose = () => {
        console.log("❌ WebSocket disconnected");
        this.notifyConnection(false);
        this.attemptReconnect();
      };
    });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  sendMessage(message: {
    type: "chat" | "orchestrate" | "ping";
    message?: string;
    agent_id?: AgentId;
    mode?: string;
    llm_config?: LLMConfig;
  }): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error("WebSocket is not connected");
    }
  }

  onMessage(handler: (message: WebSocketMessage) => void): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  onConnection(handler: (connected: boolean) => void): () => void {
    this.connectionHandlers.add(handler);
    return () => this.connectionHandlers.delete(handler);
  }

  private notifyHandlers(message: WebSocketMessage): void {
    this.messageHandlers.forEach((handler) => handler(message));
  }

  private notifyConnection(connected: boolean): void {
    this.connectionHandlers.forEach((handler) => handler(connected));
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
      );

      setTimeout(() => {
        this.connect().catch((error) => {
          console.error("Reconnection failed:", error);
        });
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  // Heartbeat
  startHeartbeat(interval: number = 30000): void {
    setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.sendMessage({ type: "ping" });
      }
    }, interval);
  }
}
