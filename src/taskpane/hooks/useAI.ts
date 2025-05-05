/**
 * File: src/taskpane/hooks/useAI.ts
 * Custom hook for managing AI interactions with OpenAI
 * Dependencies: OpenAI SDK, useOpenAITools hook
 * Used by: ChatInterface component
 */

import * as React from "react";
import OpenAI from "openai";
import { useOpenAITools } from "./useOpenAITools";
import { getOpenAIClient, getToolDefinitions } from "../api/openai/client";

export function useAI() {
  const [openaiClient, setOpenaiClient] = React.useState<OpenAI | null>(null);
  const { executeTool, executeToolCalls } = useOpenAITools();

  /**
   * Process tool calls sequentially, allowing the AI to make dependent calls
   * based on the results of previous calls
   */
  const processDependentToolCalls = async (
    client: OpenAI,
    systemMessage: { role: "system"; content: string },
    messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
    tools: any[],
    responseMessage: OpenAI.Chat.Completions.ChatCompletionMessage,
    accumulatedToolResults: any[] = []
  ) => {
    // If no tool calls in the response, return the final response
    if (!responseMessage.tool_calls || responseMessage.tool_calls.length === 0) {
      return responseMessage;
    }

    // Only process one tool call at a time to enable dependent calls
    const toolCall = responseMessage.tool_calls[0];
    
    // Execute the single tool call
    const result = await executeTool(toolCall);
    
    // Format the result as a tool response
    const toolResult = {
      role: "tool" as const,
      tool_call_id: toolCall.id,
      content: typeof result === 'string' ? result : JSON.stringify(result),
    };
    
    // Add the result to accumulated results
    const updatedToolResults = [...accumulatedToolResults, toolResult];
    
    // Create updated message history with the assistant's tool call and the tool result
    const updatedMessages = [
      systemMessage,
      ...messages,
      {
        role: "assistant" as const,
        content: "",
        tool_calls: [toolCall]
      },
      toolResult
    ];
    
    // Get the next response from the model with the tool result
    const nextResponse = await client.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: updatedMessages,
      tools,
    });
    
    const nextResponseMessage = nextResponse.choices[0].message;
    
    // Recursively process any additional tool calls
    return processDependentToolCalls(
      client,
      systemMessage,
      messages,
      tools,
      nextResponseMessage,
      updatedToolResults
    );
  };

  /**
   * Send a message to OpenAI and handle the response
   */
  const sendMessageToAI = async (
    messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
    selectedRange?: string,
    activeWorksheet?: string,
    taggedWorksheets?: string[]
  ) => {
    // Initialize OpenAI client if not already initialized
    let client = openaiClient;
    if (!client) {
      try {
        client = getOpenAIClient();
        setOpenaiClient(client);
      } catch (error) {
        console.error("Error initializing OpenAI client:", error);
        throw new Error("Failed to initialize OpenAI client. Please check your .env file for a valid API key.");
      }
    }

    // Create system message with context
    const systemMessage = {
      role: "system" as const,
      content: `You are an AI assistant for Excel. You can help users analyze data, create charts, and perform operations in Excel.
      ${
        activeWorksheet 
          ? `The active worksheet is "${activeWorksheet}".` 
          : "I don't know which worksheet is active."
      }
      ${
        selectedRange 
          ? `The user has selected range: ${selectedRange}.` 
          : "No range is currently selected."
      }
      ${
        taggedWorksheets && taggedWorksheets.length > 0
          ? `The user has tagged the following worksheets for this question: ${taggedWorksheets.join(", ")}.
            Please consider these worksheets in your response and operations.`
          : ""
      }
      
      You have access to various Excel functions like reading data, writing data, formatting cells, and creating charts.
      Always be helpful, clear, and concise in your responses.
      When making sequential function calls, you can use the results of previous calls to inform your decisions.
      ***Before writing data to a cell or range, if you are unsure about existing content, use the 'read_from_excel' or 'read_range' function first to check the relevant area. Specify the exact cell or range address you need to inspect.***
      If you're asked to perform an operation and you need more information, ask for it.`
    };

    // Prepare range info object if selectedRange is available
    const rangeInfo = selectedRange ? {
      address: selectedRange,
      rowCount: 0,  // We would need to get this from the API
      columnCount: 0  // We would need to get this from the API
    } : undefined;

    // Get tool definitions
    const tools = getToolDefinitions(rangeInfo);

    // Send message to OpenAI
    try {
      const response = await client.chat.completions.create({
        model: "gpt-4o-2024-08-06",
        messages: [systemMessage, ...messages],
        tools,
      });

      const responseMessage = response.choices[0].message;

      // Check for tool calls and process them sequentially if present
      if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
        // Process tool calls sequentially and dependently
        return await processDependentToolCalls(
          client,
          systemMessage,
          messages,
          tools,
          responseMessage
        );
      }

      return responseMessage;
    } catch (error) {
      console.error("Error sending message to OpenAI:", error);
      throw error;
    }
  };

  return {
    sendMessageToAI
  };
} 