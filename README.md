# Excel Assistant

A modern AI-powered Excel add-in that enables natural language interaction with your spreadsheets using OpenAI's GPT-4o model.

## Features

- **Natural Language Interface**: Interact with Excel using plain English commands
- **Intelligent Data Operations**: Create charts, pivot tables, format cells, and more
- **Multi-Worksheet Support**: Tag specific worksheets in your queries using @worksheet syntax
- **AI-Powered Analysis**: Get insights and summaries of your data
- **Embedding Support**: Create embeddings of worksheet data for improved context

## Core Capabilities

- **Data Manipulation**:
  - Read and write cell values
  - Format cells (colors, bold, etc.)
  - Create and manage worksheets
  - Merge/unmerge cells
  - Autofit rows and columns

- **Data Visualization**:
  - Create various chart types
  - Add pivot tables with customizable fields
  - Apply conditional formatting

- **Data Analysis**:
  - Filter data with multiple criteria
  - Sort data with complex conditions
  - Analyze trends and distributions
  - Generate summaries

## Technology Stack

- **Frontend**: React 18.2.0 with TypeScript
- **UI Components**: FluentUI React v9
- **AI Integration**: OpenAI API (GPT-4o)
- **Office Integration**: Office.js API
- **Bundling**: Webpack 5

## Getting Started

### Prerequisites

- Node.js (latest LTS version recommended)
- npm or yarn
- Microsoft Excel (desktop or web version)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd excel-assistant
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev-server
   ```

4. Sideload the add-in in Excel:
   - For Excel desktop: `npm run start:desktop`
   - For Excel web: `npm run start:web`

### Configuration

1. Obtain an OpenAI API key from [OpenAI Platform](https://platform.openai.com)
2. Enter your API key in the Settings panel of the add-in

## Usage Examples

### Basic Operations

- "Create a chart showing sales by region using data in A1:D10"
- "Format cells A1:A10 with yellow background and bold text"
- "Create a pivot table from data in Sheet1 with Product in rows and Region in columns"

### Advanced Operations

- "Analyze the trend of sales data in the selected range"
- "Filter the data to show only values greater than 1000 in column C"
- "Create a new worksheet named 'Summary' and add a pivot table with the total sales by product"

### Multi-Worksheet Operations

- "Compare sales data between @Q1 and @Q2 worksheets"
- "Create a chart combining data from @Revenue and @Expenses"
- "Analyze all data in the @workbook"

## Development

### Project Structure

- `/src/taskpane/` - Main application code
  - `/components/` - React components
    - `/chat/` - Chat interface components
    - `/settings/` - Settings panel components
    - `/shared/` - Shared components like Header
  - `/api/` - Excel operations and API integrations
  - `/types/` - TypeScript type definitions
  - `/styles/` - Global CSS styles

### Building for Production

```
npm run build
```

### Troubleshooting 
It looks like you're encountering a file linking error when trying to sideload your Excel add-in. This is happening because there's already a manifest file registered with the same ID in your Excel container.

Here's how to fix it and start your add-in properly:

1. First, stop any running processes:
   ```
   npm run stop
   ```

2. Clear the existing manifest file:
   ```
   rm '/Users/tan/Library/Containers/com.microsoft.Excel/Data/Documents/wef/90bc00b5-076b-4ab2-bd95-0c9df19c1320.manifest.xml'
   ```

3. Make sure Excel is completely closed (quit the application)

4. Restart your development server:
   ```
   npm run dev-server
   ```

5. In a new terminal window, start the add-in:
   ```
   npm run start:desktop
   ```

If you're still having issues, you can try these additional steps:

1. Clear all cached manifests:
   ```
   rm -rf ~/Library/Containers/com.microsoft.Excel/Data/Documents/wef/
   ```

2. Validate your manifest file:
   ```
   npm run validate
   ```

3. If you've made changes to the manifest, make sure to rebuild:
   ```
   npm run build
   ```

The error occurs because the system is trying to create a symbolic link that already exists. This typically happens when the add-in wasn't properly unloaded in a previous session or when Excel crashed while the add-in was running.
