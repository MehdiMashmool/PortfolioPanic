
export type Asset = {
  id: string;
  name: string;
  ticker: string;
  price: number;
  previousPrice: number;
  volatility: number;
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
  magnitude: number;
  timestamp: number;
  isActive: boolean;
};

export type TradeAction = 'buy' | 'sell' | 'short' | 'cover';

export type NetWorthHistoryEntry = {
  round: number;
  value: number;
  timestamp?: number;
};

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
  netWorthHistory: NetWorthHistoryEntry[];
  marketHealth: number;
  lastPriceUpdate?: number;
};
