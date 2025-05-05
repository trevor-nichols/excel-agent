/**
 * File: src/taskpane/hooks/useChatMessages.ts
 * Custom hook for managing chat messages
 * Dependencies: React
 * Used by: ChatInterface component
 */

import * as React from "react";

export interface Message {
  text: string;
  isUser: boolean;
  taggedWorksheets?: string[];
  timestamp?: Date;
}

/**
 * Custom hook for managing chat messages state and operations
 */
export function useChatMessages() {
  const [messages, setMessages] = React.useState<Message[]>([]);

  /**
   * Add a user message to the chat
   */
  const addUserMessage = (text: string, taggedWorksheets?: string[]) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { 
        text, 
        isUser: true, 
        taggedWorksheets,
        timestamp: new Date() 
      }
    ]);
  };

  /**
   * Add an assistant (AI) message to the chat
   */
  const addAssistantMessage = (text: string) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { 
        text, 
        isUser: false,
        timestamp: new Date()
      }
    ]);
  };

  /**
   * Add an error message to the chat (displayed as assistant message)
   */
  const addErrorMessage = (text: string) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { 
        text: `Error: ${text}`, 
        isUser: false,
        timestamp: new Date()
      }
    ]);
  };

  /**
   * Clear all messages from the chat
   */
  const clearMessages = () => {
    setMessages([]);
  };

  return {
    messages,
    addUserMessage,
    addAssistantMessage,
    addErrorMessage,
    clearMessages
  };
} 