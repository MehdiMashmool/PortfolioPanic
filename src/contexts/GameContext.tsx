
import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { generateMarketNews } from '../utils/newsGenerator';
import { calculateNewPrices } from '../utils/marketLogic';

export type Asset = {
  id: string;
  name: string;
  ticker: string;
  price: number;
  previousPrice: number;
  volatility: number; // 0-1 scale
  color: string;
  description: string;
};

export type Holdings = {
  [assetId: string]: {
    quantity: number;
    averageBuyPrice: number;
    shortQuantity: number;
    averageShortPrice: number;
  };
};

export type NewsItem = {
  id: string;
  title: string;
  content: string;
  impactedAssets: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  magnitude: number; // 0-1 scale
  timestamp: number;
  isActive: boolean;
};

export type TradeAction = 'buy' | 'sell' | 'short' | 'cover';

export type GameState = {
  assets: Asset[];
  cash: number;
  holdings: Holdings;
  round: number;
  timeRemaining: number;
  isPaused: boolean;
  isGameOver: boolean;
  news: NewsItem[];
  netWorthHistory: { round: number; value: number }[];
  activeNews: NewsItem[];
  marketHealth: number; // 0-100, 100 is healthy, 0 is crash
};

type Action =
  | { type: 'START_GAME' }
  | { type: 'PAUSE_GAME' }
  | { type: 'RESUME_GAME' }
  | { type: 'END_GAME' }
  | { type: 'NEXT_ROUND' }
  | { type: 'TICK'; payload: number }
  | { type: 'UPDATE_PRICES' }
  | { type: 'ADD_NEWS'; payload: NewsItem }
  | { type: 'EXPIRE_NEWS'; payload: string }
  | { type: 'EXECUTE_TRADE'; payload: { assetId: string; action: TradeAction; amount: number; price: number } }
  | { type: 'UPDATE_MARKET_HEALTH'; payload: number }
  | { type: 'UPDATE_NET_WORTH' };

const initialAssets: Asset[] = [
  {
    id: 'stock-tech',
    name: 'Tech Innovations',
    ticker: 'TECH',
    price: 100,
    previousPrice: 100,
    volatility: 0.4,
    color: 'stock',
    description: 'A blend of top technology companies'
  },
  {
    id: 'gold',
    name: 'Gold',
    ticker: 'GOLD',
    price: 1800,
    previousPrice: 1800,
    volatility: 0.2,
    color: 'gold',
    description: 'Precious metal, traditionally a safe haven'
  },
  {
    id: 'oil',
    name: 'Crude Oil',
    ticker: 'OIL',
    price: 75,
    previousPrice: 75,
    volatility: 0.6,
    color: 'oil',
    description: 'Global commodity with high geopolitical sensitivity'
  },
  {
    id: 'crypto',
    name: 'Cryptocurrency',
    ticker: 'CRYP',
    price: 40000,
    previousPrice: 40000,
    volatility: 0.8,
    color: 'crypto',
    description: 'Digital currency with extreme volatility'
  }
];

