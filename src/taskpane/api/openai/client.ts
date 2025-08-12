/**
 * File: src/taskpane/api/openai/client.ts
 * Provides functions for calling our server OpenAI proxy
 */

export interface CreateChatRequest {
  messages: import("../../types/openai").ChatMessage[];
  tools?: import("../../types/openai").ChatCompletionTool[];
  model?: string;
}

export interface CreateChatResponse {
  message: import("../../types/openai").ChatMessage;
}

const DEFAULT_MODEL = "gpt-4o-mini";

export async function createChatCompletion(body: CreateChatRequest): Promise<CreateChatResponse> {
  const response = await fetch("/api/openai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: body.model ?? DEFAULT_MODEL, messages: body.messages, tools: body.tools })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI chat error: ${response.status} ${text}`);
  }

  return response.json();
}

export interface CreateEmbeddingRequest {
  input: string;
  model?: string;
}

export interface CreateEmbeddingResponse {
  embedding: number[];
}

const DEFAULT_EMBED_MODEL = "text-embedding-3-large";

export async function createEmbedding(body: CreateEmbeddingRequest): Promise<CreateEmbeddingResponse> {
  const response = await fetch("/api/openai/embeddings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: body.model ?? DEFAULT_EMBED_MODEL, input: body.input })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI embedding error: ${response.status} ${text}`);
  }

  return response.json();
}

export { getToolDefinitions } from "./tools/toolDefinitions"; 