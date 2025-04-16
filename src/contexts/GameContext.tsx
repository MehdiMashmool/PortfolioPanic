
import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { generateMarketNews } from '../utils/newsGenerator';
import { GameState, TradeAction } from '../types/game';
import { gameReducer } from '../reducers/gameReducer';
import { initialGameState } from '../constants/gameInitialState';
import { showAchievementToast } from '../components/AchievementToast';
import { AchievementType } from '../components/AchievementBadge';
import { supabase } from '../integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { updateAssetPriceHistory, updatePortfolioHistory } from '../utils/chartUtils';

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
  const [recentNewsIds, setRecentNewsIds] = useState<Set<string>>(new Set());
  const [gameStartTime, setGameStartTime] = useState<number>(Date.now());

  const PRICE_UPDATE_INTERVAL = 1000; // 1 second update interval

  // Initialize price history data
  useEffect(() => {
    const currentTime = Date.now();
    state.assets.forEach(asset => {
      updateAssetPriceHistory(asset.id, asset.price, currentTime);
    });
    
    const startingNetWorth = calculateNetWorth();
    updatePortfolioHistory(startingNetWorth, currentTime);
  }, []);

  // Main game loop
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
          
          // Update asset prices
          if (now - lastPriceUpdate >= PRICE_UPDATE_INTERVAL) {
            dispatch({ type: 'UPDATE_PRICES' });
            
            // Record price history for each asset with the current timestamp
            state.assets.forEach(asset => {
              updateAssetPriceHistory(asset.id, asset.price, now);
            });
            
            setLastPriceUpdate(now);
          }
          
          // Generate news periodically
          if (now - lastNewsUpdate >= 5000) { // 5 seconds
            let newsItem;
            let attempts = 0;
            const maxAttempts = 5;

            // Try to find news that hasn't been shown recently
            do {
              newsItem = generateMarketNews(state.assets, state.round);
              attempts++;
            } while (recentNewsIds.has(newsItem.id) && attempts < maxAttempts);

            if (!recentNewsIds.has(newsItem.id) || attempts >= maxAttempts) {
              dispatch({ type: 'ADD_NEWS', payload: newsItem });
              
              // Track recent news to avoid repetition
              const newRecentNewsIds = new Set(recentNewsIds);
              newRecentNewsIds.add(newsItem.id);
              if (newRecentNewsIds.size > 20) {
                const oldestId = Array.from(newRecentNewsIds)[0];
                newRecentNewsIds.delete(oldestId);
              }
              setRecentNewsIds(newRecentNewsIds);

              // Expire news after 15 seconds
              setTimeout(() => {
                dispatch({ type: 'EXPIRE_NEWS', payload: newsItem.id });
                setRecentNewsIds(prev => {
                  const updated = new Set(prev);
                  updated.delete(newsItem.id);
                  return updated;
                });
              }, 15000);
              
              setLastNewsUpdate(now);
            }
          }

          // Random market health fluctuations
          if (Math.random() < 0.02) { // 2% chance per frame
            const healthChange = (Math.random() * 6) - 3;
            const newHealth = Math.max(0, Math.min(100, state.marketHealth + healthChange));
            dispatch({ type: 'UPDATE_MARKET_HEALTH', payload: newHealth });
          }

          // Update portfolio net worth history
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
  }, [state.isGameOver, lastTickTime, lastPriceUpdate, lastNetWorthUpdate, lastNewsUpdate, state.assets]);

  // Save high score when game ends
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

  // Check for achievements
  useEffect(() => {
    if (Object.keys(state.holdings).length > 0 && !achievementsUnlocked.has('first-trade')) {
      unlockAchievement('first-trade');
    }
    
    const netWorth = calculateNetWorth();
    if (netWorth >= 20000 && !achievementsUnlocked.has('doubled-portfolio')) {
      unlockAchievement('doubled-portfolio');
    }

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

  // Reset on component mount
  useEffect(() => {
    setLastTickTime(null);
    setLastNewsUpdate(0);
  }, []);

  // Calculate total portfolio value
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

  // Execute trading actions
  const executeTrade = (assetId: string, action: TradeAction, amount: number) => {
    if (state.isGameOver) return;
    
    const asset = state.assets.find(a => a.id === assetId);
    if (!asset) return;
    
    dispatch({ 
      type: 'EXECUTE_TRADE', 
      payload: { assetId, action, amount, price: asset.price, timestamp: Date.now() } 
    });
  };

  // Unlock an achievement
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

  // Start a new game
  const startGame = () => {
    const now = Date.now();
    setGameStartTime(now);
    dispatch({ type: 'START_GAME' });
    
    // Initialize price history for each asset
    state.assets.forEach(asset => {
      updateAssetPriceHistory(asset.id, asset.price, now);
    });
    
    // Initialize portfolio history
    const startingNetWorth = calculateNetWorth();
    updatePortfolioHistory(startingNetWorth, now);
    
    toast({
      title: "Game Started",
      description: "Good luck, trader!",
      duration: 2000
    });
  };

  // End current game
  const endGame = () => {
    dispatch({ type: 'END_GAME' });
    toast({
      title: "Game Over",
      description: "Your trading session has ended.",
      duration: 2000
    });
  };

  // Advance to next round
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
