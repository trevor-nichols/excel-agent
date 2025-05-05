/* global Excel, console */

/**
 * File: src/taskpane/api/excel/cellOperations.ts
 * Contains functions for reading and writing cell values in Excel
 * Dependencies: Excel API
 * Used by: API layer and tool functions
 */

import { FormatOptions } from "../../types";

/**
 * Write values to Excel cells starting from a specific cell
 */
export async function writeToCellOperation(
  startCell: string,
  values: (string | number | boolean | null)[][]
): Promise<string> {
  try {
    return await Excel.run(async (context) => {
      const sheet = context.workbook.worksheets.getActiveWorksheet();
      const range = sheet.getRange(startCell).getResizedRange(values.length - 1, values[0].length - 1);
      range.values = values;
      await context.sync();

      // Load the address after setting values
      range.load("address");
      await context.sync();

      return range.address;
    });
  } catch (error) {
    console.error("Error writing to Excel:", error);
    throw error;
  }
}

/**
 * Read a value from a specific cell in Excel
 */
export async function readFromCellOperation(cellAddress: string): Promise<string> {
  return await Excel.run(async (context) => {
    const range = context.workbook.worksheets.getActiveWorksheet().getRange(cellAddress);
    range.load("values");
    await context.sync();
    return range.values[0][0].toString();
  });
}

/**
 * Format a cell with the specified formatting options
 */
export async function formatCellOperation(
  cellAddress: string,
  format: {
    fontColor?: string;
    backgroundColor?: string;
    bold?: boolean;
  }
): Promise<string> {
  try {
    return await Excel.run(async (context) => {
      const sheet = context.workbook.worksheets.getActiveWorksheet();
      const range = sheet.getRange(cellAddress);
      
      // Apply font color if specified
      if (format.fontColor) {
        // Ensure the color is a valid hex color
        const colorPattern = /^#[0-9A-F]{6}$/i;
        if (colorPattern.test(format.fontColor)) {
          range.format.font.color = format.fontColor;
        } else {
          console.warn(`Invalid font color format: ${format.fontColor}. Using default.`);
        }
      }
      
      // Apply background color if specified
      if (format.backgroundColor) {
        // Ensure the color is a valid hex color
        const colorPattern = /^#[0-9A-F]{6}$/i;
        if (colorPattern.test(format.backgroundColor)) {
          range.format.fill.color = format.backgroundColor;
        } else {
          console.warn(`Invalid background color format: ${format.backgroundColor}. Using default.`);
        }
      }
      
      // Apply bold formatting if specified
      if (format.bold !== undefined) {
        range.format.font.bold = format.bold;
      }
      
      await context.sync();
      return `Formatted cell ${cellAddress} successfully`;
    });
  } catch (error: any) {
    console.error("Error formatting cell:", error);
    throw new Error(`Failed to format cell ${cellAddress}: ${error.message}`);
  }
}

/**
 * Write values to the currently selected range in Excel
 */
export async function writeToSelectedRange(values: (string | number)[][]): Promise<string> {
  return await Excel.run(async (context) => {
    const range = context.workbook.getSelectedRange();
    range.load(["rowCount", "columnCount", "address"]);
    await context.sync();

    // Trim the input data to fit the selected range
    const trimmedValues = values.slice(0, range.rowCount).map((row) => row.slice(0, range.columnCount));

    range.values = trimmedValues;
    await context.sync();

    // Load the address again after setting values
    range.load("address");
    await context.sync();

    if (values.length > range.rowCount || values[0].length > range.columnCount) {
      return `${range.address} (Note: Data was trimmed to fit the range)`;
    }
    return range.address;
  });
}

/**
 * Get information about the currently selected range
 */
export async function getSelectedRangeInfo(): Promise<{ address: string; rowCount: number; columnCount: number }> {
  return await Excel.run(async (context) => {
    const range = context.workbook.getSelectedRange();
    range.load(["address", "rowCount", "columnCount", "values"]);
    await context.sync();
    return {
      address: range.address,
      rowCount: range.rowCount,
      columnCount: range.columnCount,
      values: range.values,
    };
  });
}

/**
 * Ensure there is a valid selection in Excel, select A1 if not
 */
export async function ensureValidSelection(): Promise<void> {
  await Excel.run(async (context) => {
    const range = context.workbook.getSelectedRange();
    range.load("address");
    await context.sync();

    if (!range.address) {
      // If no valid selection, select cell A1
      context.workbook.worksheets.getActiveWorksheet().getRange("A1").select();
      await context.sync();
    }
  });
} 