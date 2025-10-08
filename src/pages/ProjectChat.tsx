import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Settings, Wifi, WifiOff } from "lucide-react";
import { useProject } from "../hooks/useProjects";
import { useWebSocket } from "../hooks/useWebSocket";
import { useChatStore } from "../store/chatStore";
import { useSettingsStore } from "../store/settingsStore";
import { Button } from "../components/common/Button";
import { ChatContainer } from "../components/chat/ChatContainer";
import { ChatInput } from "../components/chat/ChatInput";
import { AgentSelector } from "../components/agents/AgentSelector";
import { ModeSelector } from "../components/agents/ModeSelector";

export function ProjectChat() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { project, isLoading } = useProject(projectId!);
  const { selectedAgent, selectedMode, isConnected, isStreaming } =
    useChatStore();
  const { llmConfig } = useSettingsStore();

  const { sendMessage } = useWebSocket({
    projectId: projectId!,
    onConnect: () => console.log("Connected to WebSocket"),
    onDisconnect: () => console.log("Disconnected from WebSocket"),
    onError: (error) => console.error("WebSocket error:", error),
  });

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

  const handleSendMessage = (message: string) => {
    sendMessage(message, selectedAgent, llmConfig);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
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

          {/* Status */}
          <div className="mt-3 flex items-center gap-2 text-sm">
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4 text-green-600" />
                <span className="text-green-600">Connecté</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-600" />
                <span className="text-red-600">Déconnecté</span>
              </>
            )}
          </div>
        </div>

        {/* Configuration */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <AgentSelector />
          <ModeSelector />

          {/* LLM Config */}
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

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header Chat */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Chat avec les Agents
              </h1>
              <p className="text-sm text-gray-500">
                Mode: {selectedMode} • Agent: {selectedAgent}
              </p>
            </div>
            <Button variant="secondary" size="sm">
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
              ? "Agent en train de répondre..."
              : "Tapez votre message..."
          }
        />
      </div>
    </div>
  );
}
