/**
 * File: src/taskpane/hooks/useOpenAITools.ts
 * This file implements a custom hook for handling OpenAI function calls and interacting with Excel operations
 * Dependencies: OpenAI SDK, Excel operations
 * Used by: ChatInterface component
 */

import * as React from "react";
import {
  getWorksheetNames,
  getActiveWorksheetName
} from "../api/excel/worksheetOperations";

import {
  writeToCellOperation as writeToExcel,
  readFromCellOperation as readFromExcel,
  formatCellOperation,
  getSelectedRangeInfo as analyzeSelectedRange,
  writeToSelectedRange
} from "../api/excel/cellOperations";

import {
  addChartOperation as addChart,
  addPivotTableOperation as addPivotTable
} from "../api/excel/chartOperations";

import {
  manageWorksheet as manageWorksheets,
} from "../api/excel/worksheetOperations";

import {
  filterDataOperation as filterData,
  sortDataOperation as sortData,
  analyzeData,
  enableAutoFilterUI
} from "../api/excel/dataOperations";

import {
  mergeCellsOperation as mergeCells,
  unmergeCellsOperation as unmergeCells,
  autofitColumnsOperation as autofitColumns,
  autofitRowsOperation as autofitRows,
  getRangeData
} from "../api/excel/rangeOperations";

import {
  applyConditionalFormat,
  clearConditionalFormats
} from "../api/excel/formatOperations";

export function useOpenAITools() {
  /**
   * Execute a specific Excel operation based on the tool call
   */
  const executeTool = async (
    toolCall: { id: string; function: { name: string; arguments: string } }
  ) => {
    const functionName = toolCall.function.name;
    const args = JSON.parse(toolCall.function.arguments);

    try {
      switch (functionName) {
        case "write_to_excel":
          return await writeToExcel(args.startCell, args.values);
        
        case "read_from_excel":
          return await readFromExcel(args.cellAddress);
        
        case "format_cell":
          return await formatCellOperation(args.cellAddress, {
            fontColor: args.fontColor,
            backgroundColor: args.backgroundColor,
            bold: args.bold
          });
        
        case "add_chart":
          if (!args.chartType || !args.dataRange) {
            throw new Error("Chart type and data range are required");
          }
          return await addChart(args.dataRange, args.chartType);
        
        case "analyze_selected_range":
          return await analyzeSelectedRange();
        
        case "write_to_selected_range":
          return await writeToSelectedRange(args.values);
        
        case "add_pivot_table":
          return await addPivotTable(
            args.sourceDataRange,
            args.destinationCell,
            args.rowFields,
            args.columnFields,
            args.dataFields,
            args.filterFields
          );
        
        case "manage_worksheet":
          return await manageWorksheets(args.action, args.sheetName);
        
        case "enable_filter_ui":
          return await enableAutoFilterUI(args.range, args.hasHeaders);
        
        case "filter_data":
          return await filterData(args.range, args.column, args.filterType, args.criteria);
        
        case "sort_data":
          return await sortData(args.range, args.sortFields, args.matchCase, args.hasHeaders);
        
        case "merge_cells":
          return await mergeCells(args.range, args.across);
        
        case "unmerge_cells":
          return await unmergeCells(args.range);
        
        case "autofit_columns":
          return await autofitColumns(args.range);
        
        case "autofit_rows":
          return await autofitRows(args.range);
        
        case "apply_conditional_format":
          return await applyConditionalFormat(args.range, args.formatType, args.rule, args.format);
        
        case "clear_conditional_formats":
          return await clearConditionalFormats(args.range);
        
        case "get_worksheet_names":
          return await getWorksheetNames();
        
        case "get_active_worksheet_name":
          return await getActiveWorksheetName();
        
        case "read_range":
          return await getRangeData(args.rangeAddress);
          
        case "analyze_data":
          return await analyzeData(args.values, args.analysisType);
          
        default:
          throw new Error(`Unknown function: ${functionName}`);
      }
    } catch (error) {
      console.error(`Error executing Excel operation "${functionName}":`, error);
      if (error instanceof Error) {
        return { error: error.message };
      }
      return { error: `Error executing ${functionName}` };
    }
  };

  /**
   * Execute multiple tool calls and return their results
   */
  const executeToolCalls = async (toolCalls: Array<{ id: string; function: { name: string; arguments: string } }>) => {
    const results = [];
    
    for (const toolCall of toolCalls) {
      try {
        const result = await executeTool(toolCall);
        results.push({
          role: "tool" as const,
          tool_call_id: toolCall.id,
          content: typeof result === 'string' ? result : JSON.stringify(result),
        });
      } catch (error) {
        console.error(`Error executing tool call ${toolCall.function.name}:`, error);
        // Add error message as tool response
        results.push({
          role: "tool" as const,
          tool_call_id: toolCall.id,
          content: JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
        });
      }
    }
    
    return results;
  };

  return { executeTool, executeToolCalls };
} 