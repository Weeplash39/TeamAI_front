import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Settings, Wifi, WifiOff } from "lucide-react";
import { useProject } from "../hooks/useProjects";
import {
  WebSocketProvider,
  useWebSocketContext,
} from "../contexts/WebSocketContext";
import { useChatStore } from "../store/chatStore";
import { useSettingsStore } from "../store/settingsStore";
import { Button } from "../components/common/Button";
import { ChatContainer } from "../components/chat/ChatContainer";
import { ChatInput } from "../components/chat/ChatInput";
import { AgentSelector } from "../components/agents/AgentSelector";
import { ModeSelector } from "../components/agents/ModeSelector";

// Composant interne qui utilise le WebSocket
function ProjectChatInner() {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const { project } = useProject(projectId!);
  const { selectedAgent, selectedMode } = useChatStore();
  const { llmConfig } = useSettingsStore();

  // Utiliser le context WebSocket
  const { sendMessage, orchestrate, isConnected, isStreaming } =
    useWebSocketContext();

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-xl font-semibold mb-2">Projet non trouvé</h3>
          <Button onClick={() => navigate("/")}>Retour au dashboard</Button>
        </div>
      </div>
    );
  }

  // Gérer l'envoi de message selon le mode
  const handleSendMessage = (message: string) => {
    console.log(
      "📤 Envoi message, mode:",
      selectedMode,
      "agent:",
      selectedAgent
    );

    // Mode consultation = 1 seul agent
    if (selectedMode === "consultation") {
      console.log("💬 Mode consultation → sendMessage");
      sendMessage(message, selectedAgent, llmConfig);
    }
    // Autres modes = orchestration multi-agents
    else {
      console.log("🎭 Mode", selectedMode, "→ orchestrate");
      orchestrate(message, selectedMode, selectedAgent, llmConfig);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* ========== SIDEBAR ========== */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header Sidebar */}
        <div className="p-4 border-b border-gray-200">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate("/")}
            className="mb-3"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>

          <h2 className="font-bold text-lg text-gray-900 mb-1">
            {project.name}
          </h2>
          <p className="text-sm text-gray-500">{project.project_id}</p>

          {/* Status de connexion */}
          <div className="mt-3 flex items-center gap-2 text-sm">
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4 text-green-600" />
                <span className="text-green-600 font-medium">Connecté</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-600" />
                <span className="text-red-600 font-medium">Déconnecté</span>
              </>
            )}
          </div>
        </div>

        {/* Configuration */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* ⚠️ IMPORTANT : AgentSelector */}
          <AgentSelector />

          {/* ⚠️ IMPORTANT : ModeSelector */}
          <ModeSelector />

          {/* Configuration LLM */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Configuration LLM
            </label>
            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-600">Provider:</span>
                <span className="font-semibold">{llmConfig.provider}</span>
              </div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-600">Modèle:</span>
                <span className="font-mono text-xs">{llmConfig.model}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Température:</span>
                <span className="font-semibold">{llmConfig.temperature}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========== CHAT AREA ========== */}
      <div className="flex-1 flex flex-col">
        {/* Header Chat */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Chat avec les Agents
              </h1>
              <p className="text-sm text-gray-500">
                Mode:{" "}
                <span className="font-semibold capitalize">{selectedMode}</span>
                {" • "}
                Agent:{" "}
                <span className="font-semibold uppercase">{selectedAgent}</span>
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate("/settings")}
            >
              <Settings className="w-4 h-4 mr-2" />
              Paramètres
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ChatContainer />

        {/* Input */}
        <ChatInput
          onSend={handleSendMessage}
          disabled={!isConnected || isStreaming}
          placeholder={
            !isConnected
              ? "Connexion en cours..."
              : isStreaming
              ? "Agent(s) en train de répondre..."
              : selectedMode === "consultation"
              ? "Posez votre question à l'agent..."
              : `Mode ${selectedMode} : plusieurs agents vont répondre...`
          }
        />
      </div>
    </div>
  );
}

// Composant principal avec Provider
export function ProjectChat() {
  const { projectId } = useParams<{ projectId: string }>();
  const { project, isLoading } = useProject(projectId!);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement du projet...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-xl font-semibold mb-2">Projet non trouvé</h3>
          <Button onClick={() => navigate("/")}>Retour au dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <WebSocketProvider projectId={projectId!}>
      <ProjectChatInner />
    </WebSocketProvider>
  );
}
