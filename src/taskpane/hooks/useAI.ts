/**
 * File: src/taskpane/hooks/useAI.ts
 * Custom hook for managing AI interactions with OpenAI
 * Dependencies: server OpenAI API, useOpenAITools hook
 * Used by: ChatInterface component
 */

import * as React from "react";
import { useOpenAITools } from "./useOpenAITools";
import { createChatCompletion, getToolDefinitions } from "../api/openai/client";
import type { ChatMessage, ChatCompletionTool, ToolCall } from "../types/openai";

export function useAI() {
  const { executeTool } = useOpenAITools();

  /**
   * Process tool calls sequentially with dependent results
   */
  const processDependentToolCalls = async (
    systemMessage: ChatMessage,
    messages: ChatMessage[],
    tools: ChatCompletionTool[],
    responseMessage: ChatMessage
  ): Promise<ChatMessage> => {
    if (!responseMessage.tool_calls || responseMessage.tool_calls.length === 0) {
      return responseMessage;
    }

    const toolCall: ToolCall = responseMessage.tool_calls[0];
    const result = await executeTool({ id: toolCall.id, function: toolCall.function });

    const toolResult: ChatMessage = {
      role: "tool",
      tool_call_id: toolCall.id,
      content: typeof result === "string" ? result : JSON.stringify(result),
    };

    const updatedMessages: ChatMessage[] = [
      systemMessage,
      ...messages,
      { role: "assistant", content: "", tool_calls: [toolCall] },
      toolResult,
    ];

    const next = await createChatCompletion({
      messages: updatedMessages,
      tools,
    });

    return processDependentToolCalls(systemMessage, messages, tools, next.message);
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
    const systemMessage: ChatMessage = {
      role: "system",
      content: `You are an AI assistant for Excel. You can help users analyze data, create charts, and perform operations in Excel.
      ${activeWorksheet ? `The active worksheet is "${activeWorksheet}".` : "I don't know which worksheet is active."}
      ${selectedRange ? `The user has selected range: ${selectedRange}.` : "No range is currently selected."}
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
      If you're asked to perform an operation and you need more information, ask for it.`,
    };

    const rangeInfo = selectedRange
      ? {
          address: selectedRange,
          rowCount: 0,
          columnCount: 0,
        }
      : undefined;

    const tools = getToolDefinitions(rangeInfo);

    const chatMessages: ChatMessage[] = [systemMessage, ...messages];

    try {
      const initial = await createChatCompletion({ messages: chatMessages, tools });
      const responseMessage = initial.message;

      if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
        return await processDependentToolCalls(systemMessage, messages as ChatMessage[], tools, responseMessage);
      }

      return responseMessage;
    } catch (error) {
      console.error("Error sending message to OpenAI:", error);
      throw error;
    }
  };

  return { sendMessageToAI };
} 