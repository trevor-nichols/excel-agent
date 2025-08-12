/**
 * File: src/taskpane/api/openai/tools/categories/cellTools.ts
 * Contains tool definitions for cell operations in Excel
 * Dependencies: OpenAI types
 * Used by: toolDefinitions.ts to create the complete set of tools
 */

import type { ChatCompletionTool } from "../../../../types/openai";

/**
 * Gets tool definitions for cell operations
 */
export function getCellTools(): ChatCompletionTool[] {
  return [
    {
      type: "function",
      function: {
        name: "write_to_excel",
        description: "Write values to a range of cells in Excel",
        parameters: {
          type: "object",
          properties: {
            startCell: {
              type: "string",
              description: "The starting cell address (e.g., 'A1')",
            },
            values: {
              type: "array",
              items: {
                type: "array",
                items: {
                  type: ["string", "number", "boolean", "null"],
                },
              },
              description: "The values to write to the cells. Should be a 2D array.",
            },
          },
          required: ["startCell", "values"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "read_from_excel",
        description: "Read a value from a specific cell in Excel",
        parameters: {
          type: "object",
          properties: {
            cellAddress: { type: "string", description: "The cell address to read from (e.g., 'A1', 'B2')." },
          },
          required: ["cellAddress"],
        },
      },
    }
  ];
} 