export type ChatRole = "system" | "user" | "assistant" | "tool";

export interface ToolFunctionCall {
  name: string;
  arguments: string; // JSON string
}

export interface ToolCall {
  id: string;
  type: "function";
  function: ToolFunctionCall;
}

export interface ChatMessage {
  role: ChatRole;
  content: string;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}

export interface ChatCompletionToolFunctionSchema {
  name: string;
  description?: string;
  parameters: unknown; // JSON Schema
}

export interface ChatCompletionTool {
  type: "function";
  function: ChatCompletionToolFunctionSchema;
}