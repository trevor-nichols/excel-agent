/**
 * File: src/taskpane/api/openai/agent.ts
 * Sections: tool wrappers, agent factory, mutation guard.
 * Purpose: Define the primary Excel Agent using the OpenAI Agents SDK.
 */

import { Agent, tool } from "@openai/agents";
import { z } from "zod";
import {
  writeToCellOperation,
  readFromCellOperation,
  formatCellOperation,
  writeToSelectedRange,
  getSelectedRangeInfo,
} from "../excel/cellOperations";
import {
  addChartOperation,
  addPivotTableOperation,
} from "../excel/chartOperations";
import {
  analyzeData,
  filterDataOperation,
  sortDataOperation,
  enableAutoFilterUI,
} from "../excel/dataOperations";
import {
  mergeCellsOperation,
  unmergeCellsOperation,
  autofitColumnsOperation,
  autofitRowsOperation,
  getRangeData,
} from "../excel/rangeOperations";
import {
  getWorksheetNames,
  getActiveWorksheetName,
  manageWorksheet,
} from "../excel/worksheetOperations";
import {
  applyConditionalFormat,
  clearConditionalFormats,
} from "../excel/formatOperations";
import {
  ChartType,
  FilterTypes,
  PivotAggregationFunction,
  SortDataOption,
} from "../../types";

type MutationGuard = (toolName: string, args: unknown) => Promise<void> | void;

const values2D = z.array(z.array(z.union([z.string(), z.number(), z.boolean(), z.null()])));

const hexColor = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a hex color like #RRGGBB");

// Shared schemas for contract checks and tool definitions.
export const excelToolSchemas = {
  writeToExcel: z.object({
    startCell: z.string(),
    values: values2D,
  }),
  writeToSelectedRange: z.object({
    values: values2D,
  }),
  readFromExcel: z.object({
    cellAddress: z.string(),
  }),
  formatCell: z.object({
    cellAddress: z.string(),
    fontColor: hexColor.optional(),
    backgroundColor: hexColor.optional(),
    bold: z.boolean().optional(),
  }),
  addChart: z.object({
    dataRange: z.string(),
    chartType: z.nativeEnum(ChartType),
  }),
  addPivot: z.object({
    sourceDataRange: z.string(),
    destinationCell: z.string(),
    rowFields: z.array(z.string()),
    columnFields: z.array(z.string()),
    dataFields: z.array(
      z.object({
        name: z.string(),
        function: z.nativeEnum(PivotAggregationFunction),
      })
    ),
    filterFields: z.array(z.string()).optional(),
  }),
  readRange: z.object({
    rangeAddress: z.string().optional(),
  }),
  mergeCells: z.object({
    range: z.string(),
    across: z.boolean().optional(),
  }),
  unmergeCells: z.object({
    range: z.string(),
  }),
  autofitColumns: z.object({
    range: z.string(),
  }),
  autofitRows: z.object({
    range: z.string(),
  }),
  analyzeData: z.object({
    values: values2D,
    analysisType: z.enum(["summary", "trend", "distribution"]),
  }),
  filterData: z.object({
    range: z.string().optional(),
    column: z.string(),
    filterType: z.nativeEnum(FilterTypes),
    criteria: z.record(z.any()),
  }),
  sortData: z.object({
    range: z.string().optional(),
    sortFields: z.array(
      z.object({
        key: z.number(),
        ascending: z.boolean(),
        color: z.string().optional(),
        dataOption: z.nativeEnum(SortDataOption).optional(),
      })
    ),
    matchCase: z.boolean().optional(),
    hasHeaders: z.boolean().optional(),
  }),
  enableFilterUI: z.object({
    range: z.string().optional(),
    hasHeaders: z.boolean().optional(),
  }),
  applyConditionalFormat: z.object({
    range: z.string(),
    formatType: z.string(),
    rule: z.record(z.any()),
    format: z.record(z.any()).optional(),
  }),
  clearConditionalFormats: z.object({
    range: z.string(),
  }),
  manageWorksheet: z.object({
    action: z.enum(["create", "delete"]),
    sheetName: z.string(),
  }),
};

/**
 * Build tools
 */
