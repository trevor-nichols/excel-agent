/* global Excel, console */

/**
 * File: src/taskpane/api/excel/dataOperations.ts
 * Contains functions for analyzing, filtering, and sorting data in Excel
 * Dependencies: Excel API
 * Used by: API layer and tool functions
 */

import { FilterTypes, SortField } from "../../types";

/**
 * Analyze data in Excel with different methods
 */
export async function analyzeData(data: any[][], analysisType: string): Promise<string> {
  // This is a simple implementation. You might want to use a library like mathjs for more complex analysis.
  switch (analysisType) {
    case "summary":
      const allNumbers = data.flat().filter((val) => typeof val === "number");
      const sum = allNumbers.reduce((a, b) => a + b, 0);
      const avg = sum / allNumbers.length;
      const max = Math.max(...allNumbers);
      const min = Math.min(...allNumbers);
      return `Summary:\nSum: ${sum}\nAverage: ${avg}\nMax: ${max}\nMin: ${min}`;
    case "trend":
      // This is a very basic trend analysis. You might want to implement a more sophisticated algorithm.
      const lastRow = data[data.length - 1].filter((val) => typeof val === "number");
      const firstRow = data[0].filter((val) => typeof val === "number");
      const trend = lastRow.map((val, index) => val - firstRow[index]);
      return `Trend (last value - first value for each column):\n${trend.join(", ")}`;
    case "distribution":
      // This is a basic frequency distribution
      const flatData = data.flat();
      const distribution = flatData.reduce(
        (acc, val) => {
          acc[val] = (acc[val] || 0) + 1;
          return acc;
        },
        {} as Record<string | number, number>
      );
      return `Distribution:\n${Object.entries(distribution)
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n")}`;
    default:
      return "Unknown analysis type";
  }
}

/**
 * Convert Excel column letter to column index (0-based)
 * Works for single and multi-letter columns (A-Z, AA-ZZ, etc.)
 */
function columnLetterToIndex(column: string): number {
  let result = 0;
  for (let i = 0; i < column.length; i++) {
    result = result * 26 + (column.charCodeAt(i) - 64);
  }
  return result - 1; // Convert to 0-based index
}

/**
 * Filter data in Excel based on specified criteria
 */
export async function filterDataOperation(
  range: string | undefined,
  column: string,
  filterType: FilterTypes,
  criteria: any
): Promise<{ range: string; filteredCount: number }> {
  return await Excel.run(async (context) => {
    try {
      let worksheet = context.workbook.worksheets.getActiveWorksheet();
      let filterRange = range ? worksheet.getRange(range) : context.workbook.getSelectedRange();

      filterRange.load("address");
      await context.sync();

      // Calculate column index - support single and multi-letter columns
      let columnIndex = columnLetterToIndex(column);

      // Ensure AutoFilter is applied to the range
      let autoFilter = worksheet.autoFilter;
      autoFilter.apply(filterRange);

      // Apply filter based on filterType and criteria
      switch (filterType) {
        case FilterTypes.Equals:
          if (!criteria || criteria.value === undefined) {
            throw new Error("Equals filter requires a 'value' property in criteria");
          }
          autoFilter.apply(filterRange, columnIndex, { 
            filterOn: Excel.FilterOn.values, 
            values: [criteria.value] 
          });
          break;

        case FilterTypes.GreaterThan:
          if (!criteria || criteria.value === undefined) {
            throw new Error("GreaterThan filter requires a 'value' property in criteria");
          }
          autoFilter.apply(filterRange, columnIndex, {
            filterOn: Excel.FilterOn.custom,
            criterion1: `>${criteria.value}`,
            operator: Excel.FilterOperator.and
          });
          break;

        case FilterTypes.LessThan:
          if (!criteria || criteria.value === undefined) {
            throw new Error("LessThan filter requires a 'value' property in criteria");
          }
          autoFilter.apply(filterRange, columnIndex, {
            filterOn: Excel.FilterOn.custom,
            criterion1: `<${criteria.value}`,
            operator: Excel.FilterOperator.and
          });
          break;

        case FilterTypes.Between:
          if (!criteria || criteria.lowerBound === undefined || criteria.upperBound === undefined) {
            throw new Error("Between filter requires 'lowerBound' and 'upperBound' properties in criteria");
          }
          autoFilter.apply(filterRange, columnIndex, {
            filterOn: Excel.FilterOn.custom,
            criterion1: `>=${criteria.lowerBound}`,
            criterion2: `<=${criteria.upperBound}`,
            operator: Excel.FilterOperator.and
          });
          break;

        case FilterTypes.Contains:
          if (!criteria || criteria.value === undefined) {
            throw new Error("Contains filter requires a 'value' property in criteria");
          }
          autoFilter.apply(filterRange, columnIndex, {
            filterOn: Excel.FilterOn.custom,
            criterion1: `*${criteria.value}*`
          });
          break;

        case FilterTypes.Values:
          if (!criteria || !Array.isArray(criteria.values) || criteria.values.length === 0) {
            throw new Error("Values filter requires a non-empty 'values' array property in criteria");
          }
          autoFilter.apply(filterRange, columnIndex, { 
            filterOn: Excel.FilterOn.values, 
            values: criteria.values 
          });
          break;

        default:
          throw new Error(`Unsupported filter type: ${filterType}`);
      }

      await context.sync();

      // Get filtered range info
      let visibleRange = filterRange.getVisibleView();
      visibleRange.load(["rowCount", "address"]);
      await context.sync();

      return {
        range: filterRange.address,
        filteredCount: visibleRange.rowCount,
      };
    } catch (error) {
      console.error("Error in filterDataOperation:", error);
      throw error;
    }
  });
}

