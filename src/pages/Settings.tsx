import { useState } from "react";
import { useSettingsStore } from "../store/settingsStore";
import { useLLMProviders } from "../hooks/useLLM";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";

export function Settings() {
  const { llmConfig, setLLMConfig, autoScroll, setAutoScroll } =
    useSettingsStore();
  const { providers, isLoading } = useLLMProviders();
  const [localConfig, setLocalConfig] = useState(llmConfig);

  const handleSave = () => {
    setLLMConfig(localConfig);
    alert("Configuration sauvegardée !");
  };

  const selectedProvider = providers.find((p) => p.id === localConfig.provider);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Paramètres</h1>

        <div className="space-y-6">
          {/* Configuration LLM */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">Configuration LLM</h2>

            {isLoading ? (
              <p className="text-gray-600">Chargement...</p>
            ) : (
              <div className="space-y-4">
                {/* Provider */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Provider
                  </label>
                  <select
                    value={localConfig.provider}
                    onChange={(e) =>
                      setLocalConfig({
                        ...localConfig,
                        provider: e.target.value as any,
                        model: "",
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    {providers.map((provider) => (
                      <option key={provider.id} value={provider.id}>
                        {provider.name} ({provider.type})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Modèle */}
                {selectedProvider && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Modèle
                    </label>
                    <select
                      value={localConfig.model}
                      onChange={(e) =>
                        setLocalConfig({
                          ...localConfig,
                          model: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Sélectionner un modèle...</option>
                      {selectedProvider.models.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.name} - {model.description} ({model.cost})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Température */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Température: {localConfig.temperature}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={localConfig.temperature}
                    onChange={(e) =>
                      setLocalConfig({
                        ...localConfig,
                        temperature: parseFloat(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Plus élevé = plus créatif, Plus bas = plus déterministe
                  </p>
                </div>
              </div>
            )}
          </Card>

          {/* Préférences Chat */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">Préférences Chat</h2>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-900">Auto-scroll</label>
                <p className="text-sm text-gray-500">
                  Défiler automatiquement vers le bas lors de nouveaux messages
                </p>
              </div>
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
                className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </Card>

          {/* Boutons */}
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setLocalConfig(llmConfig)}
            >
              Annuler
            </Button>
            <Button onClick={handleSave}>Sauvegarder</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
