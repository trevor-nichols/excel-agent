/**
 * File: src/taskpane/api/openai/tools/categories/formatTools.ts
 * Contains tool definitions for formatting operations in Excel
 * Dependencies: OpenAI types
 * Used by: toolDefinitions.ts to create the complete set of tools
 */

import type { ChatCompletionTool } from "../../../../types/openai";

/**
 * Gets tool definitions for formatting operations
 */
export function getFormatTools(): ChatCompletionTool[] {
  return [
    {
      type: "function",
      function: {
        name: "format_cell",
        description: "Format the appearance of a cell in Excel",
        parameters: {
          type: "object",
          properties: {
            cellAddress: { 
              type: "string", 
              description: "The cell address to format (e.g., 'A1', 'B2')" 
            },
            fontColor: { 
              type: "string", 
              description: "The font color in hex format (e.g., '#FF0000' for red). Must be a valid hex color code starting with #." 
            },
            backgroundColor: { 
              type: "string", 
              description: "The background color in hex format (e.g., '#FFFF00' for yellow). Must be a valid hex color code starting with #." 
            },
            bold: { 
              type: "boolean", 
              description: "Whether to make the text bold" 
            },
          },
          required: ["cellAddress"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "apply_conditional_format",
        description: "Apply a conditional format to a range in Excel",
        parameters: {
          type: "object",
          properties: {
            range: {
              type: "string",
              description: "The range to apply conditional formatting to (e.g., 'A1:D10')",
            },
            formatType: {
              type: "string",
              enum: [
                "cellValue",
                "colorScale",
                "dataBar",
                "iconSet",
                "topBottom",
                "presetCriteria",
                "containsText",
                "custom",
              ],
              description: "The type of conditional format to apply",
            },
            rule: {
              type: "object",
              description: "The rule for the conditional format, depends on the formatType",
            },
            format: {
              type: "object",
              description: "The format to apply when the condition is met",
            },
          },
          required: ["range", "formatType", "rule"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "clear_conditional_formats",
        description: "Clear all conditional formats from a range in Excel",
        parameters: {
          type: "object",
          properties: {
            range: {
              type: "string",
              description: "The range to clear conditional formatting from (e.g., 'A1:D10')",
            },
          },
          required: ["range"],
        },
      },
    },
  ];
} 