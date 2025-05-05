/* global Excel, console */

/**
 * File: src/taskpane/api/excel/worksheetOperations.ts
 * Contains functions for working with Excel worksheets
 * Dependencies: Excel API
 * Used by: API layer and tool functions
 */

/**
 * Get the names of all worksheets in the current workbook
 */
export async function getWorksheetNames(): Promise<string[]> {
  return await Excel.run(async (context) => {
    const worksheets = context.workbook.worksheets;
    worksheets.load("items/name");
    await context.sync();
    return worksheets.items.map((sheet) => sheet.name);
  });
}

/**
 * Get the name of the currently active worksheet
 */
export async function getActiveWorksheetName(): Promise<string> {
  return await Excel.run(async (context) => {
    const activeWorksheet = context.workbook.worksheets.getActiveWorksheet();
    activeWorksheet.load("name");
    await context.sync();
    return activeWorksheet.name;
  });
}

/**
 * Create a new worksheet or delete an existing one
 */
export async function manageWorksheet(action: "create" | "delete", sheetName: string): Promise<string> {
  try {
    return await Excel.run(async (context) => {
      if (action === "create") {
        const newSheet = context.workbook.worksheets.add(sheetName);
        await context.sync();
        return `New worksheet "${sheetName}" has been created.`;
      } else if (action === "delete") {
        const sheet = context.workbook.worksheets.getItem(sheetName);
        sheet.delete();
        await context.sync();
        return `Worksheet "${sheetName}" has been deleted.`;
      } else {
        throw new Error('Invalid action. Use "create" or "delete".');
      }
    });
  } catch (error) {
    console.error(`Error ${action}ing worksheet:`, error);
    throw error;
  }
} 