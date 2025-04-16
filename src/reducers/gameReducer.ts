import { GameState, TradeAction, EventDensity, NewsItem } from '../types/game';
import { calculateNewPrices } from '../utils/marketLogic';
import { Mission } from '../types/missions';
import { checkMissionProgress } from '../utils/missionGenerator';
import { getRoundEventDensity } from '../utils/difficultyManager';

type Action =
  | { type: 'START_GAME' }
  | { type: 'END_GAME' }
  | { type: 'NEXT_ROUND' }
  | { type: 'TICK'; payload: number }
  | { type: 'UPDATE_PRICES' }
  | { type: 'ADD_NEWS'; payload: any }
  | { type: 'EXPIRE_NEWS'; payload: string }
  | { type: 'EXECUTE_TRADE'; payload: { assetId: string; action: TradeAction; amount: number; price: number; timestamp?: number } }
  | { type: 'UPDATE_MARKET_HEALTH'; payload: number }
  | { type: 'UPDATE_NET_WORTH'; payload?: { timestamp?: number } }
  | { type: 'UPDATE_MISSION_PROGRESS'; payload?: { missionId?: string } }
  | { type: 'COMPLETE_MISSION'; payload: { missionId: string } }
  | { type: 'FAIL_MISSION'; payload: { missionId: string } }
  | { type: 'UPDATE_EVENT_DENSITY'; payload: EventDensity }
  | { type: 'SET_LAST_NEWS_UPDATE'; payload: number }
  | { type: 'SCHEDULE_NEWS'; payload: NewsItem[] }
  | { type: 'TRIGGER_EVENT'; payload: number };

