import { useEffect, useState } from "react";

interface StreamingMessageProps {
  content: string;
  isComplete?: boolean;
}

export function StreamingMessage({
  content,
  isComplete = false,
}: StreamingMessageProps) {
  const [displayedContent, setDisplayedContent] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    setDisplayedContent(content);
  }, [content]);

  // Effet de curseur clignotant pendant le streaming
  useEffect(() => {
    if (!isComplete) {
      const interval = setInterval(() => {
        setCursorVisible((v) => !v);
      }, 500);
      return () => clearInterval(interval);
    } else {
      setCursorVisible(false);
    }
  }, [isComplete]);

  return (
    <div className="relative">
      <span className="whitespace-pre-wrap">{displayedContent}</span>
      {!isComplete && (
        <span
          className={`
            inline-block w-2 h-5 ml-1 bg-current align-middle
            ${cursorVisible ? "opacity-100" : "opacity-0"}
          `}
        />
      )}
    </div>
  );
}
