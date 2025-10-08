import { useState, KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { Button } from "../common/Button";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = "Tapez votre message...",
}: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="flex gap-3">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={3}
          className="
            flex-1 resize-none rounded-lg border border-gray-300 px-4 py-2
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            disabled:bg-gray-100 disabled:cursor-not-allowed
          "
        />
        <Button
          onClick={handleSubmit}
          disabled={disabled || !message.trim()}
          className="self-end"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
      <div className="mt-2 text-xs text-gray-500">
        Appuyez sur <kbd className="px-2 py-1 bg-gray-100 rounded">Enter</kbd>{" "}
        pour envoyer,{" "}
        <kbd className="px-2 py-1 bg-gray-100 rounded">Shift + Enter</kbd> pour
        une nouvelle ligne
      </div>
    </div>
  );
}
