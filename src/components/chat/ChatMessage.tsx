import { clsx } from "clsx";
import type { ChatMessage as ChatMessageType } from "../../types";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.type === "user";
  const isNotification = message.type === "notification";
  const isError = message.type === "error";
  const isSystem = message.type === "system";

  return (
    <div
      className={clsx("mb-4 p-4 rounded-lg", {
        "bg-primary-600 text-white ml-auto max-w-[80%]": isUser,
        "bg-gray-100 text-gray-900 mr-auto max-w-[80%]":
          message.type === "agent",
        "bg-yellow-50 text-yellow-800 border border-yellow-200": isNotification,
        "bg-red-50 text-red-800 border border-red-200": isError,
        "bg-blue-50 text-blue-800 border border-blue-200": isSystem,
      })}
    >
      {message.agent_name && !isUser && (
        <div className="text-xs font-semibold mb-1 opacity-70">
          {message.agent_name}
        </div>
      )}

      <div className="whitespace-pre-wrap">{message.content}</div>

      <div className="text-xs opacity-60 mt-2">
        {new Date(message.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
}
