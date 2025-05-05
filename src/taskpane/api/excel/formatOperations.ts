/* global Excel, console */

/**
 * File: src/taskpane/api/excel/formatOperations.ts
 * Contains functions for formatting Excel cells and applying conditional formatting
 * Dependencies: Excel API
 * Used by: API layer and tool functions
 */

/**
 * Apply conditional formatting to a range in Excel
 */
export async function applyConditionalFormat(
  range: string,
  formatType: Excel.ConditionalFormatType,
  rule: any,
  format?: Excel.ConditionalRangeFormat
): Promise<string> {
  return await Excel.run(async (context) => {
    const sheet = context.workbook.worksheets.getActiveWorksheet();
    const rangeObject = sheet.getRange(range);

    const conditionalFormat = rangeObject.conditionalFormats.add(formatType);

    // Apply the rule based on the format type
    switch (formatType) {
      case Excel.ConditionalFormatType.cellValue:
        conditionalFormat.cellValue.rule = rule;
        if (format) {
          Object.assign(conditionalFormat.cellValue.format, format);
        }
        break;
      case Excel.ConditionalFormatType.colorScale:
        conditionalFormat.colorScale.criteria = rule;
        break;
      case Excel.ConditionalFormatType.dataBar:
        Object.assign(conditionalFormat.dataBar, rule);
        break;
      case Excel.ConditionalFormatType.iconSet:
        Object.assign(conditionalFormat.iconSet, rule);
        break;
      case Excel.ConditionalFormatType.presetCriteria:
        conditionalFormat.preset.rule = rule;
        if (format) {
          Object.assign(conditionalFormat.preset.format, format);
        }
        break;
      case Excel.ConditionalFormatType.containsText:
        conditionalFormat.textComparison.rule = rule;
        if (format) {
          Object.assign(conditionalFormat.textComparison.format, format);
        }
        break;
      case Excel.ConditionalFormatType.custom:
        conditionalFormat.custom.rule.formula = rule.formula;
        if (format) {
          Object.assign(conditionalFormat.custom.format, format);
        }
        break;
      // Add cases for other format types as needed
    }

    await context.sync();
    return `Conditional format applied to range ${range}`;
  });
}

/**
 * Clear all conditional formats from a range in Excel
 */
export async function clearConditionalFormats(range: string): Promise<string> {
  return await Excel.run(async (context) => {
    const sheet = context.workbook.worksheets.getActiveWorksheet();
    const rangeObject = sheet.getRange(range);
    rangeObject.conditionalFormats.clearAll();
    await context.sync();
    return `Conditional formats cleared from range ${range}`;
  });
} 