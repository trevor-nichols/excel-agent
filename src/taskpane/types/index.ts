/* Excel Operation Types */
export enum ChartType {
  _3DArea = "3DArea",
  _3DAreaStacked = "3DAreaStacked",
  _3DAreaStacked100 = "3DAreaStacked100",
  _3DBarClustered = "3DBarClustered",
  _3DBarStacked = "3DBarStacked",
  _3DBarStacked100 = "3DBarStacked100",
  _3DColumn = "3DColumn",
  _3DColumnClustered = "3DColumnClustered",
  _3DColumnStacked = "3DColumnStacked",
  _3DColumnStacked100 = "3DColumnStacked100",
  _3DLine = "3DLine",
  _3DPie = "3DPie",
  _3DPieExploded = "3DPieExploded",
  area = "Area",
  areaStacked = "AreaStacked",
  areaStacked100 = "AreaStacked100",
  barClustered = "BarClustered",
  barOfPie = "BarOfPie",
  barStacked = "BarStacked",
  barStacked100 = "BarStacked100",
  boxwhisker = "Boxwhisker",
  bubble = "Bubble",
  bubble3DEffect = "Bubble3DEffect",
  columnClustered = "ColumnClustered",
  columnStacked = "ColumnStacked",
  columnStacked100 = "ColumnStacked100",
  coneBarClustered = "ConeBarClustered",
  coneBarStacked = "ConeBarStacked",
  coneBarStacked100 = "ConeBarStacked100",
  coneCol = "ConeCol",
  coneColClustered = "ConeColClustered",
  coneColStacked = "ConeColStacked",
  coneColStacked100 = "ConeColStacked100",
  cylinderBarClustered = "CylinderBarClustered",
  cylinderBarStacked = "CylinderBarStacked",
  cylinderBarStacked100 = "CylinderBarStacked100",
  cylinderCol = "CylinderCol",
  cylinderColClustered = "CylinderColClustered",
  cylinderColStacked = "CylinderColStacked",
  cylinderColStacked100 = "CylinderColStacked100",
  doughnut = "Doughnut",
  doughnutExploded = "DoughnutExploded",
  funnel = "Funnel",
  histogram = "Histogram",
  invalid = "Invalid",
  line = "Line",
  lineMarkers = "LineMarkers",
  lineMarkersStacked = "LineMarkersStacked",
  lineMarkersStacked100 = "LineMarkersStacked100",
  lineStacked = "LineStacked",
  lineStacked100 = "LineStacked100",
  pareto = "Pareto",
  pie = "Pie",
  pieExploded = "PieExploded",
  pieOfPie = "PieOfPie",
  pyramidBarClustered = "PyramidBarClustered",
  pyramidBarStacked = "PyramidBarStacked",
  pyramidBarStacked100 = "PyramidBarStacked100",
  pyramidCol = "PyramidCol",
  pyramidColClustered = "PyramidColClustered",
  pyramidColStacked = "PyramidColStacked",
  pyramidColStacked100 = "PyramidColStacked100",
  radar = "Radar",
  radarFilled = "RadarFilled",
  radarMarkers = "RadarMarkers",
  regionMap = "RegionMap",
  stockHLC = "StockHLC",
  stockOHLC = "StockOHLC",
  stockVHLC = "StockVHLC",
  stockVOHLC = "StockVOHLC",
  sunburst = "Sunburst",
  surface = "Surface",
  surfaceTopView = "SurfaceTopView",
  surfaceTopViewWireframe = "SurfaceTopViewWireframe",
  surfaceWireframe = "SurfaceWireframe",
  treemap = "Treemap",
  waterfall = "Waterfall",
  xyscatter = "XYScatter",
  xyscatterLines = "XYScatterLines",
  xyscatterLinesNoMarkers = "XYScatterLinesNoMarkers",
  xyscatterSmooth = "XYScatterSmooth",
  xyscatterSmoothNoMarkers = "XYScatterSmoothNoMarkers",
}

export enum ChartAxisCategoryType {
  Automatic = "Automatic", 
  DateAxis = "DateAxis", 
  TextAxis = "TextAxis", 
}