/**
 * Sort data in Excel based on sort fields
 */
export async function sortDataOperation(
  range: string | undefined,
  sortFields: Excel.SortField[],
  matchCase?: boolean,
  hasHeaders?: boolean
): Promise<string> {
  return await Excel.run(async (context) => {
    let worksheet = context.workbook.worksheets.getActiveWorksheet();
    let sortRange = range ? worksheet.getRange(range) : context.workbook.getSelectedRange();

    sortRange.load("address");
    await context.sync();

    let sort = sortRange.sort;

    // Apply the sort
    sort.apply(sortFields, matchCase, hasHeaders);

    await context.sync();

    return `Sorted range ${sortRange.address}`;
  });
}

/**
 * Enable the native Excel AutoFilter dropdown UI on a range
 * This lets users interact with Excel's built-in filtering interface
 */
export async function enableAutoFilterUI(
  range?: string,
  hasHeaders: boolean = true
): Promise<string> {
  return await Excel.run(async (context) => {
    try {
      // Get the active worksheet
      const worksheet = context.workbook.worksheets.getActiveWorksheet();
      
      // Get the range to apply the filter to
      let filterRange = range ? worksheet.getRange(range) : context.workbook.getSelectedRange();
      
      // If the range has headers, we want to make sure the AutoFilter applies correctly
      if (hasHeaders) {
        // The range already includes the headers, so apply directly
        filterRange.load("address");
        await context.sync();
        
        // Apply the AutoFilter to the range
        worksheet.autoFilter.apply(filterRange);
      } else {
        // If no headers are present, we need to handle differently
        // First load necessary properties
        filterRange.load(["address", "rowIndex", "columnIndex", "columnCount"]);
        await context.sync();
        
        // Create a range that includes just the first row to use as headers
        const headerRowRange = worksheet.getRangeByIndexes(
          filterRange.rowIndex, 
          filterRange.columnIndex, 
          1, 
          filterRange.columnCount
        );
        
        // Apply the AutoFilter to the entire range
        worksheet.autoFilter.apply(filterRange);
      }
      
      await context.sync();
      
      return `AutoFilter UI enabled on range ${filterRange.address}`;
    } catch (error) {
      console.error("Error enabling AutoFilter UI:", error);
      throw error;
    }
  });
}

/**
 * Test function to verify the enableAutoFilterUI implementation
 * This can be called from the console for testing purposes
 */
export async function testEnableAutoFilterUI(): Promise<void> {
  try {
    // Test with default parameters (current selection, hasHeaders=true)
    const result1 = await enableAutoFilterUI();
    console.log("Test 1 result:", result1);
    
    // Test with specific range
    const result2 = await enableAutoFilterUI("A1:D10");
    console.log("Test 2 result:", result2);
    
    // Test with hasHeaders=false
    const result3 = await enableAutoFilterUI("A1:D10", false);
    console.log("Test 3 result:", result3);
    
    console.log("All tests completed successfully!");
  } catch (error) {
    console.error("Test failed:", error);
  }
} 