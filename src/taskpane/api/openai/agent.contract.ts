/**
 * Lightweight contract checks for tool schemas.
 * Run manually in dev to ensure schema shapes accept representative inputs.
 */
import { excelToolSchemas } from "./agent";

export function runAgentSchemaContracts() {
  const samples = {
    writeToExcel: { startCell: "A1", values: [["hello", 1]] },
    readFromExcel: { cellAddress: "B2" },
    addChart: { dataRange: "A1:B5", chartType: "ColumnClustered" },
    addPivot: {
      sourceDataRange: "A1:D20",
      destinationCell: "G1",
      rowFields: ["Region"],
      columnFields: ["Quarter"],
      dataFields: [{ name: "Sales", function: "sum" }],
      filterFields: ["Year"],
    },
    filterData: {
      range: "A1:D10",
      column: "A",
      filterType: "Equals",
      criteria: { value: "North" },
    },
  };

  Object.entries(samples).forEach(([key, value]) => {
    const schema = (excelToolSchemas as any)[key];
    if (!schema) {
      throw new Error(`Missing schema for ${key}`);
    }
    const result = schema.safeParse(value);
    if (!result.success) {
      throw new Error(`Schema contract failed for ${key}: ${result.error.message}`);
    }
  });

  return true;
}

// Allow ad-hoc execution in dev
if (typeof require !== "undefined" && require.main === module) {
  try {
    runAgentSchemaContracts();
    // eslint-disable-next-line no-console
    console.log("Agent schema contracts passed.");
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exitCode = 1;
  }
}

