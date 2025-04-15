import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { generateMarketNews } from '../utils/newsGenerator';
import { GameState, TradeAction } from '../types/game';
import { gameReducer } from '../reducers/gameReducer';
import { initialGameState } from '../constants/gameInitialState';
import { showAchievementToast } from '../components/AchievementToast';
import { AchievementType } from '../components/AchievementBadge';
import { supabase } from '../integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

type GameContextType = {
  state: GameState;
  calculateNetWorth: () => number;
  executeTrade: (assetId: string, action: TradeAction, amount: number) => void;
  startGame: () => void;
  endGame: () => void;
  nextRound: () => void;
  unlockAchievement: (achievement: AchievementType) => void;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const [lastTickTime, setLastTickTime] = useState<number | null>(null);
  const [lastPriceUpdate, setLastPriceUpdate] = useState<number>(0);
  const [lastNetWorthUpdate, setLastNetWorthUpdate] = useState<number>(0);
  const [lastNewsUpdate, setLastNewsUpdate] = useState<number>(0);
  const [achievementsUnlocked, setAchievementsUnlocked] = useState<Set<AchievementType>>(new Set());

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
          
          // Update prices every 3 seconds
          if (now - lastPriceUpdate >= 3000) {
            dispatch({ type: 'UPDATE_PRICES' });
            setLastPriceUpdate(now);
          }
          
          // Generate news every 5 seconds
          if (now - lastNewsUpdate >= 5000) {
            const newsItem = generateMarketNews(state.assets, state.round);
            dispatch({ type: 'ADD_NEWS', payload: newsItem });
            
            setTimeout(() => {
              dispatch({ type: 'EXPIRE_NEWS', payload: newsItem.id });
            }, 15000);
            
            setLastNewsUpdate(now);
          }

          // Update market health randomly
          if (Math.random() < 0.02) {
            const healthChange = (Math.random() * 6) - 3;
            const newHealth = Math.max(0, Math.min(100, state.marketHealth + healthChange));
            dispatch({ type: 'UPDATE_MARKET_HEALTH', payload: newHealth });
          }

          // Update net worth every 3 seconds
          if (now - lastNetWorthUpdate >= 3000) {
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
  }, [state.isGameOver, lastTickTime, lastPriceUpdate, lastNetWorthUpdate, lastNewsUpdate]);

  useEffect(() => {
    const saveHighScore = async () => {
      if (state.isGameOver) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const finalValue = calculateNetWorth();
            await supabase
              .from('high_scores')
              .insert({
                user_id: user.id,
                portfolio_value: finalValue,
                achieved_at: new Date().toISOString()
              });
          }
        } catch (error) {
          console.error('Error saving high score:', error);
        }
      }
    };

    saveHighScore();
  }, [state.isGameOver]);

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
    setLastNewsUpdate(0);
  }, []);

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

  const startGame = () => {
    dispatch({ type: 'START_GAME' });
    toast({
      title: "Game Started",
      description: "Good luck, trader!",
      duration: 2000
    });
  };

  const endGame = () => {
    dispatch({ type: 'END_GAME' });
    toast({
      title: "Game Over",
      description: "Your trading session has ended.",
      duration: 2000
    });
  };

  const nextRound = () => {
    if (state.round >= 10) {
      endGame();
    } else {
      dispatch({ type: 'NEXT_ROUND' });
      toast({
        title: `Round ${state.round + 1}`,
        description: "A new round begins!",
        duration: 2000
      });
    }
  };

  const value = {
    state,
    calculateNetWorth,
    executeTrade,
    startGame,
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
