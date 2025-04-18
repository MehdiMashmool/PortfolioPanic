import React from 'react';
import { useGame } from '../contexts/GameContext';
import { formatCurrency } from '../utils/marketLogic';
import { calculatePositionValue } from '../utils/portfolioUtils';

const HoldingsList = () => {
  const { state, calculateNetWorth } = useGame();
  const { holdings, assets } = state;
  
  // Check if there are any holdings
  const hasHoldings = Object.keys(holdings).some(assetId => {
    const holding = holdings[assetId];
    return holding.quantity > 0 || holding.shortQuantity > 0;
  });
  
  if (!hasHoldings) {
    return (
      <div className="text-center py-4 text-neutral">
        No assets in your portfolio yet.
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {Object.entries(holdings).map(([assetId, holding]) => {
        const asset = assets.find(a => a.id === assetId);
        if (!asset) return null;
        
        // Skip if no long or short positions
        if (holding.quantity === 0 && holding.shortQuantity === 0) return null;
        
        // Calculate long position value
        const longValue = holding.quantity * asset.price;
        const longPL = calculatePositionValue(
          holding.quantity,
          holding.averageBuyPrice,
          asset.price
        );
        
        // Calculate short position value
        const shortValue = holding.shortQuantity * asset.price;
        const shortPL = calculatePositionValue(
          holding.shortQuantity,
          asset.price,
          holding.averageShortPrice
        );
        
        return (
          <div key={assetId} className="border border-highlight rounded-md p-3 bg-dark/50">
            <div className="flex justify-between mb-2">
              <h4 className="font-semibold">{asset.name}</h4>
              <span className="text-xs bg-dark px-2 py-1 rounded">{asset.ticker}</span>
            </div>
            
            {holding.quantity > 0 && (
              <div className="mb-2">
                <div className="flex justify-between text-sm">
                  <span>Long Position:</span>
                  <span>{holding.quantity} units</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Position Value:</span>
                  <span>{formatCurrency(longValue)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Profit/Loss:</span>
                  <span className={longPL >= 0 ? 'text-profit' : 'text-loss'}>
                    {longPL >= 0 ? '+' : ''}{formatCurrency(longPL)}
                  </span>
                </div>
              </div>
            )}
            
            {holding.shortQuantity > 0 && (
              <div>
                <div className="flex justify-between text-sm">
                  <span>Short Position:</span>
                  <span>{holding.shortQuantity} units</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Position Value:</span>
                  <span>{formatCurrency(shortValue)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Profit/Loss:</span>
                  <span className={shortPL >= 0 ? 'text-profit' : 'text-loss'}>
                    {shortPL >= 0 ? '+' : ''}{formatCurrency(shortPL)}
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default HoldingsList;
