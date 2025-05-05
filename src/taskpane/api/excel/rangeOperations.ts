/* global Excel, console */

/**
 * File: src/taskpane/api/excel/rangeOperations.ts
 * Contains functions for working with Excel ranges
 * Dependencies: Excel API
 * Used by: API layer and tool functions
 */

/**
 * Get data from a range in Excel
 */
export async function getRangeData(rangeAddress?: string): Promise<{ address: string; values: any[][] }> {
  return await Excel.run(async (context) => {
    try {
      const range = rangeAddress
        ? context.workbook.worksheets.getActiveWorksheet().getRange(rangeAddress)
        : context.workbook.getSelectedRange();

      // Load necessary properties
      range.load(["address", "values"]);

      await context.sync();

      // Check if values are returned; handle empty ranges
      if (!range.values || range.values.length === 0) {
        throw new Error("The selected range is empty or contains no values.");
      }

      return {
        address: range.address,
        values: range.values,
      };
    } catch (error) {
      console.error("Error in getRangeData:", error);
      throw new Error("Failed to retrieve range data. Please ensure the range is valid and try again.");
    }
  });
}

/**
 * Merge cells in a specified range
 */
export async function mergeCellsOperation(range: string, across: boolean = false): Promise<string> {
  return await Excel.run(async (context) => {
    const sheet = context.workbook.worksheets.getActiveWorksheet();
    const rangeToMerge = sheet.getRange(range);
    rangeToMerge.merge(across);
    await context.sync();
    return `Merged cells in range ${range}`;
  });
}

/**
 * Unmerge cells in a specified range
 */
export async function unmergeCellsOperation(range: string): Promise<string> {
  return await Excel.run(async (context) => {
    const sheet = context.workbook.worksheets.getActiveWorksheet();
    const rangeToUnmerge = sheet.getRange(range);
    rangeToUnmerge.unmerge();
    await context.sync();
    return `Unmerged cells in range ${range}`;
  });
}

/**
 * Auto-fit columns in a specified range
 */
export async function autofitColumnsOperation(range: string): Promise<string> {
  return await Excel.run(async (context) => {
    const sheet = context.workbook.worksheets.getActiveWorksheet();
    const rangeToAutofit = sheet.getRange(range);
    rangeToAutofit.format.autofitColumns();
    await context.sync();
    return `Auto-fitted columns in range ${range}`;
  });
}

/**
 * Auto-fit rows in a specified range
 */
export async function autofitRowsOperation(range: string): Promise<string> {
  return await Excel.run(async (context) => {
    const sheet = context.workbook.worksheets.getActiveWorksheet();
    const rangeToAutofit = sheet.getRange(range);
    rangeToAutofit.format.autofitRows();
    await context.sync();
    return `Auto-fitted rows in range ${range}`;
  });
}

/**
 * Get data from the used range of the active sheet in Excel
 */
export async function getActiveSheetUsedRangeData(): Promise<{ address: string; values: any[][] }> {
  return await Excel.run(async (context) => {
    try {
      const sheet = context.workbook.worksheets.getActiveWorksheet();
      const usedRange = sheet.getUsedRange();

      // Load necessary properties
      usedRange.load(["address", "values"]);

      await context.sync();

      // Check if values are returned; handle empty sheets
      if (!usedRange.values || usedRange.values.length === 0) {
        // Return structure indicating an empty used range
        return {
          address: usedRange.address, // Might be null or a single cell address if worksheet was never used
          values: [[]],
        };
      }

      return {
        address: usedRange.address,
        values: usedRange.values,
      };
    } catch (error) {
      console.error("Error in getActiveSheetUsedRangeData:", error);
      // Attempt to return a meaningful error structure if possible
      if (error instanceof OfficeExtension.Error) {
        console.error("Debug info:", error.debugInfo);
      }
      throw new Error("Failed to retrieve active sheet used range data. Please ensure the sheet is valid.");
    }
  });
}

/**
 * Get content from the current sheet or a specified sheet
 */
export async function getCurrentSheetContent(
  options: {
    includeMetadata?: boolean;
    rowSeparator?: string;
    columnSeparator?: string;
    sheetName?: string;
  } = {}
): Promise<string> {
  const { includeMetadata = true, rowSeparator = "\n", columnSeparator = "\t", sheetName } = options;

  try {
    return await Excel.run(async (context) => {
      const sheet = sheetName
        ? context.workbook.worksheets.getItem(sheetName)
        : context.workbook.worksheets.getActiveWorksheet();
      const usedRange = sheet.getUsedRange();
      usedRange.load(["values", "address"]);
      sheet.load("name");
      await context.sync();

      const content = usedRange.values.map((row) => row.join(columnSeparator)).join(rowSeparator);

      if (includeMetadata) {
        return `Sheet ${sheet.name} (${usedRange.address}):${rowSeparator}${content}`;
      } else {
        return content;
      }
    });
  } catch (error) {
    console.error("Error getting sheet content:", error);
    throw error;
  }
} 