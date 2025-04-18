import { Asset, GameState } from '../types/game';
import { generateGameMissions } from '../utils/missionGenerator';

export const initialAssets: Asset[] = [
  // Stocks
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
    id: 'stock-cybersec',
    name: 'CyberShield',
    ticker: 'CYSC',
    price: 65,
    previousPrice: 65,
    volatility: 0.55,
    color: 'stock',
    description: 'Leading cybersecurity firm specializing in enterprise protection'
  },
  {
    id: 'stock-energy',
    name: 'Energy Sector ETF',
    ticker: 'ENRG',
    price: 75,
    previousPrice: 75,
    volatility: 0.5,
    color: 'stock',
    description: 'Major energy producers and infrastructure companies'
  },
  {
    id: 'stock-finance',
    name: 'Financial Index',
    ticker: 'FINX',
    price: 120,
    previousPrice: 120,
    volatility: 0.35,
    color: 'stock',
    description: 'Banking and financial services sector' 
  },
  {
    id: 'stock-shipping',
    name: 'Global Shipping',
    ticker: 'SHIP',
    price: 45,
    previousPrice: 45,
    volatility: 0.6,
    color: 'stock',
    description: 'International maritime shipping and logistics'
  },
  {
    id: 'stock-trade',
    name: 'Trade Conglomerate',
    ticker: 'TRDE',
    price: 110,
    previousPrice: 110,
    volatility: 0.4,
    color: 'stock',
    description: 'Multinational import/export and global trade facilitator'
  },
  {
    id: 'stock-healthcare',
    name: 'Healthcare Giants',
    ticker: 'HEAL',
    price: 90,
    previousPrice: 90,
    volatility: 0.3,
    color: 'stock',
    description: 'Healthcare, pharmaceutical, and biotech companies'
  },
  
  // Commodities
  {
    id: 'commodity-gold',
    name: 'Gold',
    ticker: 'GOLD',
    price: 1800,
    previousPrice: 1800,
    volatility: 0.2,
    color: 'commodity',
    description: 'Precious metal, traditionally a safe haven'
  },
  {
    id: 'commodity-oil',
    name: 'Crude Oil',
    ticker: 'OIL',
    price: 75,
    previousPrice: 75,
    volatility: 0.6,
    color: 'commodity',
    description: 'Global commodity with high geopolitical sensitivity'
  },
  {
    id: 'commodity-natgas',
    name: 'Natural Gas',
    ticker: 'NGAS',
    price: 3.8,
    previousPrice: 3.8,
    volatility: 0.7,
    color: 'commodity',
    description: 'Essential energy source with distinct seasonal patterns'
  },
  {
    id: 'commodity-silver',
    name: 'Silver',
    ticker: 'SLVR',
    price: 25,
    previousPrice: 25,
    volatility: 0.25,
    color: 'commodity',
    description: 'Industrial and precious metal with diverse applications'
  },
  {
    id: 'commodity-wheat',
    name: 'Wheat Futures',
    ticker: 'WHET',
    price: 800,
    previousPrice: 800,
    volatility: 0.45,
    color: 'commodity',
    description: 'Essential agricultural commodity influenced by global demand and weather'
  },
  {
    id: 'commodity-corn',
    name: 'Corn Futures',
    ticker: 'CORN',
    price: 600,
    previousPrice: 600,
    volatility: 0.4,
    color: 'commodity',
    description: 'Staple agricultural product used for food, feed, and fuel'
  },
  {
    id: 'commodity-copper',
    name: 'Copper',
    ticker: 'COPR',
    price: 4.2,
    previousPrice: 4.2,
    volatility: 0.5,
    color: 'commodity',
    description: 'Industrial metal considered a leading indicator of economic health'
  },
  {
    id: 'commodity-rare',
    name: 'Rare Earth Metals',
    ticker: 'RARE',
    price: 250,
    previousPrice: 250,
    volatility: 0.55,
    color: 'commodity',
    description: 'Critical materials for high-tech manufacturing and electronics'
  },
  
  // Cryptocurrencies
  {
    id: 'crypto-btc',
    name: 'Bitcoin',
    ticker: 'BTC',
    price: 40000,
    previousPrice: 40000,
    volatility: 0.8,
    color: 'crypto',
    description: 'The original cryptocurrency with the largest market cap'
  },
  {
    id: 'crypto-eth',
    name: 'Ethereum',
    ticker: 'ETH',
    price: 2500,
    previousPrice: 2500,
    volatility: 0.75,
    color: 'crypto',
    description: 'Smart contract platform powering decentralized applications'
  },
  {
    id: 'crypto-sol',
    name: 'Solana',
    ticker: 'SOL',
    price: 100,
    previousPrice: 100,
    volatility: 0.9,
    color: 'crypto',
    description: 'High-performance blockchain focusing on speed and low fees'
  },
  {
    id: 'crypto-stable',
    name: 'Stablecoin Index',
    ticker: 'STBL',
    price: 1,
    previousPrice: 1,
    volatility: 0.05,
    color: 'crypto',
    description: 'Basket of stablecoins pegged to the US dollar'
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
