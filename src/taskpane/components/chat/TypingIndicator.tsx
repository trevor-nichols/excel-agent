/**
 * File: src/taskpane/components/chat/TypingIndicator.tsx
 * Typing indicator component to show when the AI is generating a response
 * Dependencies: React
 * Used by: MessageList component
 */

import * as React from "react";
import "./styles/chat.css";

const TypingIndicator: React.FC = () => {
  return (
    <div className="typing-indicator">
      <div className="typing-dot"></div>
      <div className="typing-dot"></div>
      <div className="typing-dot"></div>
    </div>
  );
};

export default TypingIndicator; 