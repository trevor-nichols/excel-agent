/**
 * File: src/taskpane/api/openai/tools/categories/dataTools.ts
 * Contains tool definitions for data operations in Excel
 * Dependencies: OpenAI types
 * Used by: toolDefinitions.ts to create the complete set of tools
 */

import OpenAI from "openai";
import { FilterTypes } from "../../../../types";

/**
 * Gets tool definitions for data operations
 */
export function getDataTools(): OpenAI.Chat.Completions.ChatCompletionTool[] {
  return [
    {
      type: "function",
      function: {
        name: "enable_filter_ui",
        description: "Enable Excel's built-in AutoFilter dropdown UI on a range, allowing users to filter data using Excel's native interface",
        strict: true,
        parameters: {
          type: "object",
          properties: {
            range: {
              type: "string",
              description: "The range to apply the filter UI to (e.g., 'A1:D10'). If not provided, uses the current selection.",
            },
            hasHeaders: {
              type: "boolean",
              description: "Whether the first row of the range contains headers. Default is true.",
            },
          },
          required: [],
          additionalProperties: false,
        },
      },
    },
    {
      type: "function",
      function: {
        name: "filter_data",
        description: "Filter data in Excel based on specified criteria",
        strict: true,
        parameters: {
          type: "object",
          properties: {
            range: {
              type: "string",
              description: "The range to filter (e.g., 'A1:D10'). If not provided, uses the current selection.",
            },
            column: {
              type: "string",
              description: "The column to apply the filter to (e.g., 'A', 'B', 'C', or multi-letter columns like 'AA', 'AB')",
            },
            filterType: {
              type: "string",
              enum: Object.values(FilterTypes),
              description: "The type of filter to apply",
            },
            criteria: {
              type: "object",
              description: "The criteria for the filter, depends on the filterType.",
              oneOf: [
                {
                  type: "object", 
                  properties: { 
                    value: { 
                      type: ["string", "number", "boolean"],
                      description: "The value to compare against (for Equals, GreaterThan, LessThan, Contains filters)"
                    }
                  },
                  required: ["value"],
                  additionalProperties: false,
                  description: "For Equals, GreaterThan, LessThan, and Contains filter types"
                },
                {
                  type: "object",
                  properties: {
                    lowerBound: { 
                      type: ["string", "number"], 
                      description: "The lower bound value for the Between filter"
                    },
                    upperBound: { 
                      type: ["string", "number"], 
                      description: "The upper bound value for the Between filter"
                    }
                  },
                  required: ["lowerBound", "upperBound"],
                  additionalProperties: false,
                  description: "For Between filter type"
                },
                {
                  type: "object",
                  properties: {
                    values: { 
                      type: "array", 
                      items: { type: ["string", "number", "boolean"] },
                      description: "Array of values to include in the filter"
                    }
                  },
                  required: ["values"],
                  additionalProperties: false,
                  description: "For Values filter type"
                }
              ]
            },
          },
          required: ["column", "filterType", "criteria"],
          additionalProperties: false,
        },
      },
    },
    {
      type: "function",
      function: {
        name: "sort_data",
        description: "Sort data in an Excel range based on specified criteria",
        strict: true,
        parameters: {
          type: "object",
          properties: {
            range: {
              type: "string",
              description: "The range to sort (e.g., 'A1:D10'). If not provided, uses the current selection.",
            },
            sortFields: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  key: { type: "number", description: "The column index to sort by (0-based)" },
                  ascending: {
                    type: "boolean",
                    description: "Sort in ascending order if true, descending if false",
                  },
                  color: { type: "string", description: "The color to sort by (if sorting by color)" },
                  dataOption: {
                    type: "string",
                    enum: ["normal", "textAsNumber"],
                    description: "How to sort text values",
                  },
                },
                required: ["key", "ascending"],
              },
              description: "An array of sort criteria to apply",
            },
            matchCase: { type: "boolean", description: "Whether to match case when sorting" },
            hasHeaders: { type: "boolean", description: "Whether the range has a header row" },
          },
          required: ["sortFields"],
          additionalProperties: false,
        },
      },
    },
  ];
} 