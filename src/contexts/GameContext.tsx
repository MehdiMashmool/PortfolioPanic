
import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { generateMarketNews } from '../utils/newsGenerator';
import { GameState, TradeAction } from '../types/game';
import { gameReducer } from '../reducers/gameReducer';
import { initialGameState } from '../constants/gameInitialState';
import { showAchievementToast } from '../components/AchievementToast';
import { AchievementType } from '../components/AchievementBadge';

type GameContextType = {
  state: GameState;
  calculateNetWorth: () => number;
  executeTrade: (assetId: string, action: TradeAction, amount: number) => void;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
  nextRound: () => void;
  unlockAchievement: (achievement: AchievementType) => void;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const [lastTickTime, setLastTickTime] = useState<number | null>(null);
  const [lastNetWorthUpdate, setLastNetWorthUpdate] = useState<number>(0);
  const [achievementsUnlocked, setAchievementsUnlocked] = useState<Set<AchievementType>>(new Set());

  useEffect(() => {
    let frameId: number;

    const updateTimer = (timestamp: number) => {
      if (!state.isPaused && !state.isGameOver) {
        if (lastTickTime === null) {
          setLastTickTime(timestamp);
        } else {
          const deltaTime = (timestamp - lastTickTime) / 1000;
          dispatch({ type: 'TICK', payload: deltaTime });
          
          // Limit how often prices update to prevent visual jumps
          if (Math.random() < 0.05) {
            dispatch({ type: 'UPDATE_PRICES' });
          }
          
          if (Math.random() < 0.01) {
            const newsItem = generateMarketNews(state.assets, state.round);
            dispatch({ type: 'ADD_NEWS', payload: newsItem });
            
            setTimeout(() => {
              dispatch({ type: 'EXPIRE_NEWS', payload: newsItem.id });
            }, 15000);
          }

          if (Math.random() < 0.02) {
            const healthChange = (Math.random() * 6) - 3;
            const newHealth = Math.max(0, Math.min(100, state.marketHealth + healthChange));
            dispatch({ type: 'UPDATE_MARKET_HEALTH', payload: newHealth });
          }

          // Update net worth every 5 seconds for the performance chart
          const now = Date.now();
          if (now - lastNetWorthUpdate > 5000) {
            dispatch({ type: 'UPDATE_NET_WORTH' });
            setLastNetWorthUpdate(now);
          }

          setLastTickTime(timestamp);
        }
      }
      
      frameId = requestAnimationFrame(updateTimer);
    };

    frameId = requestAnimationFrame(updateTimer);
    
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [state.isPaused, state.isGameOver, lastTickTime, lastNetWorthUpdate]);

  // Check for achievements
  useEffect(() => {
    // Check for first trade
    if (Object.keys(state.holdings).length > 0 && !achievementsUnlocked.has('first-trade')) {
      unlockAchievement('first-trade');
    }
    
    // Check for portfolio doubled
    const netWorth = calculateNetWorth();
    if (netWorth >= 20000 && !achievementsUnlocked.has('doubled-portfolio')) {
      unlockAchievement('doubled-portfolio');
    }

    // Check for diversified portfolio
    const assetTypes = new Set(state.assets.map(asset => asset.color));
    const investedTypes = new Set();
    Object.entries(state.holdings).forEach(([assetId, holding]) => {
      if (holding.quantity > 0) {
        const asset = state.assets.find(a => a.id === assetId);
        if (asset) {
          investedTypes.add(asset.color);
        }
      }
    });
    
    if (investedTypes.size >= assetTypes.size && !achievementsUnlocked.has('diversified')) {
      unlockAchievement('diversified');
    }

  }, [state.holdings, state.netWorthHistory]);

  useEffect(() => {
    setLastTickTime(null);
  }, [state.isPaused]);

  const calculateNetWorth = () => {
    let netWorth = state.cash;
    
    Object.entries(state.holdings).forEach(([assetId, holding]) => {
      const asset = state.assets.find(a => a.id === assetId);
      if (asset) {
        netWorth += holding.quantity * asset.price;
        if (holding.shortQuantity > 0) {
          const shortProfit = holding.shortQuantity * (holding.averageShortPrice - asset.price);
          netWorth += shortProfit;
        }
      }
    });
    
    return netWorth;
  };

  const executeTrade = (assetId: string, action: TradeAction, amount: number) => {
    if (state.isGameOver) return; // Prevent trades after game over
    
    const asset = state.assets.find(a => a.id === assetId);
    if (!asset) return;
    
    dispatch({ 
      type: 'EXECUTE_TRADE', 
      payload: { assetId, action, amount, price: asset.price } 
    });
  };

  const unlockAchievement = (achievement: AchievementType) => {
    if (!achievementsUnlocked.has(achievement)) {
      setAchievementsUnlocked(prev => {
        const newSet = new Set(prev);
        newSet.add(achievement);
        return newSet;
      });
      
      showAchievementToast(achievement);
    }
  };

  const startGame = () => dispatch({ type: 'START_GAME' });
  const pauseGame = () => dispatch({ type: 'PAUSE_GAME' });
  const resumeGame = () => dispatch({ type: 'RESUME_GAME' });
  const endGame = () => dispatch({ type: 'END_GAME' });
  const nextRound = () => {
    if (state.round >= 10) {
      endGame();
    } else {
      dispatch({ type: 'NEXT_ROUND' });
    }
  };

  const value = {
    state,
    calculateNetWorth,
    executeTrade,
    startGame,
    pauseGame,
    resumeGame,
    endGame,
    nextRound,
    unlockAchievement
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
