/**
 * File: src/taskpane/api/openai/embeddingOperations.ts
 * Contains functions for creating embeddings from Excel data
 * Dependencies: OpenAI SDK, Excel API
 * Used by: ChatInterface for creating vector representations of worksheet data
 */

import OpenAI from "openai";
import { getCurrentSheetContent, getWorksheetNames } from "../excel";

// Cache for storing worksheet embeddings to avoid regenerating them
const embeddingCache: Record<string, { embedding: number[], timestamp: number }> = {};
// Cache expiration time (30 minutes)
const CACHE_EXPIRATION_MS = 30 * 60 * 1000;

/**
 * Initialize an OpenAI client instance with the provided API key
 */
export function initializeOpenAI(apiKey: string) {
  return new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
}

/**
 * Get an embedding for a given text string
 */
async function getEmbedding(openai: OpenAI, text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-large",
      input: text,
      encoding_format: "float",
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error("Error getting embedding:", error);
    throw error;
  }
}

/**
 * Create embeddings for a specific worksheet, with caching
 */
export async function embedWorksheet(openai: OpenAI, worksheetName: string): Promise<number[]> {
  try {
    // Check if we have a fresh cache entry
    const cacheEntry = embeddingCache[worksheetName];
    const now = Date.now();
    
    if (cacheEntry && (now - cacheEntry.timestamp) < CACHE_EXPIRATION_MS) {
      console.log(`Using cached embedding for worksheet "${worksheetName}"`);
      return cacheEntry.embedding;
    }
    
    console.log(`Generating embedding for worksheet "${worksheetName}"`);
    const sheetContent = await getCurrentSheetContent({ includeMetadata: true, sheetName: worksheetName });
    const embedding = await getEmbedding(openai, sheetContent);
    
    // Cache the embedding
    embeddingCache[worksheetName] = {
      embedding,
      timestamp: now
    };
    
    return embedding;
  } catch (error) {
    console.error(`Error embedding worksheet "${worksheetName}":`, error);
    throw error;
  }
}

/**
 * Create embeddings for tagged worksheets in a message
 */
export async function embedTaggedWorksheets(
  openai: OpenAI, 
  taggedWorksheets: string[]
): Promise<Record<string, number[]>> {
  const embeddings: Record<string, number[]> = {};
  
  for (const worksheetName of taggedWorksheets) {
    try {
      const embedding = await embedWorksheet(openai, worksheetName);
      embeddings[worksheetName] = embedding;
    } catch (error) {
      console.error(`Error embedding worksheet ${worksheetName}:`, error);
    }
  }
  
  return embeddings;
}

/**
 * Identify worksheet mentions in text
 */
export function extractWorksheetMentions(
  text: string, 
  worksheetNames: string[]
): string[] {
  const mentions: string[] = [];
  const mentionRegex = /@(\w+)/g;
  let match;
  
  while ((match = mentionRegex.exec(text)) !== null) {
    const mentionedName = match[1];
    
    // Check if the mention is a valid worksheet name
    const matchedWorksheet = worksheetNames.find(
      name => name.toLowerCase() === mentionedName.toLowerCase()
    );
    
    if (matchedWorksheet && !mentions.includes(matchedWorksheet)) {
      mentions.push(matchedWorksheet);
    }
  }
  
  return mentions;
}

/**
 * Create embeddings for all worksheets in the workbook
 */
export async function embedAllWorksheets(openai: OpenAI): Promise<{ [key: string]: number[] }> {
  const worksheetNames = await getWorksheetNames();
  const embeddings: { [key: string]: number[] } = {};

  for (const name of worksheetNames) {
    try {
      const embedding = await embedWorksheet(openai, name);
      embeddings[name] = embedding;
    } catch (error) {
      console.error(`Error embedding worksheet ${name}:`, error);
      // Continue with other worksheets even if one fails
    }
  }

  return embeddings;
} 