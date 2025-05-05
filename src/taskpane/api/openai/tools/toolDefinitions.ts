/**
 * File: src/taskpane/api/openai/tools/toolDefinitions.ts
 * Contains tool definitions for OpenAI function calling
 * Dependencies: OpenAI types, Tool category modules
 * Used by: ChatInterface to define available tools for AI
 */

import OpenAI from "openai";
import {
  getCellTools,
  getRangeTools,
  getChartTools,
  getWorksheetTools,
  getDataTools,
  getFormatTools
} from "./categories";

/**
 * Generate tool definitions for OpenAI function calling API
 * @param selectedRange Optional information about the currently selected range
 */
export function getToolDefinitions(selectedRange?: { address: string, rowCount: number, columnCount: number }): OpenAI.Chat.Completions.ChatCompletionTool[] {
  return [
    ...getCellTools(),
    ...getRangeTools(selectedRange),
    ...getChartTools(),
    ...getWorksheetTools(),
    ...getDataTools(),
    ...getFormatTools()
  ];
} 