const initialGameState: GameState = {
  assets: initialAssets,
  cash: 10000,
  holdings: {},
  round: 1,
  timeRemaining: 60,
  isPaused: true,
  isGameOver: false,
  news: [],
  activeNews: [],
  netWorthHistory: [{ round: 0, value: 10000 }],
  marketHealth: 100,
};

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...initialGameState,
        isPaused: false,
      };
    
    case 'PAUSE_GAME':
      return {
        ...state,
        isPaused: true,
      };
    
    case 'RESUME_GAME':
      return {
        ...state,
        isPaused: false,
      };
    
    case 'END_GAME':
      return {
        ...state,
        isPaused: true,
        isGameOver: true,
      };
    
    case 'NEXT_ROUND':
      if (state.round >= 10) {
        return {
          ...state,
          isPaused: true,
          isGameOver: true,
        };
      }
      
      return {
        ...state,
        round: state.round + 1,
        timeRemaining: 60,
        activeNews: [], // Clear active news for the new round
      };
    
    case 'TICK':
      if (state.timeRemaining <= 0) {
        return state; // Time's up, wait for NEXT_ROUND action
      }

      const newTimeRemaining = Math.max(0, state.timeRemaining - action.payload);
      
      return {
        ...state,
        timeRemaining: newTimeRemaining,
        isPaused: newTimeRemaining <= 0 ? true : state.isPaused, // Auto pause at end of round
      };
    
    case 'UPDATE_PRICES': {
      // Calculate new prices based on current prices and news
      const updatedAssets = state.assets.map(asset => {
        const newPrice = calculateNewPrices(
          asset, 
          state.activeNews.filter(news => news.impactedAssets.includes(asset.id)),
          state.marketHealth
        );
        
        return {
          ...asset,
          previousPrice: asset.price,
          price: newPrice
        };
      });
      
      return {
        ...state,
        assets: updatedAssets
      };
    }
    
    case 'ADD_NEWS': {
      const news = action.payload;
      
      return {
        ...state,
        news: [...state.news, news],
        activeNews: [...state.activeNews, news]
      };
    }
    
    case 'EXPIRE_NEWS': {
      return {
        ...state,
        activeNews: state.activeNews.filter(news => news.id !== action.payload)
      };
    }
    
    case 'EXECUTE_TRADE': {
      const { assetId, action: tradeAction, amount, price } = action.payload;
      const asset = state.assets.find(a => a.id === assetId);
      
      if (!asset) {
        return state;
      }
      
      let newCash = state.cash;
      const newHoldings = { ...state.holdings };
      
      // Initialize if not exists
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
          if (totalCost > newCash) return state; // Not enough cash
          
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
          if (amount > holding.quantity) return state; // Can't sell more than owned
          
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
          // Shorting adds cash as if borrowed and sold
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
          if (amount > holding.shortQuantity) return state; // Can't cover more than shorted
          
          const coverCost = amount * price;
          if (coverCost > newCash) return state; // Not enough cash to cover
          
          const newShortQuantity = holding.shortQuantity - amount;
          
          newCash -= coverCost;
          newHoldings[assetId] = {
            ...holding,
            shortQuantity: newShortQuantity,
          };
          break;
        }
      }
      
      return {
        ...state,
        cash: newCash,
        holdings: newHoldings
      };
    }
    
    case 'UPDATE_MARKET_HEALTH': {
      return {
        ...state,
        marketHealth: action.payload
      };
    }
    
    case 'UPDATE_NET_WORTH': {
      // Calculate current net worth by adding cash and value of all holdings
      let netWorth = state.cash;
      
      Object.entries(state.holdings).forEach(([assetId, holding]) => {
        const asset = state.assets.find(a => a.id === assetId);
        if (asset) {
          // Add value of long positions
          netWorth += holding.quantity * asset.price;
          
          // Subtract value needed to cover shorts
          netWorth -= holding.shortQuantity * asset.price;
          
          // Add cash received from shorts
          netWorth += holding.shortQuantity * holding.averageShortPrice;
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
}

type GameContextType = {
  state: GameState;
  calculateNetWorth: () => number;
  executeTrade: (assetId: string, action: TradeAction, amount: number) => void;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
  nextRound: () => void;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const [lastUpdateTime, setLastUpdateTime] = useState<number | null>(null);
  
  // Market tick effect - handles the timer and price updates
  useEffect(() => {
    if (state.isPaused || state.isGameOver) {
      return; // Do nothing when paused or game over
    }
    
    const now = Date.now();
    if (lastUpdateTime === null) {
      setLastUpdateTime(now);
      return;
    }
    
    const elapsed = (now - lastUpdateTime) / 1000; // in seconds
    setLastUpdateTime(now);
    
    // Update timer
    dispatch({ type: 'TICK', payload: elapsed });
    
    // Update prices sometimes
    if (Math.random() < 0.05) { // 5% chance per frame
      dispatch({ type: 'UPDATE_PRICES' });
    }
    
    // Random market news
    if (Math.random() < 0.01) { // 1% chance per frame
      const newsItem = generateMarketNews(state.assets, state.round);
      dispatch({ type: 'ADD_NEWS', payload: newsItem });
      
      // News expires after 15 seconds
      setTimeout(() => {
        dispatch({ type: 'EXPIRE_NEWS', payload: newsItem.id });
      }, 15000);
    }
    
    // Update market health with slight random fluctuations
    if (Math.random() < 0.02) { // 2% chance per frame
      const healthChange = (Math.random() * 6) - 3; // -3 to +3 change
      const newHealth = Math.max(0, Math.min(100, state.marketHealth + healthChange));
      dispatch({ type: 'UPDATE_MARKET_HEALTH', payload: newHealth });
    }
    
    // Occasionally update net worth tracking
    if (Math.random() < 0.05) { // 5% chance per frame
      dispatch({ type: 'UPDATE_NET_WORTH' });
    }
    
    // Game loop
    const frameId = requestAnimationFrame(() => {}); // Just to trigger a new frame
    return () => cancelAnimationFrame(frameId);
  }, [state.isPaused, state.isGameOver, lastUpdateTime]);
  
  // Calculate net worth
  const calculateNetWorth = () => {
    let netWorth = state.cash;
    
    Object.entries(state.holdings).forEach(([assetId, holding]) => {
      const asset = state.assets.find(a => a.id === assetId);
      if (asset) {
        // Add value of long positions
        netWorth += holding.quantity * asset.price;
        
        // For short positions, calculate the profit/loss
        if (holding.shortQuantity > 0) {
          // Profit from shorts = shorted at high price - current price (if lower)
          const shortProfit = holding.shortQuantity * (holding.averageShortPrice - asset.price);
          netWorth += shortProfit;
        }
      }
    });
    
    return netWorth;
  };
  
  // Trade execution wrapper
  const executeTrade = (assetId: string, action: TradeAction, amount: number) => {
    const asset = state.assets.find(a => a.id === assetId);
    if (!asset) return;
    
    dispatch({ 
      type: 'EXECUTE_TRADE', 
      payload: { assetId, action, amount, price: asset.price } 
    });
  };
  
  // Game control wrappers
  const startGame = () => dispatch({ type: 'START_GAME' });
  const pauseGame = () => dispatch({ type: 'PAUSE_GAME' });
  const resumeGame = () => dispatch({ type: 'RESUME_GAME' });
  const endGame = () => dispatch({ type: 'END_GAME' });
  const nextRound = () => dispatch({ type: 'NEXT_ROUND' });
  
  const value = {
    state,
    calculateNetWorth,
    executeTrade,
    startGame,
    pauseGame,
    resumeGame,
    endGame,
    nextRound
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
