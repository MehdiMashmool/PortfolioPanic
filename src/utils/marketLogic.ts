
import type { Asset, NewsItem } from '../types/game';

// Asset volatility calibration - real market data
const ASSET_VOLATILITY = {
  stock: 0.0172,  // ~1.72% daily volatility (tech stocks)
  gold: 0.0089,   // ~0.89% daily volatility (gold)
  oil: 0.0218,    // ~2.18% daily volatility (oil)
  crypto: 0.0347  // ~3.47% daily volatility (bitcoin)
};

// Correlation matrix between different asset types
const CORRELATION_MATRIX = {
  stock:  { stock: 1.0,  gold: -0.2, oil: 0.3,  crypto: 0.4  },
  gold:   { stock: -0.2, gold: 1.0,  oil: 0.0,  crypto: 0.1  },
  oil:    { stock: 0.3,  gold: 0.0,  oil: 1.0,  crypto: 0.2  },
  crypto: { stock: 0.4,  gold: 0.1,  oil: 0.2,  crypto: 1.0  }
};

// Generate a normally distributed random number using Box-Muller transform
function normalRandom(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// Calculate new prices based on previous price, volatility, market conditions and news
export const calculateNewPrices = (
  asset: Asset,
  newsItems: NewsItem[],
  marketHealth: number
): number => {
  // Get base volatility for this asset type
  const baseVolatility = ASSET_VOLATILITY[asset.color as keyof typeof ASSET_VOLATILITY] || 0.01;
  
  // Time step - assume 1/60th of a game minute (equivalent to ~4 market hours)
  const timeStep = 1/60;
  
  // Scale volatility based on asset's individual volatility rating (0-1)
  const assetVolatility = baseVolatility * asset.volatility * 2;
  
  // Adjust volatility based on market health (lower health = higher volatility)
  const marketVolatilityFactor = 1 + ((100 - marketHealth) / 100);
  const adjustedVolatility = assetVolatility * marketVolatilityFactor;
  
  // Base market drift - slight upward bias in healthy markets, downward in unhealthy
  const marketDrift = (marketHealth / 100 - 0.5) * 0.001;
  
  // Implement Geometric Brownian Motion model
  // dS = μS dt + σS dW
  const drift = (marketDrift - 0.5 * Math.pow(adjustedVolatility, 2)) * timeStep;
  const diffusion = adjustedVolatility * Math.sqrt(timeStep) * normalRandom();
  
  // Calculate news impact
  let newsEffect = 0;
  if (newsItems.length > 0) {
    newsItems.forEach(news => {
      // Sentiment factor: -1 for negative, 0 for neutral, 1 for positive
      const sentimentFactor = news.sentiment === 'positive' ? 1 : 
                              news.sentiment === 'negative' ? -1 : 0;
      
      // Scale impact by magnitude and add some time decay (news effects fade)
      const timeSinceNews = (Date.now() - news.timestamp) / 1000; // seconds
      const decayFactor = Math.exp(-0.05 * timeSinceNews); // exponential decay
      
      // Final news impact
      const impact = sentimentFactor * news.magnitude * 0.1 * decayFactor;
      newsEffect += impact;
    });
  }

  // Mean reversion effect - prices tend to revert toward their baseline
  // This prevents runaway prices in either direction
  const meanReversionStrength = 0.002;
  const priceDeviation = Math.log(asset.price / 100); // Assume 100 is the baseline price
  const meanReversion = -meanReversionStrength * priceDeviation * timeStep;

  // Combine all effects - multiplicative model
  const priceChange = Math.exp(drift + diffusion + meanReversion + newsEffect);
  
  // Apply circuit breakers for extreme moves
  const maxMove = 0.08; // 8% max move per tick
  const cappedChange = Math.max(Math.min(priceChange, 1 + maxMove), 1 - maxMove);
  
  // Calculate new price and ensure it's positive
  const newPrice = Math.max(asset.price * cappedChange, 0.1);
  
  // Round to 2 decimal places for display
  return Math.round(newPrice * 100) / 100;
};

// Function to calculate profit/loss for a position
export const calculatePositionValue = (
  quantity: number,
  averagePrice: number,
  currentPrice: number
): number => {
  return quantity * (currentPrice - averagePrice);
};

// Function to calculate return percentage
export const calculateReturnPercentage = (
  initialValue: number,
  currentValue: number
): number => {
  if (initialValue === 0) return 0;
  return ((currentValue - initialValue) / initialValue) * 100;
};

// Function to format currency
export const formatCurrency = (amount: number): string => {
  // For very large numbers, use abbreviations (K, M, B)
  if (Math.abs(amount) >= 1000000000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount / 1000000000) + 'B';
  } else if (Math.abs(amount) >= 1000000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount / 1000000) + 'M';
  } else if (Math.abs(amount) >= 1000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } else {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  }
};

// Format large numbers with k/m/b suffixes
export const formatLargeNumber = (num: number): string => {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toFixed(0);
};

// Format percentage
export const formatPercentage = (percentage: number): string => {
  return percentage.toFixed(2) + '%';
};

// Determine color based on value change
export const getPriceChangeColor = (change: number): string => {
  if (change > 0) return 'text-profit';
  if (change < 0) return 'text-loss';
  return 'text-neutral';
};

// Format price change with arrow
export const formatPriceChange = (change: number): string => {
  const arrow = change > 0 ? '↑' : change < 0 ? '↓' : '';
  return `${arrow} ${Math.abs(change).toFixed(2)}`;
};

// Calculate portfolio allocation
export const calculateAllocation = (
  assetValue: number,
  totalPortfolioValue: number
): number => {
  if (totalPortfolioValue === 0) return 0;
  return (assetValue / totalPortfolioValue) * 100;
};

// Generate correlated price movements for assets
export const generateCorrelatedMovements = (assets: Asset[], marketHealth: number): Record<string, number> => {
  // Extract asset types and current volatilities
  const assetTypes = assets.map(asset => asset.color);
  const volatilities = assets.map(asset => {
    const baseVol = ASSET_VOLATILITY[asset.color as keyof typeof ASSET_VOLATILITY] || 0.01;
    return baseVol * asset.volatility * 2 * (1 + ((100 - marketHealth) / 100));
  });

  // Generate independent random values
  const independentMovements = assetTypes.map(() => normalRandom());
  
  // Apply correlations to create correlated movements
  const correlatedMovements: Record<string, number> = {};
  
  assets.forEach((asset, i) => {
    let movement = 0;
    
    // Combine independent movements based on correlations
    assetTypes.forEach((type, j) => {
      const correlation = CORRELATION_MATRIX[asset.color as keyof typeof CORRELATION_MATRIX]?.[type as keyof typeof CORRELATION_MATRIX[keyof typeof CORRELATION_MATRIX]] || 0;
      movement += correlation * independentMovements[j];
    });
    
    // Scale by volatility
    correlatedMovements[asset.id] = movement * volatilities[i];
  });
  
  return correlatedMovements;
};
