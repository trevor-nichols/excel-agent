/**
 * File: src/taskpane/api/index.ts
 * Main index file for all API operations
 * Used to simplify imports throughout the application
 */

// Re-export everything from the Excel module
export * from "./excel";

// Re-export everything from the OpenAI module
export * from "./openai"; 

// Re-export embedding operations
export { embedWorksheet, embedAllWorksheets, initializeOpenAI } from "./openai/embeddingOperations"; 