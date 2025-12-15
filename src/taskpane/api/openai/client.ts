/**
 * File: src/taskpane/api/openai/client.ts
 * Purpose: Centralized OpenAI client creation for the taskpane.
 * Notes: Uses env- or caller-supplied API keys; no secrets are hard-coded.
 * Dependencies: OpenAI SDK
 */

import OpenAI from "openai";
import { getToolDefinitions } from "./tools/toolDefinitions";

const DEFAULT_MODEL = "gpt-5.1";

/**
 * Initialize and return an OpenAI client with the provided API key.
 * Fails fast if no key is available to avoid silent insecure fallbacks.
 */
export function getOpenAIClient(apiKey?: string) {
  const key =
    apiKey ||
    (globalThis as any)?.process?.env?.OPENAI_API_KEY ||
    (globalThis as any)?.OPENAI_API_KEY;

  if (!key) {
    throw new Error(
      "OpenAI API key is required. Set OPENAI_API_KEY or pass one explicitly."
    );
  }

  return new OpenAI({
    apiKey: key,
    // Office add-ins run in-browser; keep enabled but avoid bundling secrets.
    dangerouslyAllowBrowser: true,
  });
}

export { DEFAULT_MODEL, getToolDefinitions };