export const gameReducer = (state: GameState, action: Action): GameState => {
  switch (action.type) {
    case 'START_GAME': {
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
    }
      
    case 'END_GAME':
      return { ...state, isPaused: true, isGameOver: true };
      
    case 'NEXT_ROUND': {
      const now = Date.now();
      if (state.round >= 10) {
        return { ...state, isPaused: true, isGameOver: true };
      }
      
      const nextRound = state.round + 1;
      // Check for any incomplete missions from the current round
      const failedMissions = state.activeMissions
        .filter(m => m.status === 'active')
        .map(m => ({ ...m, status: 'failed' as const }));

      // Get missions for the next round
      const nextRoundMissions = state.missions[nextRound] || [];
      
      // Get event density for the new round
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
    }

    case 'TICK': {
      const newTimeRemaining = Math.max(0, state.timeRemaining - action.payload);
      
      // Update net worth history every 5 seconds
      let updatedNetWorthHistory = [...state.netWorthHistory];
      if (Math.floor(state.timeRemaining / 5) !== Math.floor(newTimeRemaining / 5)) {
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
        
        // Add to history with current timestamp
        updatedNetWorthHistory = [...updatedNetWorthHistory, { 
          round: state.round, 
          value: netWorth,
          timestamp: Date.now()
        }];
      }
      
      if (newTimeRemaining <= 0) {
        return { 
          ...state, 
          timeRemaining: 0, 
          isPaused: true,
          netWorthHistory: updatedNetWorthHistory
        };
      }
      
      return { 
        ...state, 
        timeRemaining: newTimeRemaining,
        netWorthHistory: updatedNetWorthHistory
      };
    }

    case 'UPDATE_PRICES': {
      // Only update prices if time has passed since last update
      const now = Date.now();
      if (now - (state.lastPriceUpdate || 0) < 1000) {
        return state;
      }

      const updatedAssets = state.assets.map(asset => ({
        ...asset,
        previousPrice: asset.price,
        price: calculateNewPrices(
          asset,
          state.activeNews.filter(news => news.impactedAssets.includes(asset.id)),
          state.marketHealth
        )
      }));

      return { 
        ...state, 
        assets: updatedAssets,
        lastPriceUpdate: now
      };
    }

    case 'ADD_NEWS':
      return {
        ...state,
        news: [...state.news, action.payload],
        activeNews: [...state.activeNews, action.payload],
        lastNewsUpdate: Date.now()
      };

    case 'EXPIRE_NEWS':
      return {
        ...state,
        activeNews: state.activeNews.filter(news => news.id !== action.payload)
      };

    case 'UPDATE_EVENT_DENSITY':
      return {
        ...state,
        eventDensity: action.payload
      };

    case 'SET_LAST_NEWS_UPDATE':
      return {
        ...state,
        lastNewsUpdate: action.payload
      };

    case 'SCHEDULE_NEWS':
      return {
        ...state,
        scheduledEvents: action.payload
      };

    case 'EXECUTE_TRADE': {
      const { assetId, action: tradeAction, amount, price, timestamp = Date.now() } = action.payload;
      const asset = state.assets.find(a => a.id === assetId);
      if (!asset) return state;

      let newCash = state.cash;
      const newHoldings = { ...state.holdings };
      
      if (!newHoldings[assetId]) {
        newHoldings[assetId] = {
          quantity: 0,
          averageBuyPrice: 0,
          shortQuantity: 0,
          averageShortPrice: 0
        };
      }
      
      const holding = newHoldings[assetId];

      switch (tradeAction) {
        case 'buy': {
          const totalCost = amount * price;
          if (totalCost > newCash) return state;
          const newQuantity = holding.quantity + amount;
          const newAverageBuyPrice = (holding.averageBuyPrice * holding.quantity + totalCost) / newQuantity;
          newCash -= totalCost;
          newHoldings[assetId] = {
            ...holding,
            quantity: newQuantity,
            averageBuyPrice: newAverageBuyPrice
          };
          break;
        }
        
        case 'sell': {
          if (amount > holding.quantity) return state;
          const saleProceeds = amount * price;
          const newQuantity = holding.quantity - amount;
          newCash += saleProceeds;
          newHoldings[assetId] = {
            ...holding,
            quantity: newQuantity,
          };
          break;
        }
        
        case 'short': {
          const shortProceeds = amount * price;
          const newShortQuantity = holding.shortQuantity + amount;
          const newAverageShortPrice = (holding.averageShortPrice * holding.shortQuantity + shortProceeds) / newShortQuantity;
          newCash += shortProceeds;
          newHoldings[assetId] = {
            ...holding,
            shortQuantity: newShortQuantity,
            averageShortPrice: newAverageShortPrice
          };
          break;
        }
        
        case 'cover': {
          if (amount > holding.shortQuantity) return state;
          const coverCost = amount * price;
          if (coverCost > newCash) return state;
          const newShortQuantity = holding.shortQuantity - amount;
          newCash -= coverCost;
          newHoldings[assetId] = {
            ...holding,
            shortQuantity: newShortQuantity,
          };
          break;
        }
      }

      // Calculate current net worth after trade
      let netWorth = newCash;
      Object.entries(newHoldings).forEach(([assetId, holding]) => {
        const asset = state.assets.find(a => a.id === assetId);
        if (asset) {
          netWorth += holding.quantity * asset.price;
          if (holding.shortQuantity > 0) {
            const shortProfit = holding.shortQuantity * (holding.averageShortPrice - asset.price);
            netWorth += shortProfit;
          }
        }
      });

      // Add updated net worth to history with timestamp
      const updatedNetWorthHistory = [...state.netWorthHistory];
      // Only add new entry if value changed significantly
      const lastEntry = updatedNetWorthHistory[updatedNetWorthHistory.length - 1];
      if (Math.abs(netWorth - lastEntry.value) / lastEntry.value > 0.001) {
        updatedNetWorthHistory.push({ 
          round: state.round, 
          value: netWorth,
          timestamp: timestamp
        });
      }

      // After trade is executed, check mission progress
      const updatedActiveMissions = state.activeMissions.map(mission => 
        checkMissionProgress(mission, {
          ...state,
          cash: newCash,
          holdings: newHoldings
        })
      );

      return { 
        ...state, 
        cash: newCash, 
        holdings: newHoldings,
        netWorthHistory: updatedNetWorthHistory,
        activeMissions: updatedActiveMissions
      };
    }

    case 'UPDATE_MARKET_HEALTH':
      return { ...state, marketHealth: action.payload };

    case 'UPDATE_NET_WORTH': {
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
      
      // Use provided timestamp or current time
      const timestamp = action.payload?.timestamp || Date.now();
      
      return {
        ...state,
        netWorthHistory: [...state.netWorthHistory, { 
          round: state.round, 
          value: netWorth,
          timestamp: timestamp
        }]
      };
    }

    case 'UPDATE_MISSION_PROGRESS': {
      // Update progress of all active missions
      const updatedActiveMissions = state.activeMissions.map(mission => 
        checkMissionProgress(mission, state)
      );
      
      return {
        ...state,
        activeMissions: updatedActiveMissions
      };
    }
    
    case 'COMPLETE_MISSION': {
      const { missionId } = action.payload;
      const updatedActiveMissions = state.activeMissions.map(mission => 
        mission.id === missionId ? { ...mission, status: 'completed' as const } : mission
      );
      
      // Apply mission rewards
      const completedMission = state.activeMissions.find(m => m.id === missionId);
      let updatedMissionRewards = { ...state.missionRewards };
      let updatedCash = state.cash;
      
      if (completedMission && completedMission.reward && completedMission.rewardValue) {
        if (completedMission.reward.includes('Cash Bonus')) {
          // Apply cash bonus
          const bonus = state.cash * completedMission.rewardValue;
          updatedCash = state.cash + bonus;
        }
        
        // Store the reward in mission rewards
        updatedMissionRewards[completedMission.type] = completedMission.rewardValue;
      }
      
      return {
        ...state,
        activeMissions: updatedActiveMissions,
        missionRewards: updatedMissionRewards,
        cash: updatedCash
      };
    }
    
    case 'FAIL_MISSION': {
      const { missionId } = action.payload;
      const updatedActiveMissions = state.activeMissions.map(mission => 
        mission.id === missionId ? { ...mission, status: 'failed' as const } : mission
      );
      
      return {
        ...state,
        activeMissions: updatedActiveMissions
      };
    }

    default:
      return state;
  }
};
