
import { EventDensity, NewsItem } from '../../types/game';

export type GameAction =
  | { type: 'START_GAME' }
  | { type: 'END_GAME' }
  | { type: 'NEXT_ROUND' }
  | { type: 'TICK'; payload: number }
  | { type: 'UPDATE_PRICES' }
  | { type: 'ADD_NEWS'; payload: NewsItem }
  | { type: 'EXPIRE_NEWS'; payload: string }
  | { type: 'EXECUTE_TRADE'; payload: { assetId: string; action: 'buy' | 'sell' | 'short' | 'cover'; amount: number; price: number; timestamp?: number } }
  | { type: 'UPDATE_MARKET_HEALTH'; payload: number }
  | { type: 'UPDATE_NET_WORTH'; payload?: { timestamp?: number } }
  | { type: 'UPDATE_MISSION_PROGRESS'; payload?: { missionId?: string } }
  | { type: 'COMPLETE_MISSION'; payload: { missionId: string } }
  | { type: 'FAIL_MISSION'; payload: { missionId: string } }
  | { type: 'UPDATE_EVENT_DENSITY'; payload: EventDensity }
  | { type: 'SET_LAST_NEWS_UPDATE'; payload: number }
  | { type: 'SCHEDULE_NEWS'; payload: NewsItem[] }
  | { type: 'TRIGGER_EVENT'; payload: number };

