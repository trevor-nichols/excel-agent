/**
 * File: src/taskpane/api/openai/client.ts
 * Provides functions for initializing and managing the OpenAI client
 * Dependencies: OpenAI SDK
 * Used by: useAI hook, embedding operations
 */

import OpenAI from "openai";
import { getToolDefinitions } from "./tools/toolDefinitions";

// Hard-coded API key as requested
const OPENAI_API_KEY = "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";

/**
 * Initialize and return an OpenAI client with the provided API key
 * If no API key is provided, it will use the hard-coded key
 */
export function getOpenAIClient(apiKey?: string): OpenAI {
  // Use provided API key or fall back to hard-coded key
  const key = apiKey || OPENAI_API_KEY;
  
  if (!key) {
    throw new Error("OpenAI API key is required.");
  }
  
  return new OpenAI({
    apiKey: key,
    dangerouslyAllowBrowser: true // Required for client-side usage in Office Add-ins
  });
}

/**
 * Re-export getToolDefinitions from the new modular structure
 * This maintains backward compatibility for any existing code
 */
export { getToolDefinitions }; 