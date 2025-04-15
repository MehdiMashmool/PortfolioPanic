import { GameState, TradeAction } from '../types/game';
import { calculateNewPrices } from '../utils/marketLogic';

type Action =
  | { type: 'START_GAME' }
  | { type: 'END_GAME' }
  | { type: 'NEXT_ROUND' }
  | { type: 'TICK'; payload: number }
  | { type: 'UPDATE_PRICES' }
  | { type: 'ADD_NEWS'; payload: any }
  | { type: 'EXPIRE_NEWS'; payload: string }
  | { type: 'EXECUTE_TRADE'; payload: { assetId: string; action: TradeAction; amount: number; price: number } }
  | { type: 'UPDATE_MARKET_HEALTH'; payload: number }
  | { type: 'UPDATE_NET_WORTH' };

export const gameReducer = (state: GameState, action: Action): GameState => {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...state,
        isPaused: false,
        round: 1,
        timeRemaining: 60,
        cash: 10000,
        holdings: {},
        netWorthHistory: [{ round: 0, value: 10000 }],
        marketHealth: 100,
        news: [],
        activeNews: [],
        lastPriceUpdate: Date.now(),
      };
      
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
        lastPriceUpdate: Date.now(),
      };

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
        
        // Add to history with timestamp
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
      // Only update prices if 5 seconds have passed since last update
      const now = Date.now();
      if (now - (state.lastPriceUpdate || 0) < 5000) {
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

      // Add updated net worth to history
      const updatedNetWorthHistory = [...state.netWorthHistory];
      // Only add new entry if value changed significantly
      const lastEntry = updatedNetWorthHistory[updatedNetWorthHistory.length - 1];
      if (Math.abs(netWorth - lastEntry.value) / lastEntry.value > 0.001) {
        updatedNetWorthHistory.push({ 
          round: state.round, 
          value: netWorth,
          timestamp: Date.now()
        });
      }

      return { 
        ...state, 
        cash: newCash, 
        holdings: newHoldings,
        netWorthHistory: updatedNetWorthHistory
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
      return {
        ...state,
        netWorthHistory: [...state.netWorthHistory, { 
          round: state.round, 
          value: netWorth,
          timestamp: Date.now()
        }]
      };
    }

    default:
      return state;
  }
};
