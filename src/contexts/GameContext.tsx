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
  activeNews: NewsItem[];
  netWorthHistory: { round: number; value: number }[];
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

const gameReducer = (state: GameState, action: Action): GameState => {
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
        isPaused: false,
        activeNews: [], 
      };

    case 'TICK':
      const newTimeRemaining = Math.max(0, state.timeRemaining - action.payload);
      
      if (newTimeRemaining <= 0) {
        return {
          ...state,
          timeRemaining: 0,
          isPaused: true,
        };
      }

      return {
        ...state,
        timeRemaining: newTimeRemaining,
      };

    case 'UPDATE_PRICES': {
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
  const [lastTickTime, setLastTickTime] = useState<number | null>(null);

  useEffect(() => {
    let frameId: number;

    const updateTimer = (timestamp: number) => {
      if (!state.isPaused && !state.isGameOver) {
        if (lastTickTime === null) {
          setLastTickTime(timestamp);
        } else {
          const deltaTime = (timestamp - lastTickTime) / 1000;
          dispatch({ type: 'TICK', payload: deltaTime });
          
          if (Math.random() < 0.05) {
            dispatch({ type: 'UPDATE_PRICES' });
          }
          
          if (Math.random() < 0.01) {
            const newsItem = generateMarketNews(state.assets, state.round);
            dispatch({ type: 'ADD_NEWS', payload: newsItem });
            
            setTimeout(() => {
              dispatch({ type: 'EXPIRE_NEWS', payload: newsItem.id });
            }, 15000);
          }

          if (Math.random() < 0.02) {
            const healthChange = (Math.random() * 6) - 3;
            const newHealth = Math.max(0, Math.min(100, state.marketHealth + healthChange));
            dispatch({ type: 'UPDATE_MARKET_HEALTH', payload: newHealth });
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
  }, [state.isPaused, state.isGameOver, lastTickTime]);

  useEffect(() => {
    setLastTickTime(null);
  }, [state.isPaused]);

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
    const asset = state.assets.find(a => a.id === assetId);
    if (!asset) return;
    
    dispatch({ 
      type: 'EXECUTE_TRADE', 
      payload: { assetId, action, amount, price: asset.price } 
    });
  };

  const startGame = () => {
    dispatch({ type: 'START_GAME' });
  };
  
  const pauseGame = () => {
    dispatch({ type: 'PAUSE_GAME' });
  };
  
  const resumeGame = () => {
    dispatch({ type: 'RESUME_GAME' });
  };
  
  const endGame = () => {
    dispatch({ type: 'END_GAME' });
  };
  
  const nextRound = () => {
    dispatch({ type: 'NEXT_ROUND' });
  };

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