export enum ChartColorScheme {
  ColorfulPalette1 = "ColorfulPalette1",
  ColorfulPalette2 = "ColorfulPalette2",
  ColorfulPalette3 = "ColorfulPalette3",
  ColorfulPalette4 = "ColorfulPalette4",
  MonochromaticPalette1 = "MonochromaticPalette1",
  MonochromaticPalette2 = "MonochromaticPalette2",
  MonochromaticPalette3 = "MonochromaticPalette3",
  MonochromaticPalette4 = "MonochromaticPalette4",
  MonochromaticPalette5 = "MonochromaticPalette5",
  MonochromaticPalette6 = "MonochromaticPalette6",
  MonochromaticPalette7 = "MonochromaticPalette7",
  MonochromaticPalette8 = "MonochromaticPalette8",
  MonochromaticPalette9 = "MonochromaticPalette9",
  MonochromaticPalette10 = "MonochromaticPalette10",
  MonochromaticPalette11 = "MonochromaticPalette11",
  MonochromaticPalette12 = "MonochromaticPalette12",
  MonochromaticPalette13 = "MonochromaticPalette13",
}

/**
 * FilterTypes enum - Specific filter types used in filter operations
 * This enum contains only the filter types that our implementation supports
 */
export enum FilterTypes {
  Equals = "Equals",
  GreaterThan = "GreaterThan",
  LessThan = "LessThan",
  Between = "Between",
  Contains = "Contains",
  Values = "Values"
}

/* Retain existing Filters enum for compatibility */
export enum Filters {
  After = "After",
  AfterOrEqualTo = "AfterOrEqualTo",
  AllDatesInPeriodApril = "AllDatesInPeriodApril",
  AllDatesInPeriodAugust = "AllDatesInPeriodAugust",
  AllDatesInPeriodDecember = "AllDatesInPeriodDecember",
  AllDatesInPeriodFebruary = "AllDatesInPeriodFebruary",
  AllDatesInPeriodJanuary = "AllDatesInPeriodJanuary",
  AllDatesInPeriodJuly = "AllDatesInPeriodJuly",
  AllDatesInPeriodJune = "AllDatesInPeriodJune",
  AllDatesInPeriodMarch = "AllDatesInPeriodMarch",
  AllDatesInPeriodMay = "AllDatesInPeriodMay",
  AllDatesInPeriodNovember = "AllDatesInPeriodNovember",
  AllDatesInPeriodOctober = "AllDatesInPeriodOctober",
  AllDatesInPeriodQuarter1 = "AllDatesInPeriodQuarter1",
  AllDatesInPeriodQuarter2 = "AllDatesInPeriodQuarter2",
  AllDatesInPeriodQuarter3 = "AllDatesInPeriodQuarter3",
  AllDatesInPeriodQuarter4 = "AllDatesInPeriodQuarter4",
  AllDatesInPeriodSeptember = "AllDatesInPeriodSeptember",
  Before = "Before",
  BeforeOrEqualTo = "BeforeOrEqualTo",
  Between = "Between",
  Equals = "Equals",
  LastMonth = "LastMonth",
  LastQuarter = "LastQuarter",
  LastWeek = "LastWeek",
  LastYear = "LastYear",
  NextMonth = "NextMonth",
  NextQuarter = "NextQuarter",
  NextWeek = "NextWeek",
  NextYear = "NextYear",
  ThisMonth = "ThisMonth",
  ThisQuarter = "ThisQuarter",
  ThisWeek = "ThisWeek",
  ThisYear = "ThisYear",
  Today = "Today",
  Tomorrow = "Tomorrow",
  Unknown = "Unknown",
  YearToDate = "YearToDate",
  Yesterday = "Yesterday",
  AboveAverage = "AboveAverage",
  BelowAverage = "BelowAverage",
  Day = "Day",
  Hour = "Hour",
  Minute = "Minute",
  Month = "Month",
  Second = "Second",
  Year = "Year",
  BottomItems = "BottomItems",
  BottomPercent = "BottomPercent",
  CellColor = "CellColor",
  Custom = "Custom",
  Dynamic = "Dynamic",
  FontColor = "FontColor",
  Icon = "Icon",
  TopItems = "TopItems",
  TopPercent = "TopPercent",
  Values = "Values",
  And = "And",
  Or = "Or",
  BeginsWith = "BeginsWith",
  EndsWith = "EndsWith",
  GreaterThan = "GreaterThan",
  GreaterThanOrEqualTo = "GreaterThanOrEqualTo",
  LessThan = "LessThan",
  LessThanOrEqualTo = "LessThanOrEqualTo",
  BottomN = "BottomN",
  TopN = "TopN",
}

export enum FormatOptions {
  // Border styles
  DiagonalDown = "DiagonalDown",
  DiagonalUp = "DiagonalUp",
  EdgeBottom = "EdgeBottom",
  EdgeLeft = "EdgeLeft",
  EdgeRight = "EdgeRight",
  EdgeTop = "EdgeTop",
  InsideHorizontal = "InsideHorizontal",
  InsideVertical = "InsideVertical",
  