function buildTools(guard?: MutationGuard) {
  const requireApproval = async (toolName: string, args: unknown) => {
    if (guard) {
      await guard(toolName, args);
    }
  };

  const writeToExcelTool = tool({
    name: "write_to_excel",
    description:
      "Write a 2D array of values to a starting cell. Read first if unsure about existing data.",
    parameters: z.object({
      startCell: z.string().describe("Starting cell address, e.g., A1"),
      values: values2D.describe("2D array of values to write."),
    }),
    execute: async (input) => {
      await requireApproval("write_to_excel", input);
      return await writeToCellOperation(input.startCell, input.values);
    },
  });

  const writeToSelectedRangeTool = tool({
    name: "write_to_selected_range",
    description:
      "Write values to the current selection; trims to fit selection size.",
    parameters: z.object({
      values: values2D,
    }),
    execute: async (input) => {
      await requireApproval("write_to_selected_range", input);
      return await writeToSelectedRange(input.values as any);
    },
  });

  const readFromExcelTool = tool({
    name: "read_from_excel",
    description: "Read a value from a specific cell.",
    parameters: z.object({
      cellAddress: z.string(),
    }),
    execute: async (input) => {
      return await readFromCellOperation(input.cellAddress);
    },
  });

  const formatCellTool = tool({
    name: "format_cell",
    description: "Format a cell (font color, background color, bold).",
    parameters: z.object({
      cellAddress: z.string(),
      fontColor: hexColor.optional(),
      backgroundColor: hexColor.optional(),
      bold: z.boolean().optional(),
    }),
    execute: async (input) => {
      await requireApproval("format_cell", input);
      return await formatCellOperation(input.cellAddress, {
        fontColor: input.fontColor,
        backgroundColor: input.backgroundColor,
        bold: input.bold,
      });
    },
  });

  const analyzeSelectedRangeTool = tool({
    name: "analyze_selected_range",
    description: "Return info about the currently selected range.",
    parameters: z.object({}).optional(),
    execute: async () => {
      return await getSelectedRangeInfo();
    },
  });

  const addChartTool = tool({
    name: "add_chart",
    description: "Add a chart to the active worksheet.",
    parameters: z.object({
      dataRange: z.string(),
      chartType: z.nativeEnum(ChartType),
    }),
    execute: async (input) => {
      await requireApproval("add_chart", input);
      await addChartOperation(input.dataRange, input.chartType as any);
      return { status: "ok" };
    },
  });

  const addPivotTool = tool({
    name: "add_pivot_table",
    description: "Add a pivot table to the worksheet.",
    parameters: z.object({
      sourceDataRange: z.string(),
      destinationCell: z.string(),
      rowFields: z.array(z.string()),
      columnFields: z.array(z.string()),
      dataFields: z.array(
        z.object({
          name: z.string(),
          function: z.nativeEnum(PivotAggregationFunction),
        })
      ),
      filterFields: z.array(z.string()).optional(),
    }),
    execute: async (input) => {
      await requireApproval("add_pivot_table", input);
      await addPivotTableOperation(
        input.sourceDataRange,
        input.destinationCell,
        input.rowFields,
        input.columnFields,
        input.dataFields as any,
        input.filterFields || []
      );
      return { status: "ok" };
    },
  });

  const readRangeTool = tool({
    name: "read_range",
    description: "Read values from a range (or current selection if omitted).",
    parameters: z.object({
      rangeAddress: z.string().optional(),
    }),
    execute: async (input) => {
      return await getRangeData(input.rangeAddress);
    },
  });

  const mergeCellsTool = tool({
    name: "merge_cells",
    description: "Merge cells in the specified range.",
    parameters: z.object({
      range: z.string(),
      across: z.boolean().optional(),
    }),
    execute: async (input) => {
      await requireApproval("merge_cells", input);
      return await mergeCellsOperation(input.range, input.across);
    },
  });

  const unmergeCellsTool = tool({
    name: "unmerge_cells",
    description: "Unmerge cells in the specified range.",
    parameters: z.object({
      range: z.string(),
    }),
    execute: async (input) => {
      await requireApproval("unmerge_cells", input);
      return await unmergeCellsOperation(input.range);
    },
  });

  const autofitColumnsTool = tool({
    name: "autofit_columns",
    description: "Auto-fit columns in a range.",
    parameters: z.object({ range: z.string() }),
    execute: async (input) => {
      await requireApproval("autofit_columns", input);
      return await autofitColumnsOperation(input.range);
    },
  });

  const autofitRowsTool = tool({
    name: "autofit_rows",
    description: "Auto-fit rows in a range.",
    parameters: z.object({ range: z.string() }),
    execute: async (input) => {
      await requireApproval("autofit_rows", input);
      return await autofitRowsOperation(input.range);
    },
  });

  const analyzeDataTool = tool({
    name: "analyze_data",
    description: "Analyze a 2D array (summary|trend|distribution).",
    parameters: z.object({
      values: values2D,
      analysisType: z.enum(["summary", "trend", "distribution"]),
    }),
    execute: async (input) => {
      return await analyzeData(input.values as any, input.analysisType);
    },
  });

  const filterDataTool = tool({
    name: "filter_data",
    description: "Apply a filter to a range (or selection).",
    parameters: z.object({
      range: z.string().optional(),
      column: z.string(),
      filterType: z.nativeEnum(FilterTypes),
      criteria: z.record(z.any()),
    }),
    execute: async (input) => {
      await requireApproval("filter_data", input);
      return await filterDataOperation(
        input.range,
        input.column,
        input.filterType,
        input.criteria
      );
    },
  });

  const sortDataTool = tool({
    name: "sort_data",
    description: "Sort data in a range (or selection).",
    parameters: z.object({
      range: z.string().optional(),
      sortFields: z.array(
        z.object({
          key: z.number(),
          ascending: z.boolean(),
          color: z.string().optional(),
          dataOption: z.nativeEnum(SortDataOption).optional(),
        })
      ),
      matchCase: z.boolean().optional(),
      hasHeaders: z.boolean().optional(),
    }),
    execute: async (input) => {
      await requireApproval("sort_data", input);
      return await sortDataOperation(
        input.range,
        input.sortFields as any,
        input.matchCase,
        input.hasHeaders
      );
    },
  });

  const enableFilterTool = tool({
    name: "enable_filter_ui",
    description: "Enable native AutoFilter UI on a range or selection.",
    parameters: z.object({
      range: z.string().optional(),
      hasHeaders: z.boolean().optional(),
    }),
    execute: async (input) => {
      await requireApproval("enable_filter_ui", input);
      return await enableAutoFilterUI(input.range, input.hasHeaders);
    },
  });

  const applyConditionalFormatTool = tool({
    name: "apply_conditional_format",
    description: "Apply a conditional format to a range.",
    parameters: z.object({
      range: z.string(),
      formatType: z.string(),
      rule: z.record(z.any()),
      format: z.record(z.any()).optional(),
    }),
    execute: async (input) => {
      await requireApproval("apply_conditional_format", input);
      return await applyConditionalFormat(
        input.range,
        input.formatType as any,
        input.rule,
        input.format as any
      );
    },
  });

  const clearConditionalFormatsTool = tool({
    name: "clear_conditional_formats",
    description: "Clear all conditional formats from a range.",
    parameters: z.object({
      range: z.string(),
    }),
    execute: async (input) => {
      await requireApproval("clear_conditional_formats", input);
      return await clearConditionalFormats(input.range);
    },
  });

  const manageWorksheetTool = tool({
    name: "manage_worksheet",
    description: "Create or delete a worksheet.",
    parameters: z.object({
      action: z.enum(["create", "delete"]),
      sheetName: z.string(),
    }),
    execute: async (input) => {
      await requireApproval("manage_worksheet", input);
      return await manageWorksheet(input.action, input.sheetName);
    },
  });

  const getWorksheetNamesTool = tool({
    name: "get_worksheet_names",
    description: "List worksheet names in the workbook.",
    parameters: z.object({}).optional(),
    execute: async () => {
      return await getWorksheetNames();
    },
  });

  const getActiveWorksheetNameTool = tool({
    name: "get_active_worksheet_name",
    description: "Get the active worksheet name.",
    parameters: z.object({}).optional(),
    execute: async () => {
      return await getActiveWorksheetName();
    },
  });

  return [
    // Cell tools
    writeToExcelTool,
    writeToSelectedRangeTool,
    readFromExcelTool,
    formatCellTool,
    analyzeSelectedRangeTool,
    // Chart & pivot
    addChartTool,
    addPivotTool,
    // Range tools
    readRangeTool,
    mergeCellsTool,
    unmergeCellsTool,
    autofitColumnsTool,
    autofitRowsTool,
    // Data tools
    analyzeDataTool,
    filterDataTool,
    sortDataTool,
    enableFilterTool,
    // Conditional formatting
    applyConditionalFormatTool,
    clearConditionalFormatsTool,
    // Worksheet tools
    manageWorksheetTool,
    getWorksheetNamesTool,
    getActiveWorksheetNameTool,
  ];
}

/**
 * Factory: create the Excel Agent with context-aware instructions.
 */
export function createExcelAgent(opts?: {
  activeWorksheet?: string;
  selectedRange?: string;
  mutationGuard?: MutationGuard;
}) {
  const { activeWorksheet, selectedRange, mutationGuard } = opts || {};

  const instructions = [
    "You are an Excel assistant. Prefer reading before writing when uncertain.",
    activeWorksheet
      ? `Active worksheet: "${activeWorksheet}".`
      : "Active worksheet unknown.",
    selectedRange
      ? `Selected range: ${selectedRange}. Use it when context fits.`
      : "No range is selected.",
    "When writing, preserve user data unless explicitly told to overwrite.",
  ].join("\n");

  return new Agent({
    name: "Excel Agent",
    instructions,
    model: "gpt-5.1",
    tools: buildTools(mutationGuard),
    parallelToolCalls: false, // keep sequential to avoid conflicting writes
  });
}

