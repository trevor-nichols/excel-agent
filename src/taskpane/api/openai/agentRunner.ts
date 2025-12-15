/**
 * File: src/taskpane/api/openai/agentRunner.ts
 * Sections: helpers, streaming runner, public API.
 * Purpose: Bridge the Agents SDK run loop to the taskpane UI.
 */

import { run, Agent } from "@openai/agents";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

const buildInputFromMessages = (messages: ChatMessage[]) =>
  messages.map((m) => `${m.role}: ${m.content}`).join("\n");

export type RunAgentStreamingOptions = {
  onTextDelta?: (text: string) => void;
  onToolEvent?: (event: any) => void;
  trace?: boolean;
};

/**
 * Run the agent with streaming enabled; emit deltas and accumulate final text.
 */
export async function runAgentStreaming(
  agent: Agent,
  messages: ChatMessage[],
  opts?: RunAgentStreamingOptions
): Promise<string> {
  const input = buildInputFromMessages(messages);
  const stream = await run(agent, input, { stream: true });

  let finalText = "";

  for await (const event of stream as any) {
    if (opts?.trace) {
      console.debug("[agent stream]", event);
    }

    if (event?.type === "response.output_text.delta") {
      const delta = event.delta ?? event.text ?? "";
      finalText += delta;
      opts?.onTextDelta?.(finalText);
    }

    if (event?.type === "response.function_call_arguments.delta") {
      opts?.onToolEvent?.(event);
    }

    if (event?.type === "response.output_text.done" && event.output_text) {
      finalText = event.output_text;
      opts?.onTextDelta?.(finalText);
    }

    if (event?.type === "response.final_output" && event.finalOutput) {
      finalText =
        typeof event.finalOutput === "string"
          ? event.finalOutput
          : JSON.stringify(event.finalOutput);
      opts?.onTextDelta?.(finalText);
    }
  }

  // If no stream events produced output, fall back to non-stream run.
  if (!finalText) {
    const result = (await run(agent, input)) as any;
    finalText =
      result?.finalOutput ||
      result?.output_text ||
      result?.output?.[0]?.content?.[0]?.text ||
      "";
    opts?.onTextDelta?.(finalText);
  }

  return finalText;
}