  // Line styles
  Continuous = "Continuous",
  Dash = "Dash",
  DashDot = "DashDot",
  DashDotDot = "DashDotDot",
  Dot = "Dot",
  Double = "Double",
  None = "None",
  SlantDashDot = "SlantDashDot",
  
  // Weight options
  Hairline = "Hairline",
  Medium = "Medium",
  Thick = "Thick",
  Thin = "Thin",
  
  // Cell value types
  Array = "Array",
  Boolean = "Boolean",
  Empty = "Empty",
  Entity = "Entity",
  Error = "Error",
  ExternalCodeServiceObject = "ExternalCodeServiceObject",
  FormattedNumber = "FormattedNumber",
  LinkedEntity = "LinkedEntity",
  LocalImage = "LocalImage",
  NotAvailable = "NotAvailable",
  Reference = "Reference",
  String = "String",
  WebImage = "WebImage",
  
  // Fill patterns
  Checker = "Checker",
  CrissCross = "CrissCross",
  Down = "Down",
  Gray16 = "Gray16",
  Gray25 = "Gray25",
  Gray50 = "Gray50",
  Gray75 = "Gray75",
  Gray8 = "Gray8",
  Grid = "Grid",
  Horizontal = "Horizontal",
  LightDown = "LightDown",
  LightHorizontal = "LightHorizontal",
  LightUp = "LightUp",
  LightVertical = "LightVertical",
  LinearGradient = "LinearGradient",
  RectangularGradient = "RectangularGradient",
  SemiGray75 = "SemiGray75",
  Solid = "Solid",
  Up = "Up",
  Vertical = "Vertical",
  
  // Number format categories
  Accounting = "Accounting",
  Currency = "Currency",
  Custom = "Custom",
  Date = "Date",
  Fraction = "Fraction",
  General = "General",
  Number = "Number",
  Percentage = "Percentage",
  Scientific = "Scientific",
  Special = "Special",
  TextFormat = "Text",
  Time = "Time",
  
  // Special cell types
  Blanks = "Blanks",
  ConditionalFormats = "ConditionalFormats",
  Constants = "Constants",
  DataValidations = "DataValidations",
  Formulas = "Formulas",
  SameConditionalFormat = "SameConditionalFormat",
  SameDataValidation = "SameDataValidation",
  Visible = "Visible",
  
  // Value types
  AllCells = "All",
  Errors = "Errors",
  ErrorsLogical = "ErrorsLogical",
  ErrorsLogicalNumber = "ErrorsLogicalNumber",
  ErrorsLogicalText = "ErrorsLogicalText",
  ErrorsNumbers = "ErrorsNumbers",
  ErrorsNumberText = "ErrorsNumberText",
  ErrorsText = "ErrorsText",
  Logical = "Logical",
  LogicalNumbers = "LogicalNumbers",
  LogicalNumbersText = "LogicalNumbersText",
  LogicalText = "LogicalText",
  Numbers = "Numbers",
  NumbersText = "NumbersText",
  TextCells = "TextCells",
  
  // Clear options
  All = "All",
  Contents = "Contents",
  Formats = "Formats",
  Hyperlinks = "Hyperlinks",
  RemoveHyperlinks = "RemoveHyperlinks",
}

export interface SortField {
  key: number;
  ascending: boolean;
  color?: string;
  dataOption?: SortDataOption;
  icon?: Excel.IconSet;
  subField?: string;
}

export enum SortDataOption {
  Normal = "normal",
  TextAsNumber = "textAsNumber",
}

export enum SortOn {
  Value = "value",
  CellColor = "cellColor",
  FontColor = "fontColor",
  Icon = "icon",
}

export enum SortMethod {
  PinYinSort = "pinYinSort",
  StrokeSort = "strokeSort",
}

export enum SortOrientation {
  Rows = "rows",
  Columns = "columns",
}

/* Component Types */
export interface AppProps {
  title: string;
}

export interface ChatInterfaceProps {
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface HeaderProps {
  logo: string;
  title: string;
}

export interface MessageItemProps {
  isUser: boolean;
  children: React.ReactNode;
  worksheetNames: string[];
}

export interface MessageListProps {
  messages: Array<{ text: string; isUser: boolean }>;
  worksheetNames: string[];
}

export interface SplashScreenProps {
  opacity: number;
}

export interface UserInputProps {
  onSendMessage: (text: string, taggedSheets: string[]) => void;
  worksheetNames: string[];
}

export enum PivotAggregationFunction {
  Sum = "sum",
  Count = "count",
  Average = "average",
  Max = "max",
  Min = "min",
  Product = "product",
  CountNumbers = "countNumbers",
  StdDev = "stdDev",
  StdDevP = "stdDevP",
  Var = "var",
  VarP = "varP"
} 