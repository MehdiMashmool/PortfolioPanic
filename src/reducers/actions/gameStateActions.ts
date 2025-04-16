
import { GameState } from '../../types/game';
import { getRoundEventDensity } from '../../utils/difficultyManager';

export const handleStartGame = (state: GameState): GameState => {
  const now = Date.now();
  return {
    ...state,
    isPaused: false,
    round: 1,
    timeRemaining: 60,
    cash: 10000,
    holdings: {},
    netWorthHistory: [{ round: 0, value: 10000, timestamp: now }],
    marketHealth: 100,
    news: [],
    activeNews: [],
    lastPriceUpdate: now,
    lastNewsUpdate: now,
    activeMissions: state.missions[1] || [],
    completedMissions: [],
    missionRewards: {},
    eventDensity: getRoundEventDensity(1),
    scheduledEvents: []
  };
};

export const handleEndGame = (state: GameState): GameState => ({
  ...state,
  isPaused: true,
  isGameOver: true
});

export const handleNextRound = (state: GameState): GameState => {
  const now = Date.now();
  if (state.round >= 10) {
    return { ...state, isPaused: true, isGameOver: true };
  }
  
  const nextRound = state.round + 1;
  const failedMissions = state.activeMissions
    .filter(m => m.status === 'active')
    .map(m => ({ ...m, status: 'failed' as const }));

  const nextRoundMissions = state.missions[nextRound] || [];
  const eventDensity = getRoundEventDensity(nextRound);
  
  return {
    ...state,
    round: nextRound,
    timeRemaining: 60,
    isPaused: false,
    activeNews: [],
    lastPriceUpdate: now,
    lastNewsUpdate: now,
    activeMissions: nextRoundMissions,
    completedMissions: [...state.completedMissions, ...state.activeMissions.filter(m => m.status === 'completed')],
    eventDensity
  };
};

