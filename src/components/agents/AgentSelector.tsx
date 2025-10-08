import { useChatStore } from "../../store/chatStore";
import type { AgentId } from "../../types";

const AGENTS = [
  {
    id: "ceo" as AgentId,
    name: "CEO",
    icon: "👔",
    color: "bg-red-100 text-red-700 border-red-300",
    description: "Vision stratégique et décisions business",
  },
  {
    id: "cto" as AgentId,
    name: "CTO",
    icon: "🏗️",
    color: "bg-blue-100 text-blue-700 border-blue-300",
    description: "Architecture technique et supervision",
  },
  {
    id: "frontend_dev" as AgentId,
    name: "Frontend Dev",
    icon: "🎨",
    color: "bg-purple-100 text-purple-700 border-purple-300",
    description: "Développement interface utilisateur",
  },
  {
    id: "backend_dev" as AgentId,
    name: "Backend Dev",
    icon: "⚙️",
    color: "bg-green-100 text-green-700 border-green-300",
    description: "Développement APIs et services",
  },
];

export function AgentSelector() {
  const { selectedAgent, setSelectedAgent } = useChatStore();

  console.log("🎯 AgentSelector render - selectedAgent:", selectedAgent);

  const handleSelect = (agentId: AgentId) => {
    console.log("👆 Click agent:", agentId);
    setSelectedAgent(agentId);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Sélectionner un agent
      </label>
      <div className="grid grid-cols-2 gap-3">
        {AGENTS.map((agent) => {
          const isSelected = selectedAgent === agent.id;

          return (
            <button
              key={agent.id}
              onClick={() => handleSelect(agent.id)}
              type="button"
              className={`
                flex items-start gap-3 p-4 rounded-lg border-2 transition-all
                ${
                  isSelected
                    ? `${agent.color} border-opacity-100 shadow-md`
                    : "bg-white border-gray-200 hover:border-gray-300"
                }
              `}
            >
              <span className="text-2xl">{agent.icon}</span>
              <div className="flex-1 text-left">
                <div className="font-semibold text-sm">{agent.name}</div>
                <div className="text-xs text-gray-600 mt-1">
                  {agent.description}
                </div>
              </div>
              {isSelected && (
                <svg
                  className="w-5 h-5 text-green-600 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
