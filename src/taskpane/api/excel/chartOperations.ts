/* global Excel, console */

/**
 * File: src/taskpane/api/excel/chartOperations.ts
 * Contains functions for creating and managing charts in Excel
 * Dependencies: Excel API
 * Used by: API layer and tool functions
 */

/**
 * Add a chart to the Excel worksheet
 */
export async function addChartOperation(dataRange: string, chartType: Excel.ChartType): Promise<void> {
  try {
    await Excel.run(async (context) => {
      const sheet = context.workbook.worksheets.getActiveWorksheet();
      const range = sheet.getRange(dataRange);
      const chart = sheet.charts.add(chartType, range, Excel.ChartSeriesBy.auto);

      // Set some chart properties
      chart.title.text = "New Chart";
      chart.legend.position = Excel.ChartLegendPosition.right;
      chart.height = 300;
      chart.width = 500;

      // Position the chart. You can adjust these values as needed.
      chart.setPosition("A15", "F30");

      await context.sync();

      // Reset selection to A1 or another valid cell
      sheet.getRange("A1").select();

      await context.sync();
    });
  } catch (error) {
    console.error("Error in addChartOperation:", error);
    throw error;
  }
}

/**
 * Add a pivot table to the Excel worksheet
 */
export async function addPivotTableOperation(
  sourceDataRange: string,
  destinationCell: string,
  rowFields: string[],
  columnFields: string[],
  dataFields: Array<{ name: string; function: Excel.AggregationFunction }>,
  filterFields: string[] = []
): Promise<void> {
  try {
    await Excel.run(async (context) => {
      const sheet = context.workbook.worksheets.getActiveWorksheet();
      const sourceRange = sheet.getRange(sourceDataRange);
      const destinationRange = sheet.getRange(destinationCell);

      const pivotTable = sheet.pivotTables.add("NewPivotTable", sourceRange, destinationRange);

      // Add row fields
      rowFields.forEach((field) => {
        pivotTable.rowHierarchies.add(pivotTable.hierarchies.getItem(field));
      });

      // Add column fields
      columnFields.forEach((field) => {
        pivotTable.columnHierarchies.add(pivotTable.hierarchies.getItem(field));
      });

      // Add data fields
      dataFields.forEach((field) => {
        const dataHierarchy = pivotTable.dataHierarchies.add(pivotTable.hierarchies.getItem(field.name));
        dataHierarchy.summarizeBy = field.function;
      });

      // Add filter fields
      filterFields.forEach((field) => {
        pivotTable.filterHierarchies.add(pivotTable.hierarchies.getItem(field));
      });

      await context.sync();
    });
  } catch (error) {
    console.error("Error in addPivotTableOperation:", error);
    throw error;
  }
} 