import type { Asset, Holdings } from '../types/game';

/**
 * Calculate the total net worth of the portfolio
 */
export const calculateNetWorth = (
  cash: number,
  holdings: Holdings,
  assets: Asset[]
): number => {
  let netWorth = cash;
  
  Object.entries(holdings).forEach(([assetId, holding]) => {
    const asset = assets.find(a => a.id === assetId);
    if (asset) {
      // Add value of long positions
      netWorth += holding.quantity * asset.price;
      
      // Add profit/loss from short positions
      if (holding.shortQuantity > 0) {
        const shortProfit = holding.shortQuantity * (holding.averageShortPrice - asset.price);
        netWorth += shortProfit;
      }
    }
  });
  
  return netWorth;
};

/**
 * Calculate profit/loss for a position
 */
export const calculatePositionValue = (
  quantity: number,
  averagePrice: number,
  currentPrice: number
): number => {
  return quantity * (currentPrice - averagePrice);
};

/**
 * Calculate portfolio allocation percentages
 */
export const calculateAllocation = (
  assetValue: number,
  totalPortfolioValue: number
): number => {
  if (totalPortfolioValue === 0) return 0;
  return (assetValue / totalPortfolioValue) * 100;
}; 