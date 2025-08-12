/**
 * File: src/taskpane/api/openai/tools/toolDefinitions.ts
 * Contains tool definitions for OpenAI function calling
 * Dependencies: SDK-independent types, Tool category modules
 * Used by: ChatInterface to define available tools for AI
 */

import type { ChatCompletionTool } from "../../../types/openai";
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
export function getToolDefinitions(selectedRange?: { address: string, rowCount: number, columnCount: number }): ChatCompletionTool[] {
  return [
    ...getCellTools(),
    ...getRangeTools(selectedRange),
    ...getChartTools(),
    ...getWorksheetTools(),
    ...getDataTools(),
    ...getFormatTools()
  ];
} 