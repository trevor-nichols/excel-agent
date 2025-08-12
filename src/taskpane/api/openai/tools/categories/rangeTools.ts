/**
 * File: src/taskpane/api/openai/tools/categories/rangeTools.ts
 * Contains tool definitions for range operations in Excel
 * Dependencies: OpenAI types
 * Used by: toolDefinitions.ts to create the complete set of tools
 */

import type { ChatCompletionTool } from "../../../../types/openai";

/**
 * Gets tool definitions for range operations
 * @param selectedRange Optional information about the currently selected range
 */
export function getRangeTools(selectedRange?: { address: string, rowCount: number, columnCount: number }): ChatCompletionTool[] {
  return [
    {
      type: "function",
      function: {
        name: "write_to_selected_range",
        description: selectedRange ? 
          `Write values to the currently selected range in Excel (${selectedRange.address}, ${selectedRange.rowCount}x${selectedRange.columnCount}). If the input is larger, it will be trimmed to fit.` :
          "Write values to the currently selected range in Excel. If the input is larger, it will be trimmed to fit.",
        parameters: {
          type: "object",
          properties: {
            values: {
              type: "array",
              items: {
                type: "array",
                items: {
                  type: "string",
                },
              },
              description: selectedRange ?
                `The values to write to the selected range. Should be a 2D array of strings, ideally ${selectedRange.rowCount}x${selectedRange.columnCount} to fit the selected range.` :
                "The values to write to the selected range. Should be a 2D array of strings.",
            },
          },
          required: ["values"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "read_range",
        description: "Read values from a specific range or the currently selected range in Excel",
        parameters: {
          type: "object",
          properties: {
            rangeAddress: {
              type: "string",
              description:
                "The range address to read from (e.g., 'A1:B5'). If not provided, reads from the currently selected range.",
            },
          },
        },
      },
    },
    {
      type: "function",
      function: {
        name: "analyze_data",
        description: "Analyze data from a 2D array with different analysis methods",
        parameters: {
          type: "object",
          properties: {
            values: {
              type: "array",
              items: {
                type: "array",
                items: {
                  type: ["string", "number", "boolean", "null"],
                },
              },
              description: "The 2D array of data to analyze",
            },
            analysisType: {
              type: "string",
              enum: ["summary", "trend", "distribution"],
              description: "The type of analysis to perform on the data",
            },
          },
          required: ["values", "analysisType"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "merge_cells",
        description: "Merge cells in a specified range",
        parameters: {
          type: "object",
          properties: {
            range: {
              type: "string",
              description: "The range to merge (e.g., 'A1:B2')",
            },
            across: {
              type: "boolean",
              description:
                "If true, merges cells in each row separately. If false or omitted, merges the entire range.",
            },
          },
          required: ["range"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "unmerge_cells",
        description: "Unmerge cells in a specified range",
        parameters: {
          type: "object",
          properties: {
            range: {
              type: "string",
              description: "The range to unmerge (e.g., 'A1:B2')",
            },
          },
          required: ["range"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "autofit_columns",
        description: "Auto-fit columns in a specified range",
        parameters: {
          type: "object",
          properties: {
            range: {
              type: "string",
              description: "The range to auto-fit columns (e.g., 'A:C' or 'A1:C10')",
            },
          },
          required: ["range"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "autofit_rows",
        description: "Auto-fit rows in a specified range",
        parameters: {
          type: "object",
          properties: {
            range: {
              type: "string",
              description: "The range to auto-fit rows (e.g., '1:3' or 'A1:C10')",
            },
          },
          required: ["range"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "analyze_selected_range",
        description: "Analyze the data in the currently selected range in Excel",
        parameters: {
          type: "object",
          properties: {
            analysisType: {
              type: "string",
              enum: ["summary", "trend", "distribution"],
              description: "The type of analysis to perform on the selected data",
            },
          },
          required: ["analysisType"],
        },
      },
    },
  ];
} 