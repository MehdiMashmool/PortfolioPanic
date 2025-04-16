
import { GameState } from '../types/game';
import { GameAction } from './actions/types';
import { calculateNewPrices } from '../utils/marketLogic';
import { handleStartGame, handleEndGame, handleNextRound } from './actions/gameStateActions';
import { handleExecuteTrade } from './actions/tradeActions';
import { handleUpdateMissionProgress, handleCompleteMission, handleFailMission } from './actions/missionActions';

export const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'START_GAME':
      return handleStartGame(state);
      
    case 'END_GAME':
      return handleEndGame(state);
      
    case 'NEXT_ROUND':
      return handleNextRound(state);

    case 'TICK': {
      const newTimeRemaining = Math.max(0, state.timeRemaining - action.payload);
      
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
        
        updatedNetWorthHistory = [...updatedNetWorthHistory, { 
          round: state.round, 
          value: netWorth,
          timestamp: Date.now()
        }];
      }
      
      return { 
        ...state, 
        timeRemaining: newTimeRemaining,
        isPaused: newTimeRemaining <= 0,
        netWorthHistory: updatedNetWorthHistory
      };
    }

    case 'UPDATE_PRICES': {
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

    case 'EXECUTE_TRADE':
      return handleExecuteTrade(state, action.payload);

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

    case 'UPDATE_MISSION_PROGRESS':
      return handleUpdateMissionProgress(state);
    
    case 'COMPLETE_MISSION':
      return handleCompleteMission(state, action.payload.missionId);
    
    case 'FAIL_MISSION':
      return handleFailMission(state, action.payload.missionId);

    case 'UPDATE_EVENT_DENSITY':
      return { ...state, eventDensity: action.payload };

    case 'SET_LAST_NEWS_UPDATE':
      return { ...state, lastNewsUpdate: action.payload };

    case 'SCHEDULE_NEWS':
      return { ...state, scheduledEvents: action.payload };

    default:
      return state;
  }
};

