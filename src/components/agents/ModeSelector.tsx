import { useChatStore } from "../../store/chatStore";
import type { WorkMode } from "../../types";

const MODES = [
  {
    id: "consultation" as WorkMode,
    name: "Consultation",
    icon: "💬",
    description: "Un seul agent répond à votre question",
    color: "bg-blue-50 border-blue-200",
  },
  {
    id: "collaboration" as WorkMode,
    name: "Collaboration",
    icon: "🤝",
    description: "Plusieurs agents travaillent en séquence",
    color: "bg-purple-50 border-purple-200",
  },
  {
    id: "validation" as WorkMode,
    name: "Validation",
    icon: "✅",
    description: "Chaîne de validation hiérarchique",
    color: "bg-green-50 border-green-200",
  },
  {
    id: "exploration" as WorkMode,
    name: "Exploration",
    icon: "🔍",
    description: "Analyse parallèle multi-perspectives",
    color: "bg-orange-50 border-orange-200",
  },
];

export function ModeSelector() {
  const { selectedMode, setSelectedMode } = useChatStore();

  console.log("🎭 ModeSelector render - selectedMode:", selectedMode);

  const handleSelect = (mode: WorkMode) => {
    console.log("👆 Click mode:", mode);
    setSelectedMode(mode);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Mode de travail
      </label>
      <div className="grid grid-cols-2 gap-3">
        {MODES.map((mode) => {
          const isSelected = selectedMode === mode.id;

          return (
            <button
              key={mode.id}
              onClick={() => handleSelect(mode.id)}
              type="button"
              className={`
                flex items-start gap-3 p-3 rounded-lg border-2 transition-all
                ${
                  isSelected
                    ? `${mode.color} border-opacity-100 shadow-md ring-2 ring-primary-500 ring-opacity-50`
                    : "bg-white border-gray-200 hover:border-gray-300"
                }
              `}
            >
              <span className="text-xl">{mode.icon}</span>
              <div className="flex-1 text-left">
                <div className="font-semibold text-sm">{mode.name}</div>
                <div className="text-xs text-gray-600 mt-1">
                  {mode.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
