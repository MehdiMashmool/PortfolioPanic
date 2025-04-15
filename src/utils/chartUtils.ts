/**
 * Chart data management utilities for asset sparklines and portfolio charts
 */

export type ChartDataPoint = {
  value: number;
  timestamp: number;
};

export type AssetChartData = {
  timestamps: number[];
  prices: number[];
  min: number;
  max: number;
  data: ChartDataPoint[]; // Recharts compatible format
};

export type PortfolioHistoryData = {
  timestamps: number[];
  values: number[];
  events: PortfolioEvent[];
  annotations: PortfolioAnnotation[];
  min: number;
  max: number;
  startValue: number;
  data: ChartDataPoint[]; // Recharts compatible format
};

export type PortfolioEvent = {
  timestamp: number;
  value: number;
  type: string;
  description: string;
};

export type PortfolioAnnotation = {
  timestamp: number;
  value: number;
  text: string;
};

/**
 * Stores price history for each asset with limited data points
 */
export const assetPriceHistory: Record<string, AssetChartData> = {};

/**
 * Initialize asset price history for a new asset
 */
export const initAssetPriceHistory = (assetId: string, initialPrice: number) => {
  const timestamp = Date.now();
  assetPriceHistory[assetId] = {
    timestamps: [timestamp],
    prices: [initialPrice],
    min: initialPrice,
    max: initialPrice,
    data: [{ value: initialPrice, timestamp }]
  };
};

/**
 * Update function called when new price data arrives
 */
export const updateAssetPriceHistory = (
  assetId: string, 
  price: number, 
  timestamp = Date.now()
) => {
  // Check if enough time has passed since last update
  if (timestamp - lastGraphUpdate < UPDATE_INTERVAL) {
    return false;
  }
  
  // Initialize if not exists
  if (!assetPriceHistory[assetId]) {
    initAssetPriceHistory(assetId, price);
    return true;
  }
  
  const history = assetPriceHistory[assetId];
  
  // Add new data point
  history.timestamps.push(timestamp);
  history.prices.push(price);
  history.data.push({ value: price, timestamp });
  
  // Update min/max tracking
  history.min = Math.min(history.min, price);
  history.max = Math.max(history.max, price);
  
  // Limit history length - keep most recent 50 points
  if (history.prices.length > 50) {
    history.timestamps.shift();
    history.prices.shift();
    history.data.shift();
    
    // Recalculate min/max when removing points
    if (history.prices.length > 0) {
      history.min = Math.min(...history.prices);
      history.max = Math.max(...history.prices);
    }
  }
  
  lastGraphUpdate = timestamp;
  return true;
};

/**
 * Determine color based on price trend
 */
export const getAssetChartColors = (assetType: string, prices: number[]) => {
  // Determine if trend is up or down
  const isPositive = prices.length > 1 ? prices[prices.length-1] >= prices[0] : true;
  
  // Base color mapping
  const baseColors: Record<string, {positive: string, negative: string}> = {
    'stock': { positive: '#4A7CFF', negative: '#FF4A7C' },
    'gold': { positive: '#FFD700', negative: '#D7A700' },
    'oil': { positive: '#4CAF50', negative: '#EF5350' },
    'crypto': { positive: '#8A2BE2', negative: '#E22B8A' },
    // Fallback
    'default': { positive: '#10B981', negative: '#EF4444' }
  };
  
  // Get appropriate colors
  const colorSet = baseColors[assetType] || baseColors['default'];
  const color = isPositive ? colorSet.positive : colorSet.negative;
  
  return {
    line: color,
    area: isPositive ? 
      `${color}20` : 
      `${color}20`
  };
};

/**
 * Portfolio history data management with fixed update interval
 */
export const portfolioHistory: PortfolioHistoryData = {
  timestamps: [],
  values: [],
  events: [],
  annotations: [],
  min: 0,
  max: 0,
  startValue: 0,
  data: []
};

/**
 * Update portfolio history with new data point
 */
export const updatePortfolioHistory = (
  value: number, 
  timestamp = Date.now(), 
  event: { type: string, description: string } | null = null
) => {
  // Check if enough time has passed since last update
  if (timestamp - lastGraphUpdate < UPDATE_INTERVAL) {
    return false;
  }
  
  // Store initial value if first data point
  if (portfolioHistory.values.length === 0) {
    portfolioHistory.startValue = value;
    portfolioHistory.min = value * 0.9;
    portfolioHistory.max = value * 1.1;
  }
  
  // Add new data point
  portfolioHistory.timestamps.push(timestamp);
  portfolioHistory.values.push(value);
  portfolioHistory.data.push({ value, timestamp });
  
  // Track min/max with 10% padding
  portfolioHistory.min = Math.min(portfolioHistory.min, value * 0.9);
  portfolioHistory.max = Math.max(portfolioHistory.max, value * 1.1);
  
  // Add event if provided
  if (event) {
    portfolioHistory.events.push({
      timestamp,
      value,
      type: event.type,
      description: event.description
    });
  }
  
  // Keep reasonable history size
  if (portfolioHistory.values.length > 200) {
    portfolioHistory.timestamps.shift();
    portfolioHistory.values.shift();
    portfolioHistory.data.shift();
  }
  
  lastGraphUpdate = timestamp;
  return true;
};

/**
 * Generate enhanced sparkline data with more visual fluctuations
 */
export const generateEnhancedSparklineData = (
  asset: { price: number, previousPrice: number, volatility: number },
  length = 20
): ChartDataPoint[] => {
  // Start and end with the actual prices for accuracy
  const basePrice = asset.price;
  const previousPrice = asset.previousPrice;
  const volatility = asset.volatility;
  
  const history: ChartDataPoint[] = [{ value: previousPrice, timestamp: Date.now() - (length * 500) }];

  // Generate intermediate points with appropriate volatility - amplified for better visual effect
  for (let i = 1; i < length - 1; i++) {
    // Calculate a position factor (0-1) representing where in the sequence we are
    const position = i / (length - 1);
    
    // Start trending toward the final price after the midpoint
    const trendFactor = position > 0.5 ? (position - 0.5) * 2 : 0;
    
    // Base the intermediate value on a weighted average of start and end prices
    const baseValue = previousPrice * (1 - position) + basePrice * position;
    
    // Apply volatility - higher volatility = more dramatic swings
    // Scaled volatility for better visual effect - amplifying by 1.5x
    const deviation = (Math.random() - 0.5) * volatility * basePrice * 0.6;
    
    // Combine trend and volatility with a weighted random walk
    const value = baseValue + deviation * (1 - trendFactor);
    
    history.push({ 
      value, 
      timestamp: history[0].timestamp + (i * 500)
    });
  }

  // Ensure the last point is exactly the current price
  history.push({ value: basePrice, timestamp: Date.now() });
  
  return history;
};

const UPDATE_INTERVAL = 3000; // 3 seconds between updates
let lastGraphUpdate = 0;
