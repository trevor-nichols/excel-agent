├── .hintrc  # Configuration file for webhint, a code quality and compatibility tool.
├── assets/  # Global static image assets for the add-in.
│   ├── SplashScreen_background.png
│   ├── background.png
│   ├── loading_spinner.png
│   └── logo-filled.png
├── excel_docs/  # Contains documentation and data about the Excel JavaScript API.
│   └── api/  # Contains raw data files listing Excel JavaScript API members.
│       └── consolidated/  # Contains consolidated API listings in different formats.
├── manifest.xml  # The Office Add-in manifest file defining its properties, UI, and commands.
└── src/  # Main source code directory for the application.
    ├── assets/  # Source image assets to be bundled with the final build.
    │   ├── SplashScreen_background.png
    │   ├── background.png
    │   ├── loading_spinner.png
    │   └── logo-filled.png
    ├── commands/  # Logic for Office ribbon commands.
    │   └── commands.ts  # Defines and registers functions for custom add-in commands on the ribbon.
    └── taskpane/  # Source code for the add-in's main task pane user interface.
        ├── App.tsx  # The root React component that assembles the main application UI.
        ├── api/  # Modules for interacting with external APIs (Excel, OpenAI).
        │   ├── excel/  # Functions for interacting with the Excel JavaScript API.
        │   │   ├── cellOperations.ts  # API functions for cell-level actions (read, write, format).
        │   │   ├── chartOperations.ts  # API functions for creating charts and pivot tables.
        │   │   ├── dataOperations.ts  # API functions for data manipulation (sort, filter, analyze).
        │   │   ├── formatOperations.ts  # API functions for applying conditional formatting.
        │   │   ├── index.ts  # Barrel file exporting all Excel API functions for consolidated importing.
        │   │   ├── rangeOperations.ts  # API functions for range-level actions (merge, autofit, get data).
        │   │   └── worksheetOperations.ts  # API functions for managing worksheets.
        │   ├── index.ts  # Main barrel file re-exporting all API modules.
        │   └── openai/  # Functions for interacting with the OpenAI API.
        │       ├── client.ts  # Initializes and configures the OpenAI client.
        │       ├── embeddingOperations.ts  # Functions to create vector embeddings from worksheet data.
        │       ├── index.ts  # Barrel file exporting all OpenAI API functions.
        │       └── tools/  # Defines functions (tools) callable by the OpenAI model.
        │           ├── categories/  # Organizes tool definitions by their function.
        │           │   ├── cellTools.ts  # Defines AI tools for cell-level operations.
        │           │   ├── chartTools.ts  # Defines AI tools for creating charts and pivot tables.
        │           │   ├── dataTools.ts  # Defines AI tools for data analysis, sorting, and filtering.
        │           │   ├── formatTools.ts  # Defines AI tools for cell and conditional formatting.
        │           │   ├── index.ts  # Barrel file exporting all tool category modules.
        │           │   ├── rangeTools.ts  # Defines AI tools for Excel range operations.
        │           │   └── worksheetTools.ts  # Defines AI tools for worksheet management.
        │           ├── index.ts  # Barrel file exporting all tool definitions.
        │           └── toolDefinitions.ts  # Aggregates all tool definitions for the OpenAI API.
        ├── assets/  # Assets used specifically within the taskpane components.
        │   ├── SplashScreen_background copy.png
        │   ├── SplashScreen_background.png
        │   ├── background.png
        │   ├── loading_spinner copy.png
        │   ├── loading_spinner.png
        │   └── logo-filled.png
        ├── components/  # Reusable React UI components (likely older, pre-refactor versions).
        │   ├── App.tsx  # Older version of the main App component, contains many Excel API enums.
        │   ├── ChatInterface.tsx  # An empty placeholder file for a ChatInterface component.
        │   ├── Header.tsx  # An older version of the Header component.
        │   ├── MessageItem.tsx  # An older version of the MessageItem component.
        │   ├── MessageList.tsx  # An older version of the MessageList component.
        │   ├── SettingsPanel.tsx  # A dialog component for application settings like the API key.
        │   ├── SplashScreen.tsx  # An older version of the SplashScreen component.
        │   ├── UserInput.tsx  # An older version of the UserInput component.
        │   ├── chat/  # Components specifically for the chat interface.
        │   │   ├── ChatInterface.tsx  # Main component managing the chat UI, state, and API calls.
        │   │   ├── MarkdownRenderer.test.tsx  # Jest tests for the MarkdownRenderer component.
        │   │   ├── MarkdownRenderer.tsx  # Renders markdown with syntax highlighting and @worksheet mentions.
        │   │   ├── MessageItem.test.tsx  # Jest tests for the MessageItem component.
        │   │   ├── MessageItem.tsx  # Renders a single chat message bubble from either user or AI.
        │   │   ├── MessageList.tsx  # Renders the scrollable list of chat messages and typing indicator.
        │   │   ├── TypingIndicator.tsx  # Displays an animation while the AI is generating a response.
        │   │   ├── UserInput.test.tsx  # Jest tests for the UserInput component.
        │   │   ├── UserInput.tsx  # Provides the text input area for users to type messages, including @-mention logic.
        │   │   └── styles/  # Contains CSS files for chat components.
        │   └── shared/  # Components used across different parts of the UI.
        │       ├── Header.tsx  # The main application header component.
        │       ├── SplashScreen.tsx  # The splash screen shown on application startup.
        │       └── styles/  # Contains CSS files for shared components.
        ├── embedding_operations.ts  # Deprecated file for OpenAI embeddings; logic moved to api/openai.
        ├── excelOperations.ts  # Deprecated monolithic file for Excel functions; logic moved to api/excel.
        ├── hooks/  # Custom React hooks for managing state and side effects.
        │   ├── index.ts  # Barrel file exporting all custom hooks for consolidated importing.
        │   ├── useAI.ts  # Hook for handling OpenAI API calls and tool execution logic.
        │   ├── useChatMessages.ts  # Hook for managing the state of the chat message history.
        │   ├── useOpenAITools.ts  # Hook that maps OpenAI tool calls to specific Excel functions.
        │   └── useWorksheets.ts  # Hook for managing worksheet names and tracking the active sheet.
        ├── index.tsx  # The main entry point for the React application in the task pane.
        ├── styles/  # Global styles for the taskpane.
        ├── taskpane.ts  # Utility functions related to the Office task pane itself.
        ├── types/  # TypeScript type definitions and enums for the project.
        │   └── index.ts  # Defines and exports various TypeScript enums and interfaces for the project.
        └── utils/  # Directory for utility functions.