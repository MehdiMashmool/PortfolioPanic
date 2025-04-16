
import { useState, useEffect } from 'react';
import { GameState } from '../types/game';
import { updateAssetPriceHistory, updatePortfolioHistory } from '../utils/chartUtils';

export const useGameTimer = (
  state: GameState,
  dispatch: React.Dispatch<any>,
  calculateNetWorth: () => number,
  PRICE_UPDATE_INTERVAL: number = 1000
) => {
  const [lastTickTime, setLastTickTime] = useState<number | null>(null);
  const [lastPriceUpdate, setLastPriceUpdate] = useState<number>(0);
  const [lastNetWorthUpdate, setLastNetWorthUpdate] = useState<number>(0);

  useEffect(() => {
    let frameId: number;

    const updateTimer = (timestamp: number) => {
      if (!state.isGameOver) {
        if (lastTickTime === null) {
          setLastTickTime(timestamp);
        } else {
          const deltaTime = (timestamp - lastTickTime) / 1000;
          dispatch({ type: 'TICK', payload: deltaTime });
          
          const now = Date.now();
          
          if (now - lastPriceUpdate >= PRICE_UPDATE_INTERVAL) {
            dispatch({ type: 'UPDATE_PRICES' });
            
            state.assets.forEach(asset => {
              updateAssetPriceHistory(asset.id, asset.price, now);
            });
            
            setLastPriceUpdate(now);
          }
          
          if (now - lastNetWorthUpdate >= PRICE_UPDATE_INTERVAL) {
            const netWorth = calculateNetWorth();
            dispatch({ type: 'UPDATE_NET_WORTH', payload: { timestamp: now } });
            updatePortfolioHistory(netWorth, now);
            setLastNetWorthUpdate(now);
          }
          
          setLastTickTime(timestamp);
        }
      }
      
      frameId = requestAnimationFrame(updateTimer);
    };

    frameId = requestAnimationFrame(updateTimer);
    return () => cancelAnimationFrame(frameId);
  }, [state.isGameOver, lastTickTime, lastPriceUpdate, lastNetWorthUpdate, state.assets, dispatch, calculateNetWorth]);

  return { lastTickTime, lastPriceUpdate, lastNetWorthUpdate };
};
