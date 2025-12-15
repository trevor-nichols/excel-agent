/**
 * File: src/taskpane/hooks/useAI.ts
 * Purpose: Bridge chat UI with the OpenAI Agents SDK + streaming.
 * Sections: agent creation, context prompt, streaming runner.
 */

import * as React from "react";
import { createExcelAgent } from "../api/openai/agent";
import { runAgentStreaming, RunAgentStreamingOptions } from "../api/openai/agentRunner";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

export function useAI() {
  const addContextMessage = (
    messages: ChatMessage[],
    selectedRange?: string,
    activeWorksheet?: string,
    taggedWorksheets?: string[]
  ) => {
    const contextParts = [
      activeWorksheet
        ? `Active worksheet: "${activeWorksheet}".`
        : "Active worksheet unknown.",
      selectedRange
        ? `Selected range: ${selectedRange}.`
        : "No selected range.",
      taggedWorksheets && taggedWorksheets.length > 0
        ? `Tagged worksheets: ${taggedWorksheets.join(", ")}.`
        : "No tagged worksheets.",
      "Read before write when unsure; avoid overwriting user data.",
    ];

    const contextMessage: ChatMessage = {
      role: "system",
      content: contextParts.join(" "),
    };

    return [contextMessage, ...messages];
  };

  /**
   * Send a message through the Agent with streaming output.
   */
  const sendMessageToAI = async (
    messages: ChatMessage[],
    selectedRange?: string,
    activeWorksheet?: string,
    taggedWorksheets?: string[],
    streamOptions?: Pick<RunAgentStreamingOptions, "onTextDelta" | "onToolEvent" | "trace">
  ) => {
    const agentWithContext = createExcelAgent({ activeWorksheet, selectedRange });
    const inputMessages = addContextMessage(messages, selectedRange, activeWorksheet, taggedWorksheets);

    try {
      const finalText = await runAgentStreaming(agentWithContext, inputMessages, streamOptions);
      return { role: "assistant" as const, content: finalText };
    } catch (error) {
      console.error("Error running agent:", error);
      throw error;
    }
  };

  return {
    sendMessageToAI,
  };
}