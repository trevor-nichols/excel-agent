/* global Office, console */

/**
 * File: src/taskpane/components/chat/ChatInterface.tsx
 * Main chat interface component for interacting with the AI assistant
 * Dependencies: React, FluentUI, OpenAI SDK, custom hooks (useChatMessages, useAI, useWorksheets)
 * Used by: App component as the main taskpane interface
 */

import * as React from "react";
import {
  Text,
  Card,
  Button,
  mergeClasses,
  Badge,
} from "@fluentui/react-components";
import {
  Dismiss20Regular,
  Lightbulb24Regular,
  ShieldError20Regular,
  PresenceAvailable16Filled,
} from "@fluentui/react-icons";
import MessageList from "./MessageList";
import UserInput from "./UserInput";
import { useChatMessages } from "../../hooks/useChatMessages";
import { useAI } from "../../hooks/useAI";
import { useWorksheets } from "../../hooks/useWorksheets";
import { 
  embedWorksheet,
  embedAllWorksheets
} from "../../api";
import { getSelectedRangeInfo } from "../../api/excel/cellOperations";
import { getOpenAIClient } from "../../api/openai/client";
import "./styles/chat.css";

/**
 * Props for the ChatInterface component
 */
export interface ChatInterfaceProps {
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Main chat interface component
 */
const ChatInterface: React.FC<ChatInterfaceProps> = ({ setIsLoading }) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showWelcome, setShowWelcome] = React.useState(true);

  // Custom hooks
  const { messages, addUserMessage, addAssistantMessage, addErrorMessage, clearMessages } = useChatMessages();
  const { sendMessageToAI } = useAI();
  const { worksheetNames, activeWorksheet } = useWorksheets();

  // Update parent loading state when local loading state changes
  React.useEffect(() => {
    setIsLoading(loading);
  }, [loading, setIsLoading]);

  // Hide welcome card after the first message
  React.useEffect(() => {
    if (messages.length > 0) {
      setShowWelcome(false);
    }
  }, [messages.length]);

  /**
   * Handle sending a message
   */
  const handleSendMessage = async (text: string, taggedWorksheets?: string[]) => {
    if (!text.trim()) return;

    try {
      // Add user message to chat
      addUserMessage(text, taggedWorksheets);
      setLoading(true);
      setError(null);

      // Special commands for embedding
      if (text.toLowerCase().includes("embed worksheet")) {
        await handleEmbedding(activeWorksheet);
        return;
      }

      if (text.toLowerCase().includes("embed all worksheets")) {
        await handleEmbedAllWorksheets();
        return;
      }

      // Get selected range info for context
      let selectedRangeInfo = "";
      try {
        const rangeInfo = await getSelectedRangeInfo();
        if (rangeInfo) {
          selectedRangeInfo = rangeInfo.address;
        }
      } catch (error) {
        console.error("Error getting selected range:", error);
      }

      // Create embeddings for any tagged worksheets
      if (taggedWorksheets && taggedWorksheets.length > 0) {
        const openai = getOpenAIClient();
        for (const worksheetName of taggedWorksheets) {
          try {
            // Pre-fetch the embeddings to ensure they're available
            await embedWorksheet(openai, worksheetName);
          } catch (error) {
            console.error(`Error embedding worksheet ${worksheetName}:`, error);
          }
        }
      }

      // Convert messages to the format expected by the OpenAI API
      const openaiMessages: Array<{ role: "user" | "assistant" | "system"; content: string }> = messages.map(msg => ({
        role: msg.isUser ? "user" as const : "assistant" as const,
        content: msg.text
      }));
      
      // Add the current message
      openaiMessages.push({
        role: "user" as const,
        content: text
      });

      // Add context about tagged worksheets
      if (taggedWorksheets && taggedWorksheets.length > 0) {
        // Add a system message with information about the tagged worksheets
        openaiMessages.unshift({
          role: "system" as const,
          content: `The user has tagged the following worksheets: ${taggedWorksheets.join(", ")}. 
          Relevant worksheet content has been embedded and is available for reference.`
        });
      }

      // Send message to AI and get response
      const response = await sendMessageToAI(
        openaiMessages,
        selectedRangeInfo,
        activeWorksheet,
        taggedWorksheets
      );

      // Add AI response to chat
      if (response && response.content) {
        addAssistantMessage(response.content);
      } else {
        addAssistantMessage("I've processed your request but encountered an issue providing a complete response.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setError(error instanceof Error ? error.message : "An error occurred while sending your message.");
      addErrorMessage(error instanceof Error ? error.message : "An error occurred while sending your message.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle embedding a worksheet
   */
  const handleEmbedding = async (worksheetName: string) => {
    try {
      setLoading(true);
      const openai = getOpenAIClient();
      await embedWorksheet(openai, worksheetName);
      addAssistantMessage(`Successfully created embedding for worksheet "${worksheetName}".`);
    } catch (error) {
      console.error("Error embedding worksheet:", error);
      addErrorMessage(`Failed to create embedding for worksheet "${worksheetName}". ${error instanceof Error ? error.message : ""}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle embedding all worksheets
   */
  const handleEmbedAllWorksheets = async () => {
    try {
      setLoading(true);
      const openai = getOpenAIClient();
      await embedAllWorksheets(openai);
      addAssistantMessage("Successfully created embeddings for all worksheets.");
    } catch (error) {
      console.error("Error embedding all worksheets:", error);
      addErrorMessage(`Failed to create embeddings for all worksheets. ${error instanceof Error ? error.message : ""}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-header-left">
          <Text size={500} weight="semibold">
            Excel AI Assistant
          </Text>
          <Badge className="header-badge" appearance="outline" color="informative">Beta</Badge>
        </div>
        <div className={mergeClasses("status-indicator", "status-active")}>
          <PresenceAvailable16Filled />
          <Text size={100}>Connected</Text>
        </div>
      </div>
      
      <div className="chat-body">
        {showWelcome && (
          <Card className="welcome-card">
            <div className="welcome-header">
              <Lightbulb24Regular className="welcome-icon" />
              <Text>Welcome to Excel AI Assistant</Text>
            </div>
            <div className="welcome-content">
              <Text>Here are some things you can ask me to do:</Text>
              <ul className="welcome-list">
                <li>Format selected cells as currency</li>
                <li>Create a pivot table from my data</li>
                <li>Generate a chart showing monthly sales</li>
                <li>Find the average of column B</li>
                <li>Help me write a VLOOKUP formula</li>
              </ul>
            </div>
          </Card>
        )}
        
        <MessageList 
          messages={messages} 
          worksheetNames={worksheetNames} 
          isTyping={loading}
        />
      </div>
      
      {error && (
        <div className="error-container">
          <ShieldError20Regular className="error-icon" />
          <Text>{error}</Text>
          <Button 
            appearance="transparent"
            icon={<Dismiss20Regular />}
            size="small"
            className="dismiss-button"
            onClick={() => setError(null)}
            aria-label="Dismiss error"
          />
        </div>
      )}
      
      <div className="chat-input-container">
        <UserInput
          onSendMessage={handleSendMessage}
          worksheetNames={worksheetNames}
          disabled={loading}
        />
      </div>
    </div>
  );
};

export default ChatInterface;
