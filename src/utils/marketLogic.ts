
import type { Asset, NewsItem } from '../types/game';

// Calculate new price based on previous price, volatility, and news
export const calculateNewPrices = (
  asset: Asset,
  newsItems: NewsItem[],
  marketHealth: number
): number => {
  // Base price change based on volatility (random walk)
  const volatilityFactor = asset.volatility * 0.05; // 5% maximum movement for max volatility
  let randomChange = (Math.random() * 2 - 1) * volatilityFactor;
  
  // Factor in the market health (global market condition)
  // Lower market health = more downward pressure
  const marketFactor = (marketHealth / 100) * 2 - 1; // -1 to 1 range
  const marketEffect = marketFactor * 0.01; // Small effect per tick
  
  // Calculate news impact
  let newsEffect = 0;
  if (newsItems.length > 0) {
    newsItems.forEach(news => {
      // Sentiment factor: -1 for negative, 0 for neutral, 1 for positive
      const sentimentFactor = news.sentiment === 'positive' ? 1 : 
                              news.sentiment === 'negative' ? -1 : 0;
      
      // Combine sentiment and magnitude
      const impact = sentimentFactor * news.magnitude * 0.1;
      newsEffect += impact;
    });
  }
  
  // Combine all effects
  const totalEffect = (1 + randomChange + marketEffect + newsEffect);
  
  // Calculate new price with a minimum floor to prevent negative prices
  // Add a maximum cap to prevent unrealistic prices (100,000)
  const newPrice = Math.max(Math.min(asset.price * totalEffect, 100000), 0.1);
  
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
