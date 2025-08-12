/**
 * File: src/taskpane/api/openai/tools/categories/worksheetTools.ts
 * Contains tool definitions for worksheet operations in Excel
 * Dependencies: OpenAI types
 * Used by: toolDefinitions.ts to create the complete set of tools
 */

import type { ChatCompletionTool } from "../../../../types/openai";

/**
 * Gets tool definitions for worksheet operations
 */
export function getWorksheetTools(): ChatCompletionTool[] {
  return [
    {
      type: "function",
      function: {
        name: "manage_worksheet",
        description: "Create a new worksheet or delete an existing one in Excel",
        parameters: {
          type: "object",
          properties: {
            action: {
              type: "string",
              enum: ["create", "delete"],
              description: "The action to perform on the worksheet",
            },
            sheetName: {
              type: "string",
              description: "The name of the worksheet to create or delete",
            },
          },
          required: ["action", "sheetName"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "get_worksheet_names",
        description: "Get the names of all worksheets in the current workbook",
        parameters: {
          type: "object",
          properties: {},
          required: [],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "get_active_worksheet_name",
        description: "Get the name of the currently active worksheet",
        parameters: {
          type: "object",
          properties: {},
          required: [],
        },
      },
    },
  ];
} 