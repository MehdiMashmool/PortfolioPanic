import { useEffect, useCallback, useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { calculateNewPrices, generateCorrelatedMovements } from '../utils/marketLogic';
import { generateMarketNews } from '../utils/newsGenerator';
import { assetPriceHistory, initAssetPriceHistory, updateAssetPriceHistory, updatePortfolioHistory } from '../utils/chartUtils';
import { calculateNetWorth } from '../utils/portfolioUtils';

export default function GameEngine() {
  const { state } = useGame();
  const { assets, isPaused, timeRemaining, isGameOver, round, cash, holdings } = state;
  const [initialized, setInitialized] = useState(false);

  // Initialize price history when the game starts
  useEffect(() => {
    if (!initialized) {
      // Initialize price history for all assets
      assets.forEach(asset => {
        initAssetPriceHistory(asset.id, asset.price);
      });
      setInitialized(true);
    }
  }, [assets, initialized]);

  // Update price history on asset change
  useEffect(() => {
    if (isPaused || isGameOver || timeRemaining <= 0) return;

    // Only update on a reasonable interval
    const interval = setInterval(() => {
      assets.forEach(asset => {
        updateAssetPriceHistory(asset.id, asset.price);
      });
      
      // Update portfolio history
      const netWorth = calculateNetWorth(cash, holdings, assets);
      updatePortfolioHistory(netWorth, Date.now());
    }, 1000);
    
    return () => clearInterval(interval);
  }, [assets, cash, holdings, isPaused, isGameOver, timeRemaining]);

  return null;
} 