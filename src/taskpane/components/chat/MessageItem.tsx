/**
 * File: src/taskpane/components/chat/MessageItem.tsx
 * Individual message component for chat interface
 * Dependencies: React, FluentUI, MarkdownRenderer
 * Used by: MessageList component
 */

import * as React from "react";
import { mergeClasses, Text, Badge } from "@fluentui/react-components";
import { Person24Regular, TabDesktop24Regular } from "@fluentui/react-icons";
import MarkdownRenderer from "./MarkdownRenderer";
import "./styles/chat.css";

export interface MessageItemProps {
  isUser: boolean;
  children: React.ReactNode;
  worksheetNames: string[];
  taggedWorksheets?: string[];
}

const MessageItem: React.FC<MessageItemProps> = ({ 
  isUser, 
  children, 
  worksheetNames,
  taggedWorksheets = [] 
}) => {
  // Function to highlight worksheet mentions after markdown rendering
  const renderWorksheetMentions = () => {
    if (typeof children !== 'string') return children;
    
    // First render markdown with worksheet names for highlighting
    return (
      <div className="message-with-mentions">
        <MarkdownRenderer 
          worksheetNames={worksheetNames}
        >
          {children}
        </MarkdownRenderer>
      </div>
    );
  };

  return (
    <div className={mergeClasses(
      "message-item",
      isUser ? "user-message" : "assistant-message"
    )}>
      <div className={mergeClasses(
        "message-avatar",
        isUser ? "user-avatar" : "assistant-avatar"
      )}>
        {isUser ? <Person24Regular /> : <TabDesktop24Regular />}
      </div>
      
      <div className="message-content">
        <div className="message-sender">
          {isUser ? "You" : "Excel Assistant"}
        </div>
        
        {taggedWorksheets && taggedWorksheets.length > 0 && (
          <div className="worksheet-badges">
            {taggedWorksheets.map(sheet => (
              <span key={sheet} className="worksheet-badge">
                <TabDesktop24Regular fontSize={12} />
                <Text size={100}>@{sheet}</Text>
              </span>
            ))}
          </div>
        )}
        
        <div className="message-text">
          {renderWorksheetMentions()}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
