
import React, { createContext, useContext, useReducer, useState } from 'react';
import { GameState, TradeAction } from '../types/game';
import { gameReducer } from '../reducers/gameReducer';
import { initialGameState } from '../constants/gameInitialState';
import { AchievementType } from '../components/AchievementBadge';
import { useGameTimer } from '../hooks/useGameTimer';
import { useNewsManager } from '../hooks/useNewsManager';
import { useAchievementTracker } from '../hooks/useAchievementTracker';
import { useMissionManager } from '../hooks/useMissionManager';
import { calculateNetWorth, executeTrade, startGame, endGame, nextRound } from '../utils/gameActions';
import { 
  getRoundEventDensity, 
  calculateRoundEventCount, 
  scheduleRoundEvents
} from '../utils/difficultyManager';

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

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const [eventSchedule, setEventSchedule] = useState<number[]>([]);
  
  // Initialize timers and price history
  useGameTimer(state, dispatch, () => calculateNetWorth(state));
  
  // Handle news generation and updates
  useNewsManager(state, dispatch, eventSchedule);
  
  // Track achievements
  const { unlockAchievement } = useAchievementTracker(state, () => calculateNetWorth(state));
  
  // Handle missions
  const { updateMissionProgress, completeMission, failMission } = useMissionManager(state, dispatch);

  // Set up event scheduling for each round
  React.useEffect(() => {
    if (!state.isPaused && !state.isGameOver && state.round > 0) {
      const density = getRoundEventDensity(state.round);
      const eventCount = calculateRoundEventCount(density);
      const timings = scheduleRoundEvents(eventCount, 60, density);
      
      dispatch({ type: 'UPDATE_EVENT_DENSITY', payload: density });
      setEventSchedule(timings);
      dispatch({ type: 'SET_LAST_NEWS_UPDATE', payload: Date.now() });
    }
  }, [state.round, state.isPaused, state.isGameOver]);

  const value = {
    state,
    calculateNetWorth: () => calculateNetWorth(state),
    executeTrade: (assetId: string, action: TradeAction, amount: number) => 
      executeTrade(state, dispatch, assetId, action, amount),
    startGame: () => startGame(state, dispatch),
    endGame: () => endGame(state, dispatch),
    nextRound: () => nextRound(state, dispatch),
    unlockAchievement,
    updateMissionProgress,
    completeMission,
    failMission
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
