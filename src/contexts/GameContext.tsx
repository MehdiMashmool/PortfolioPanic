import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
} from "react";
import { generateMarketNews } from "../utils/newsGenerator";
import { GameState, TradeAction } from "../types/game";
import { gameReducer } from "../reducers/gameReducer";
import { initialGameState } from "../constants/gameInitialState";
import { showAchievementToast } from "../components/AchievementToast";
import { AchievementType } from "../components/AchievementBadge";
import { supabase } from "../integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  updateAssetPriceHistory,
  updatePortfolioHistory,
} from "../utils/chartUtils";
import { Mission } from "../types/missions";
import { formatCurrency } from "../utils/marketLogic";

type GameContextType = {
  state: GameState;
  calculateNetWorth: () => number;
  executeTrade: (assetId: string, action: TradeAction, amount: number) => void;
  startGame: () => void;
  endGame: () => void;
  nextRound: () => void;
  unlockAchievement: (achievement: AchievementType) => void;
  updateMissionProgress: (missionId?: string) => void;
  completeMission: (missionId: string) => void;
  failMission: (missionId: string) => void;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const [lastTickTime, setLastTickTime] = useState<number | null>(null);
  const [lastPriceUpdate, setLastPriceUpdate] = useState<number>(0);
  const [lastNetWorthUpdate, setLastNetWorthUpdate] = useState<number>(0);
  const [lastNewsUpdate, setLastNewsUpdate] = useState<number>(0);
  const [achievementsUnlocked, setAchievementsUnlocked] = useState<
    Set<AchievementType>
  >(new Set());
  const [recentNewsIds, setRecentNewsIds] = useState<Set<string>>(new Set());
  const [gameStartTime, setGameStartTime] = useState<number>(Date.now());

  const PRICE_UPDATE_INTERVAL = 1000; // 1 second update interval

  useEffect(() => {
    const currentTime = Date.now();
    state.assets.forEach((asset) => {
      updateAssetPriceHistory(asset.id, asset.price, currentTime);
    });

    const startingNetWorth = calculateNetWorth();
    updatePortfolioHistory(startingNetWorth, currentTime);
  }, []);

  useEffect(() => {
    let frameId: number;

    const updateTimer = (timestamp: number) => {
      if (!state.isGameOver && !state.isPaused) {
        if (lastTickTime === null) {
          setLastTickTime(timestamp);
        } else {
          const deltaTime = (timestamp - lastTickTime) / 1000;
          dispatch({ type: "TICK", payload: deltaTime });

          const now = Date.now();

          if (now - lastPriceUpdate >= PRICE_UPDATE_INTERVAL) {
            dispatch({ type: "UPDATE_PRICES" });

            state.assets.forEach((asset) => {
              updateAssetPriceHistory(asset.id, asset.price, now);
            });

            setLastPriceUpdate(now);
          }

          if (now - lastNewsUpdate >= 5000) {
            let newsItem;
            let attempts = 0;
            const maxAttempts = 5;

            do {
              newsItem = generateMarketNews(state.assets, state.round);
              attempts++;
            } while (recentNewsIds.has(newsItem.id) && attempts < maxAttempts);

            if (!recentNewsIds.has(newsItem.id) || attempts >= maxAttempts) {
              dispatch({ type: "ADD_NEWS", payload: newsItem });

              const newRecentNewsIds = new Set(recentNewsIds);
              newRecentNewsIds.add(newsItem.id);
              if (newRecentNewsIds.size > 20) {
                const oldestId = Array.from(newRecentNewsIds)[0];
                newRecentNewsIds.delete(oldestId);
              }
              setRecentNewsIds(newRecentNewsIds);

              setTimeout(() => {
                if (!state.isPaused && !state.isGameOver) {
                  dispatch({ type: "EXPIRE_NEWS", payload: newsItem.id });
                  setRecentNewsIds((prev) => {
                    const updated = new Set(prev);
                    updated.delete(newsItem.id);
                    return updated;
                  });
                }
              }, 15000);

              setLastNewsUpdate(now);
            }
          }

          if (Math.random() < 0.02) {
            const healthChange = Math.random() * 6 - 3;
            const newHealth = Math.max(
              0,
              Math.min(100, state.marketHealth + healthChange)
            );
            dispatch({ type: "UPDATE_MARKET_HEALTH", payload: newHealth });
          }

          if (now - lastNetWorthUpdate >= PRICE_UPDATE_INTERVAL) {
            const netWorth = calculateNetWorth();
            dispatch({ type: "UPDATE_NET_WORTH", payload: { timestamp: now } });
            updatePortfolioHistory(netWorth, now);
            setLastNetWorthUpdate(now);
          }

          setLastTickTime(timestamp);
        }
      } else {
        setLastTickTime(timestamp);
      }

      frameId = requestAnimationFrame(updateTimer);
    };

    frameId = requestAnimationFrame(updateTimer);
    return () => cancelAnimationFrame(frameId);
  }, [
    state.isGameOver,
    state.isPaused,
    lastTickTime,
    lastPriceUpdate,
    lastNetWorthUpdate,
    lastNewsUpdate,
    state.assets,
  ]);

  useEffect(() => {
    const saveHighScore = async () => {
      if (state.isGameOver) {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();

          // Only save score if user is authenticated
          if (user) {
            const finalValue = calculateNetWorth();
            await supabase.from("high_scores").insert({
              user_id: user.id,
              portfolio_value: finalValue,
              achieved_at: new Date().toISOString(),
            });

            toast({
              title: "Score saved!",
              description: `Your final score of ${formatCurrency(
                finalValue
              )} has been saved to the leaderboard.`,
              duration: 5000,
            });
          } else {
            // Show a toast that user is not signed in
            toast({
              title: "Score not saved",
              description: "Sign in to save your score to the leaderboard!",
              duration: 5000,
            });
          }
        } catch (error) {
          console.error("Error saving high score:", error);
          toast({
            title: "Error saving score",
            description: "There was a problem saving your score.",
            variant: "destructive",
            duration: 5000,
          });
        }
      }
    };

    saveHighScore();
  }, [state.isGameOver]);

  useEffect(() => {
    if (
      Object.keys(state.holdings).length > 0 &&
      !achievementsUnlocked.has("first-trade")
    ) {
      unlockAchievement("first-trade");
    }

    const netWorth = calculateNetWorth();
    if (netWorth >= 20000 && !achievementsUnlocked.has("doubled-portfolio")) {
      unlockAchievement("doubled-portfolio");
    }

    const assetTypes = new Set(state.assets.map((asset) => asset.color));
    const investedTypes = new Set();
    Object.entries(state.holdings).forEach(([assetId, holding]) => {
      if (holding.quantity > 0) {
        const asset = state.assets.find((a) => a.id === assetId);
        if (asset) {
          investedTypes.add(asset.color);
        }
      }
    });

    if (
      investedTypes.size >= assetTypes.size &&
      !achievementsUnlocked.has("diversified")
    ) {
      unlockAchievement("diversified");
    }
  }, [state.holdings, state.netWorthHistory]);

  useEffect(() => {
    const checkInterval = setInterval(() => {
      if (!state.isPaused && !state.isGameOver) {
        dispatch({ type: "UPDATE_MISSION_PROGRESS" });
      }
    }, 1000);

    return () => clearInterval(checkInterval);
  }, [state.isPaused, state.isGameOver]);

  useEffect(() => {
    state.activeMissions.forEach((mission) => {
      if (mission.status === "completed") {
        toast({
          title: "Mission Completed!",
          description: `${mission.title}: ${mission.reward}`,
          duration: 5000,
          className: "bg-green-900 border-green-600",
        });

        dispatch({
          type: "COMPLETE_MISSION",
          payload: { missionId: mission.id },
        });
      }
    });
  }, [state.activeMissions]);

  const calculateNetWorth = () => {
    let netWorth = state.cash;

    Object.entries(state.holdings).forEach(([assetId, holding]) => {
      const asset = state.assets.find((a) => a.id === assetId);
      if (asset) {
        netWorth += holding.quantity * asset.price;
        if (holding.shortQuantity > 0) {
          const shortProfit =
            holding.shortQuantity * (holding.averageShortPrice - asset.price);
          netWorth += shortProfit;
        }
      }
    });

    return netWorth;
  };

  const executeTrade = (
    assetId: string,
    action: TradeAction,
    amount: number
  ) => {
    if (state.isGameOver) return;

    const asset = state.assets.find((a) => a.id === assetId);
    if (!asset) return;

    dispatch({
      type: "EXECUTE_TRADE",
      payload: {
        assetId,
        action,
        amount,
        price: asset.price,
        timestamp: Date.now(),
      },
    });
  };

  const unlockAchievement = (achievement: AchievementType) => {
    if (!achievementsUnlocked.has(achievement)) {
      setAchievementsUnlocked((prev) => {
        const newSet = new Set(prev);
        newSet.add(achievement);
        return newSet;
      });

      showAchievementToast(achievement);
    }
  };

  const startGame = () => {
    const now = Date.now();
    setGameStartTime(now);
    dispatch({ type: "START_GAME" });

    state.assets.forEach((asset) => {
      updateAssetPriceHistory(asset.id, asset.price, now);
    });

    const startingNetWorth = calculateNetWorth();
    updatePortfolioHistory(startingNetWorth, now);

    toast({
      title: "Game Started",
      description: "Good luck, trader!",
      duration: 2000,
    });
  };

  const endGame = () => {
    dispatch({ type: "END_GAME" });
    toast({
      title: "Game Over",
      description: "Your trading session has ended.",
      duration: 2000,
    });
  };

  const nextRound = () => {
    if (state.round >= 10) {
      endGame();
    } else {
      dispatch({ type: "NEXT_ROUND" });
      toast({
        title: `Round ${state.round + 1}`,
        description: "A new round begins!",
        duration: 2000,
      });
    }
  };

  const updateMissionProgress = (missionId?: string) => {
    dispatch({ type: "UPDATE_MISSION_PROGRESS", payload: { missionId } });
  };

  const completeMission = (missionId: string) => {
    dispatch({ type: "COMPLETE_MISSION", payload: { missionId } });
  };

  const failMission = (missionId: string) => {
    dispatch({ type: "FAIL_MISSION", payload: { missionId } });
  };

  const value = {
    state,
    calculateNetWorth,
    executeTrade,
    startGame,
    endGame,
    nextRound,
    unlockAchievement,
    updateMissionProgress,
    completeMission,
    failMission,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
