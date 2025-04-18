
import { Asset, GameState } from '../types/game';
import { generateGameMissions } from '../utils/missionGenerator';

export const initialAssets: Asset[] = [
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

// Generate the initial set of missions for all rounds
const gameMissions = generateGameMissions();

export const initialGameState: GameState = {
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
  missions: gameMissions,
  activeMissions: gameMissions[1] || [], // Missions for round 1
  completedMissions: [],
  missionRewards: {}
};
