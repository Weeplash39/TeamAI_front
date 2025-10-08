import type { Agent } from "../../types";

interface AgentCardProps {
  agent: Agent;
  onClick?: () => void;
}

export function AgentCard({ agent, onClick }: AgentCardProps) {
  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      "#FF6B6B": "bg-red-50 border-red-200 text-red-700",
      "#4ECDC4": "bg-teal-50 border-teal-200 text-teal-700",
      "#45B7D1": "bg-blue-50 border-blue-200 text-blue-700",
      "#96CEB4": "bg-green-50 border-green-200 text-green-700",
    };
    return colorMap[color] || "bg-gray-50 border-gray-200 text-gray-700";
  };

  return (
    <div
      onClick={onClick}
      className={`
        p-6 rounded-lg border-2 transition-all
        ${getColorClasses(agent.color)}
        ${onClick ? "cursor-pointer hover:shadow-md" : ""}
      `}
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{agent.icon}</span>
        <div>
          <h3 className="font-bold text-lg">{agent.name}</h3>
          <p className="text-sm opacity-75">{agent.role}</p>
        </div>
      </div>

      <div className="mt-4">
        <h4 className="text-xs font-semibold uppercase opacity-75 mb-2">
          Capacités
        </h4>
        <ul className="space-y-1">
          {agent.capabilities.slice(0, 3).map((capability, index) => (
            <li key={index} className="text-xs flex items-start gap-2">
              <span className="opacity-50">•</span>
              <span>{capability}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
