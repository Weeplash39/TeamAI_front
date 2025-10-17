import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useChatStore } from "../../store/chatStore";
import { ChatMessage } from "./ChatMessage";

export function ChatContainer() {
  const { projectId } = useParams<{ projectId: string }>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Récupérer les messages du projet actuel
  const messages = useChatStore((state) => state.getMessages(projectId || ""));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!projectId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">Aucun projet sélectionné</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Commencez une conversation
          </h3>
          <p className="text-gray-600">
            Posez une question ou décrivez ce que vous souhaitez accomplir. Les
            agents sont prêts à vous aider !
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
