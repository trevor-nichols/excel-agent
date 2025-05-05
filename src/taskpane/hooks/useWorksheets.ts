/**
 * File: src/taskpane/hooks/useWorksheets.ts
 * Custom hook for managing worksheet information
 * Dependencies: Excel API, Office JS
 * Used by: ChatInterface component
 */

import * as React from "react";
import { getWorksheetNames, getActiveWorksheetName } from "../api/excel";

/**
 * Custom hook for managing Excel worksheet information
 */
export function useWorksheets() {
  const [worksheetNames, setWorksheetNames] = React.useState<string[]>([]);
  const [activeWorksheet, setActiveWorksheet] = React.useState<string>("");

  /**
   * Fetch all worksheet names from the workbook
   */
  const fetchWorksheetNames = async () => {
    try {
      const names = await getWorksheetNames();
      setWorksheetNames(names);
      return names;
    } catch (error) {
      console.error("Error fetching worksheet names:", error);
      return [];
    }
  };

  /**
   * Update the active worksheet name
   */
  const updateActiveWorksheet = async () => {
    try {
      const name = await getActiveWorksheetName();
      setActiveWorksheet(name);
      return name;
    } catch (error) {
      console.error("Error fetching active worksheet name:", error);
      return "";
    }
  };

  // Initialize worksheet names when component mounts
  React.useEffect(() => {
    fetchWorksheetNames();
  }, []);

  // Set up worksheet activation event handler
  React.useEffect(() => {
    const setupEventHandler = async () => {
      await updateActiveWorksheet();

      // Set up an event listener for worksheet activation
      if (Office?.context?.document) {
        Office.context.document.addHandlerAsync(Office.EventType.ActiveViewChanged, updateActiveWorksheet);
      }
    };

    setupEventHandler();

    // Clean up the event listener when component unmounts
    return () => {
      if (Office?.context?.document) {
        Office.context.document.removeHandlerAsync(Office.EventType.ActiveViewChanged, updateActiveWorksheet);
      }
    };
  }, []);

  return {
    worksheetNames,
    activeWorksheet,
    fetchWorksheetNames,
    updateActiveWorksheet,
  };
} 