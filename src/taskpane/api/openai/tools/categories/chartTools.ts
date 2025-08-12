/**
 * File: src/taskpane/api/openai/tools/categories/chartTools.ts
 * Contains tool definitions for chart and visualization operations in Excel
 * Dependencies: OpenAI types, ChartType enum, PivotAggregationFunction enum
 * Used by: toolDefinitions.ts to create the complete set of tools
 */

import type { ChatCompletionTool } from "../../../../types/openai";
import { ChartType, PivotAggregationFunction } from "../../../../types";

/**
 * Gets tool definitions for chart and visualization operations
 */
export function getChartTools(): ChatCompletionTool[] {
  return [
    {
      type: "function",
      function: {
        name: "add_chart",
        description: "Add a chart to the Excel worksheet",
        parameters: {
          type: "object",
          properties: {
            dataRange: {
              type: "string",
              description:
                "The range of cells containing the data for the chart. Specify using standard Excel range notation",
            },
            chartType: {
              type: "string",
              enum: Object.values(ChartType),
              description: "The type of chart to create",
            },
          },
          required: ["dataRange", "chartType"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "add_pivot",
        description: "Add a pivot table to the Excel worksheet",
        parameters: {
          type: "object",
          properties: {
            sourceDataRange: {
              type: "string",
              description:
                "The range of cells containing the source data for the pivot table. Specify using standard Excel range notation (e.g., 'A1:D10').",
            },
            destinationCell: {
              type: "string",
              description: "The cell where the pivot table should be placed (e.g., 'G1').",
            },
            rowFields: {
              type: "array",
              items: { type: "string" },
              description: "An array of field names to use as row labels.",
            },
            columnFields: {
              type: "array",
              items: { type: "string" },
              description: "An array of field names to use as column labels.",
            },
            dataFields: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  function: {
                    type: "string",
                    enum: Object.values(PivotAggregationFunction),
                  },
                },
                required: ["name", "function"],
              },
              description: "An array of objects specifying the data fields and their aggregation functions.",
            },
            filterFields: {
              type: "array",
              items: { type: "string" },
              description: "An optional array of field names to use as filters.",
            },
          },
          required: ["sourceDataRange", "destinationCell", "rowFields", "columnFields", "dataFields"],
        },
      },
    },
  ];
} 