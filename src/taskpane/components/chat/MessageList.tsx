/**
 * File: src/taskpane/components/chat/MessageList.tsx
 * Message list component for displaying all chat messages
 * Dependencies: React, FluentUI, MessageItem component
 * Used by: ChatInterface component
 */

import * as React from "react";
import MessageItem from "./MessageItem";
import TypingIndicator from "./TypingIndicator";
import { Message } from "../../hooks/useChatMessages";
import "./styles/chat.css";

// Props interface for the MessageList component
interface MessageListProps {
  messages: Message[];
  worksheetNames: string[];
  isTyping?: boolean;
  streamingAssistantText?: string;
}

const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  worksheetNames, 
  isTyping = false,
  streamingAssistantText = ""
}) => {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change or when typing indicator appears/disappears
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, streamingAssistantText]);

  // Show empty state when there are no messages
  if (messages.length === 0) {
    return (
      <div className="message-list">
        <div className="empty-state">
          <div className="empty-state-icon">💬</div>
          <p>Ask me anything about your Excel data!</p>
          <p>Use @worksheetname to reference specific sheets.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="message-list">
      {messages.map((message, index) => (
        <MessageItem 
          key={index} 
          isUser={message.isUser} 
          worksheetNames={worksheetNames}
          taggedWorksheets={message.taggedWorksheets}
        >
          {message.text}
        </MessageItem>
      ))}
      
      {isTyping && (
        streamingAssistantText ? (
          <MessageItem 
            isUser={false} 
            worksheetNames={worksheetNames}
          >
            {streamingAssistantText}
          </MessageItem>
        ) : (
          <div className="typing-indicator">
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
          </div>
        )
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
