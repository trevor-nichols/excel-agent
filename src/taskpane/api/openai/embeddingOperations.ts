/**
 * File: src/taskpane/api/openai/embeddingOperations.ts
 * Contains functions for creating embeddings from Excel data
 * Dependencies: OpenAI server API, Excel API
 * Used by: ChatInterface for creating vector representations of worksheet data
 */

import { createEmbedding } from "./client";
import { getCurrentSheetContent, getWorksheetNames } from "../excel";

// Cache for storing worksheet embeddings to avoid regenerating them
const embeddingCache: Record<string, { embedding: number[], timestamp: number }> = {};
// Cache expiration time (30 minutes)
const CACHE_EXPIRATION_MS = 30 * 60 * 1000;

/**
 * Initialize OpenAI (no-op on client; keys kept server-side)
 */
export function initializeOpenAI(): void {
  // No-op: embeddings are requested via server API now
}

/**
 * Get an embedding for a given text string via server API
 */
async function getEmbedding(text: string): Promise<number[]> {
  const res = await createEmbedding({ input: text });
  return res.embedding;
}

/**
 * Create embeddings for a specific worksheet, with caching
 */
export async function embedWorksheet(worksheetName: string): Promise<number[]> {
  const cacheEntry = embeddingCache[worksheetName];
  const now = Date.now();

  if (cacheEntry && (now - cacheEntry.timestamp) < CACHE_EXPIRATION_MS) {
    return cacheEntry.embedding;
  }

  const sheetContent = await getCurrentSheetContent({ includeMetadata: true, sheetName: worksheetName });
  const embedding = await getEmbedding(sheetContent);

  embeddingCache[worksheetName] = { embedding, timestamp: now };
  return embedding;
}

/**
 * Create embeddings for all worksheets in the workbook
 */
export async function embedAllWorksheets(): Promise<{ [key: string]: number[] }> {
  const worksheetNames = await getWorksheetNames();
  const embeddings: { [key: string]: number[] } = {};

  for (const name of worksheetNames) {
    try {
      const embedding = await embedWorksheet(name);
      embeddings[name] = embedding;
    } catch (error) {
      // continue
    }
  }

  return embeddings;
} 