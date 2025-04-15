
import { GameState, TradeAction } from '../types/game';
import { calculateNewPrices } from '../utils/marketLogic';

type Action =
  | { type: 'START_GAME' }
  | { type: 'PAUSE_GAME' }
  | { type: 'RESUME_GAME' }
  | { type: 'END_GAME' }
  | { type: 'NEXT_ROUND' }
  | { type: 'TICK'; payload: number }
  | { type: 'UPDATE_PRICES' }
  | { type: 'ADD_NEWS'; payload: any }
  | { type: 'EXPIRE_NEWS'; payload: string }
  | { type: 'EXECUTE_TRADE'; payload: { assetId: string; action: TradeAction; amount: number; price: number } }
  | { type: 'UPDATE_MARKET_HEALTH'; payload: number }
  | { type: 'UPDATE_NET_WORTH' };

import { initialGameState } from '../constants/gameInitialState';

export const gameReducer = (state: GameState, action: Action): GameState => {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...initialGameState,
        isPaused: false,
        round: 1,
        timeRemaining: 60,
        cash: 10000,
        holdings: {},
        netWorthHistory: [{ round: 0, value: 10000 }],
        marketHealth: 100,
        news: [],
        activeNews: [],
      };
      
    case 'PAUSE_GAME':
      return { ...state, isPaused: true };
      
    case 'RESUME_GAME':
      return { ...state, isPaused: false };
      
    case 'END_GAME':
      return { ...state, isPaused: true, isGameOver: true };
      
    case 'NEXT_ROUND':
      if (state.round >= 10) {
        return { ...state, isPaused: true, isGameOver: true };
      }
      return {
        ...state,
        round: state.round + 1,
        timeRemaining: 60,
        isPaused: false,
        activeNews: [],
      };

    case 'TICK': {
      const newTimeRemaining = Math.max(0, state.timeRemaining - action.payload);
      if (newTimeRemaining <= 0) {
        return { ...state, timeRemaining: 0, isPaused: true };
      }
      return { ...state, timeRemaining: newTimeRemaining };
    }

    case 'UPDATE_PRICES': {
      const updatedAssets = state.assets.map(asset => ({
        ...asset,
        previousPrice: asset.price,
        price: calculateNewPrices(
          asset,
          state.activeNews.filter(news => news.impactedAssets.includes(asset.id)),
          state.marketHealth
        )
      }));
      return { ...state, assets: updatedAssets };
    }

    case 'ADD_NEWS':
      return {
        ...state,
        news: [...state.news, action.payload],
        activeNews: [...state.activeNews, action.payload]
      };

    case 'EXPIRE_NEWS':
      return {
        ...state,
        activeNews: state.activeNews.filter(news => news.id !== action.payload)
      };

    case 'EXECUTE_TRADE': {
      const { assetId, action: tradeAction, amount, price } = action.payload;
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

      return { ...state, cash: newCash, holdings: newHoldings };
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
      return {
        ...state,
        netWorthHistory: [...state.netWorthHistory, { round: state.round, value: netWorth }]
      };
    }

    default:
      return state;
  }
};
