import type { Asset, NewsItem } from "../types/game";
import {
  applyNewsToAsset,
  getNewsDuration,
  getImplicitlyImpactedAssets,
} from "./newsUtils";

// Category-based news events (original format)
const categoryBasedNewsEvents = [
  // Economic News
  {
    id: "gdp-growth-exceeds",
    title: "GDP Growth Exceeds Expectations",
    content:
      "Quarterly GDP growth comes in at 4.2%, well above the 3.1% forecast.",
    sentiment: "positive",
    magnitude: 0.5,
    effects: {
      stock: { change: 2.5, duration: 45 },
      commodity: { change: [0.8, -1.2], duration: [45, 30] }, // Different effect on different commodities
      crypto: { change: [1.0, -0.5], duration: [30, 20] },
    },
    specificAssets: {
      "stock-finance": 3.2,
      "stock-trade": 2.8,
      "commodity-copper": 1.5,
    },
  },
  {
    id: "unemployment-low",
    title: "Unemployment Rate Hits Multi-Year Low",
    content:
      "Labor market strengthens as unemployment falls to 3.4%, lowest in 50 years.",
    sentiment: "positive",
    magnitude: 0.6,
    effects: {
      stock: { change: [1.7, 0.8], duration: [30, 60] },
      commodity: { change: [-0.5, 1.3], duration: [40, 35] },
      crypto: { change: [-0.5, 1.2], duration: [15, 45] },
    },
    specificAssets: {
      "stock-tech": 2.1,
      "stock-healthcare": 1.4,
    },
  },
  {
    id: "manufacturing-contracts",
    title: "Manufacturing PMI Contracts",
    content:
      "Manufacturing Purchasing Managers' Index falls below 50, indicating sector contraction.",
    sentiment: "negative",
    magnitude: 0.5,
    effects: {
      stock: { change: -1.5, duration: 40 },
      commodity: { change: [-0.8, -2.3], duration: [30, 50] },
      crypto: { change: [-0.7, 0], duration: [25, 0] },
    },
    specificAssets: {
      "stock-trade": -2.1,
      "commodity-copper": -2.5,
      "commodity-rare": -1.9,
    },
  },
  {
    id: "inflation-surges",
    title: "Inflation Surges Past Expectations",
    content:
      "Consumer Price Index rises 6.8% year-over-year, exceeding forecasts of 6.2%.",
    sentiment: "negative",
    magnitude: 0.7,
    effects: {
      stock: { change: [-2.0, 0.7], duration: [30, 30] },
      commodity: { change: [2.4, 1.7], duration: [60, 45] },
      crypto: { change: [-1.5, 3.0], duration: [20, 40] },
    },
    specificAssets: {
      "stock-finance": -2.5,
      "commodity-gold": 3.2,
      "commodity-silver": 2.9,
    },
  },

  // Energy Market News
  {
    id: "natural-gas-shortage",
    title: "Natural Gas Supply Shortage",
    content:
      "Cold weather forecasts trigger concerns about natural gas supplies.",
    sentiment: "negative",
    magnitude: 0.6,
    effects: {
      stock: { change: -0.8, duration: 35 },
      commodity: { change: [2.1, 4.5], duration: [40, 30] },
      crypto: { change: -0.3, duration: 20 },
    },
    specificAssets: {
      "stock-energy": -1.5,
      "commodity-natgas": 7.5,
      "commodity-oil": 2.1,
    },
  },
  {
    id: "renewable-milestone",
    title: "Renewable Energy Milestone Reached",
    content:
      "Solar and wind power reach 25% of global electricity generation for first time.",
    sentiment: "positive",
    magnitude: 0.5,
    effects: {
      stock: { change: 1.3, duration: 40 },
      commodity: { change: [-2.2, -0.8], duration: [50, 30] },
      crypto: { change: 0.7, duration: 25 },
    },
    specificAssets: {
      "stock-energy": 2.8,
      "commodity-natgas": -3.2,
      "commodity-oil": -2.5,
    },
  },

  // Agricultural News
  {
    id: "crop-yields-down",
    title: "Global Crop Yields Down",
    content:
      "Extreme weather conditions reduce global harvest expectations by 8%.",
    sentiment: "negative",
    magnitude: 0.7,
    effects: {
      stock: { change: -0.9, duration: 30 },
      commodity: { change: 4.2, duration: 55 },
      crypto: { change: 0, duration: 0 },
    },
    specificAssets: {
      "commodity-wheat": 6.5,
      "commodity-corn": 5.8,
    },
  },
  {
    id: "agricultural-tech-breakthrough",
    title: "Agricultural Technology Breakthrough",
    content: "New drought-resistant seed technology increases yields by 35%.",
    sentiment: "positive",
    magnitude: 0.6,
    effects: {
      stock: { change: 1.2, duration: 35 },
      commodity: { change: -2.8, duration: 45 },
      crypto: { change: 0, duration: 0 },
    },
    specificAssets: {
      "stock-tech": 1.8,
      "commodity-wheat": -3.5,
      "commodity-corn": -3.2,
    },
  },

  // Metals Market News
  {
    id: "copper-demand-surge",
    title: "Industrial Copper Demand Surges",
    content:
      "Global manufacturing recovery drives copper prices to 3-year high.",
    sentiment: "positive",
    magnitude: 0.6,
    effects: {
      stock: { change: 1.3, duration: 40 },
      commodity: { change: 2.5, duration: 50 },
      crypto: { change: 0.5, duration: 20 },
    },
    specificAssets: {
      "stock-trade": 1.8,
      "commodity-copper": 5.3,
    },
  },
  {
    id: "rare-earth-shortage",
    title: "Rare Earth Metals Supply Concerns",
    content:
      "Export restrictions threaten global supply of critical rare earth elements.",
    sentiment: "negative",
    magnitude: 0.7,
    effects: {
      stock: { change: -1.5, duration: 45 },
      commodity: { change: 3.8, duration: 60 },
      crypto: { change: 0.4, duration: 20 },
    },
    specificAssets: {
      "stock-tech": -2.3,
      "commodity-rare": 8.5,
    },
  },

  // Central Bank News
  {
    id: "fed-hikes-rates",
    title: "Federal Reserve Hikes Interest Rates",
    content:
      "Fed increases rates by 50 basis points, signals additional hikes ahead.",
    sentiment: "negative",
    magnitude: 0.8,
    effects: {
      stock: { change: -3.2, duration: 60 },
      commodity: { change: [-1.5, -1.8], duration: [40, 45] },
      crypto: { change: -4.5, duration: 75 },
    },
    specificAssets: {
      "stock-finance": -4.2,
      "commodity-gold": 2.1,
      "crypto-stable": -0.5,
    },
  },

  // Technology Sector
  {
    id: "chip-shortage-worsens",
    title: "Global Semiconductor Shortage Worsens",
    content:
      "Production delays expected to continue through next year for electronics manufacturers.",
    sentiment: "negative",
    magnitude: 0.7,
    effects: {
      stock: { change: -2.5, duration: 55 },
      commodity: { change: 2.1, duration: 40 },
      crypto: { change: -1.2, duration: 30 },
    },
    specificAssets: {
      "stock-tech": -3.5,
      "commodity-rare": 4.2,
    },
  },
  {
    id: "cybersecurity-spending",
    title: "Cybersecurity Spending Surges",
    content:
      "Enterprises increase cybersecurity budgets by 40% after wave of attacks.",
    sentiment: "positive",
    magnitude: 0.6,
    effects: {
      stock: { change: 2.1, duration: 45 },
      commodity: { change: 0, duration: 0 },
      crypto: { change: 1.5, duration: 35 },
    },
    specificAssets: {
      "stock-cybersec": 7.5,
      "stock-tech": 3.2,
    },
  },

  // Shipping and Trade
  {
    id: "port-congestion",
    title: "Global Port Congestion Worsens",
    content:
      "Wait times at major ports reach 3 weeks, disrupting global supply chains.",
    sentiment: "negative",
    magnitude: 0.7,
    effects: {
      stock: { change: -1.8, duration: 50 },
      commodity: { change: 2.4, duration: 45 },
      crypto: { change: 0, duration: 0 },
    },
    specificAssets: {
      "stock-shipping": -4.5,
      "stock-trade": -3.2,
      "commodity-wheat": 3.5,
      "commodity-copper": 2.8,
    },
  },
  {
    id: "shipping-rates-drop",
    title: "Global Shipping Rates Plummet",
    content:
      "Container shipping costs fall 45% as supply chain pressures ease.",
    sentiment: "positive",
    magnitude: 0.6,
    effects: {
      stock: { change: 2.2, duration: 40 },
      commodity: { change: -1.5, duration: 35 },
      crypto: { change: 0.8, duration: 25 },
    },
    specificAssets: {
      "stock-shipping": -3.8,
      "stock-trade": 3.5,
    },
  },

  // Cryptocurrency Specific
  {
    id: "bitcoin-adoption",
    title: "Major Payment Processor Adopts Bitcoin",
    content:
      "Global payment network enables Bitcoin transactions for 30 million merchants.",
    sentiment: "positive",
    magnitude: 0.8,
    effects: {
      stock: { change: 0.9, duration: 30 },
      commodity: { change: -0.7, duration: 25 },
      crypto: { change: 5.5, duration: 60 },
    },
    specificAssets: {
      "crypto-btc": 8.5,
      "crypto-eth": 6.2,
      "crypto-sol": 5.8,
    },
  },
  {
    id: "eth-upgrade",
    title: "Ethereum Network Major Upgrade",
    content:
      "New protocol promises 100x throughput increase and 90% energy reduction.",
    sentiment: "positive",
    magnitude: 0.7,
    effects: {
      stock: { change: 0.5, duration: 20 },
      commodity: { change: 0, duration: 0 },
      crypto: { change: 4.2, duration: 55 },
    },
    specificAssets: {
      "crypto-eth": 9.5,
      "crypto-sol": -2.8,
    },
  },
  {
    id: "sol-outage",
    title: "Solana Network Experiences Outage",
    content:
      "Major blockchain network down for 6 hours due to congestion issues.",
    sentiment: "negative",
    magnitude: 0.6,
    effects: {
      stock: { change: 0, duration: 0 },
      commodity: { change: 0, duration: 0 },
      crypto: { change: -3.5, duration: 40 },
    },
    specificAssets: {
      "crypto-sol": -12.5,
      "crypto-eth": 2.8,
    },
  },
  {
    id: "blockchain-breakthrough",
    title: "Blockchain Technology Breakthrough",
    content:
      "New blockchain protocol achieves 100,000 transactions per second in production environment.",
    sentiment: "positive",
    magnitude: 0.8,
    effects: {
      stock: { change: 0.8, duration: 30 },
      commodity: { change: 0, duration: 0 },
      crypto: { change: 5.2, duration: 70 },
    },
    specificAssets: {
      "crypto-blockchain": 7.5,
      "crypto-defi": 6.2,
      "crypto-stable": 0.5,
    },
  },
  {
    id: "defi-security-breach",
    title: "Major DeFi Protocol Security Breach",
    content:
      "Hackers exploit vulnerability in popular DeFi platform, stealing assets worth $320 million.",
    sentiment: "negative",
    magnitude: 0.9,
    effects: {
      stock: { change: -0.5, duration: 20 },
      commodity: { change: 0.3, duration: 15 },
      crypto: { change: -6.5, duration: 55 },
    },
    specificAssets: {
      "crypto-defi": -12.0,
      "crypto-blockchain": -8.5,
      "crypto-privacy": -5.0,
      "crypto-stable": -0.8,
    },
  },
  {
    id: "crypto-regulation",
    title: "New Cryptocurrency Regulation Framework Announced",
    content:
      "Government introduces comprehensive regulation for cryptocurrency markets and exchanges.",
    sentiment: "neutral",
    magnitude: 0.7,
    effects: {
      stock: { change: 0.4, duration: 25 },
      commodity: { change: 0, duration: 0 },
      crypto: { change: [-4.2, 3.5], duration: [45, 60] },
    },
    specificAssets: {
      "crypto-stable": 2.5,
      "crypto-privacy": -7.8,
      "crypto-defi": -5.2,
    },
  },
];

// Complete the tickerBasedNewsEvents array with the rest of the events
const tickerBasedNewsEvents = [
  // Economic Indicators
  {
    id: "gdp-growth-exceeds-ticker",
    title: "GDP Growth Exceeds Expectations",
    content:
      "Quarterly GDP growth comes in at 4.2%, well above the 3.1% forecast.",
    sentiment: "positive",
    magnitude: 0.5,
    effects: {
      TECH: { change: 3.2, duration: 45 },
      CYSC: { change: 2.8, duration: 40 },
      FINX: { change: 3.5, duration: 50 },
      TRDE: { change: 2.9, duration: 45 },
      GOLD: { change: -1.2, duration: 30 },
      OIL: { change: 1.8, duration: 60 },
      BTC: { change: 1.5, duration: 35 },
      ETH: { change: 2.0, duration: 40 },
    },
  },
  {
    id: "inflation-spike",
    title: "Inflation Spikes to 7-Year High",
    content:
      "Consumer Price Index shows inflation at 6.8%, highest since 2015.",
    sentiment: "negative",
    magnitude: 0.7,
    effects: {
      FINX: { change: -3.2, duration: 55 },
      GOLD: { change: 4.5, duration: 70 },
      SLVR: { change: 3.8, duration: 65 },
      WHET: { change: 2.5, duration: 45 },
      CORN: { change: 2.3, duration: 45 },
      BTC: { change: 2.8, duration: 50 },
      STBL: { change: -0.8, duration: 40 },
    },
  },
  {
    id: "unemployment-drops",
    title: "Unemployment Rate Hits Historic Low",
    content: "National unemployment falls to 3.2%, lowest in over 50 years.",
    sentiment: "positive",
    magnitude: 0.6,
    effects: {
      TECH: { change: 2.1, duration: 40 },
      FINX: { change: 3.4, duration: 50 },
      TRDE: { change: 2.6, duration: 45 },
      HEAL: { change: 1.8, duration: 35 },
      RARE: { change: 1.5, duration: 30 },
      ETH: { change: 1.2, duration: 25 },
    },
  },

  // Political Events
  {
    id: "trade-war-escalation",
    title: "Trade War Escalates Between Major Economies",
    content:
      "New tariffs imposed on $200 billion worth of goods between rival nations.",
    sentiment: "negative",
    magnitude: 0.8,
    effects: {
      TRDE: { change: -4.5, duration: 65 },
      SHIP: { change: -3.8, duration: 60 },
      TECH: { change: -2.9, duration: 50 },
      RARE: { change: 3.2, duration: 55 },
      COPR: { change: -2.1, duration: 45 },
      BTC: { change: 2.4, duration: 40 },
    },
  },
  {
    id: "peace-treaty-signed",
    title: "Historic Peace Treaty Signed in Conflict Zone",
    content:
      "After decades of tension, rival nations agree to comprehensive peace agreement.",
    sentiment: "positive",
    magnitude: 0.7,
    effects: {
      FINX: { change: 2.8, duration: 50 },
      TRDE: { change: 3.5, duration: 55 },
      SHIP: { change: 2.6, duration: 45 },
      OIL: { change: -3.2, duration: 60 },
      NGAS: { change: -2.5, duration: 50 },
      GOLD: { change: -1.8, duration: 40 },
    },
  },

  // Natural Disasters
  {
    id: "major-hurricane",
    title: "Category 5 Hurricane Devastates Coastal Region",
    content:
      "Massive storm causes billions in damage to critical infrastructure and shipping hubs.",
    sentiment: "negative",
    magnitude: 0.9,
    effects: {
      SHIP: { change: -5.2, duration: 70 },
      ENRG: { change: 3.8, duration: 60 },
      OIL: { change: 4.5, duration: 65 },
      NGAS: { change: 3.9, duration: 60 },
      HEAL: { change: 2.4, duration: 45 },
      FINX: { change: -1.8, duration: 40 },
    },
  },

  // Technology News
  {
    id: "quantum-computing-breakthrough",
    title: "Major Quantum Computing Breakthrough Announced",
    content:
      "Scientists achieve quantum supremacy with new 1000-qubit processor.",
    sentiment: "positive",
    magnitude: 0.8,
    effects: {
      TECH: { change: 7.5, duration: 80 },
      CYSC: { change: 4.2, duration: 65 },
      RARE: { change: 3.8, duration: 60 },
      BTC: { change: -2.5, duration: 45 },
      ETH: { change: 3.2, duration: 55 },
      SOL: { change: 4.0, duration: 60 },
    },
  },

  // Energy Sector
  {
    id: "opec-production-cut",
    title: "OPEC Announces Major Production Cut",
    content: "Oil cartel agrees to reduce output by 2 million barrels per day.",
    sentiment: "mixed",
    magnitude: 0.7,
    effects: {
      OIL: { change: 8.5, duration: 85 },
      NGAS: { change: 3.2, duration: 55 },
      ENRG: { change: 5.8, duration: 75 },
      SHIP: { change: -2.1, duration: 45 },
      TRDE: { change: -1.8, duration: 40 },
    },
  },

  // Financial Markets
  {
    id: "central-bank-rate-hike",
    title: "Central Bank Raises Interest Rates by 75 Basis Points",
    content:
      "Surprise move signals aggressive stance against inflation pressures.",
    sentiment: "negative",
    magnitude: 0.7,
    effects: {
      FINX: { change: -4.2, duration: 65 },
      TECH: { change: -3.8, duration: 60 },
      GOLD: { change: 2.5, duration: 50 },
      BTC: { change: -5.5, duration: 70 },
      ETH: { change: -4.8, duration: 65 },
      STBL: { change: 0.8, duration: 40 },
    },
  },

  // Health & Medicine
  {
    id: "pandemic-resurgence",
    title: "New Virus Variant Triggers Global Health Emergency",
    content:
      "WHO declares emergency as highly contagious variant spreads to 30+ countries.",
    sentiment: "negative",
    magnitude: 0.9,
    effects: {
      HEAL: { change: 6.5, duration: 80 },
      SHIP: { change: -7.2, duration: 85 },
      TRDE: { change: -5.8, duration: 75 },
      OIL: { change: -6.5, duration: 80 },
      GOLD: { change: 4.2, duration: 65 },
      BTC: { change: -3.5, duration: 60 },
    },
  },

  // Celebrity & Entertainment
  {
    id: "celebrity-crypto-endorsement",
    title: "A-List Actor Launches 'MoonRocket' Cryptocurrency",
    content:
      "Superstar claims new crypto will 'definitely reach Mars before Elon's rockets do'.",
    sentiment: "mixed",
    magnitude: 0.5,
    effects: {
      BTC: { change: -2.5, duration: 45 },
      ETH: { change: -1.8, duration: 40 },
      SOL: { change: -3.2, duration: 55 },
      STBL: { change: 0.5, duration: 30 },
      TECH: { change: 0.8, duration: 25 },
    },
  },

  // Unexpected Events
  {
    id: "ufo-confirmation",
    title: "Government Confirms Extraterrestrial Technology Recovery",
    content:
      "Declassified documents reveal decades of alien tech reverse-engineering programs.",
    sentiment: "mixed",
    magnitude: 0.9,
    effects: {
      TECH: { change: 12.5, duration: 100 },
      RARE: { change: 8.5, duration: 90 },
      CYSC: { change: 6.8, duration: 80 },
      OIL: { change: -7.5, duration: 85 },
      NGAS: { change: -6.8, duration: 80 },
      BTC: { change: -3.5, duration: 60 },
      ETH: { change: 4.5, duration: 65 },
    },
  },

  // Supply Chain Issues
  {
    id: "chip-shortage-worsens-ticker",
    title: "Global Semiconductor Shortage Reaches Critical Level",
    content:
      "Wait times for critical chips extend to 18 months, halting multiple industries.",
    sentiment: "negative",
    magnitude: 0.8,
    effects: {
      TECH: { change: -5.8, duration: 75 },
      RARE: { change: 6.5, duration: 80 },
      COPR: { change: 4.8, duration: 70 },
      SHIP: { change: -3.5, duration: 60 },
      TRDE: { change: -4.2, duration: 65 },
    },
  },
];

// Combine both event types
const marketNewsEvents = [...categoryBasedNewsEvents, ...tickerBasedNewsEvents];

// Black Swan Events - rare but extreme market-wide shocks
const blackSwanEvents = [
  {
    id: "global-financial-crisis",
    title: "BREAKING: Global Financial Crisis Unfolds",
    content:
      "Major banks across multiple continents report insolvency as markets crash worldwide.",
    sentiment: "negative" as const,
    magnitude: 1.0,
    effects: {
      TECH: { change: -12.0, duration: 120 },
      CYSC: { change: -8.5, duration: 100 },
      FINX: { change: -20.0, duration: 150 },
      SHIP: { change: -15.0, duration: 130 },
      TRDE: { change: -14.0, duration: 120 },
      GOLD: { change: 8.0, duration: 120 },
      OIL: { change: -10.0, duration: 110 },
      BTC: { change: -18.0, duration: 100 },
      ETH: { change: -16.0, duration: 95 },
    },
    circuitBreaker: true, // Indicates this event should trigger circuit breakers
    aftershockProbability: 0.8, // High chance of aftershocks
    aftershockDelay: 20, // Aftershocks happen after 20 time units
  },
  {
    id: "unprecedented-tech-revolution",
    title: "BREAKTHROUGH: Revolutionary Technology Changes Everything",
    content:
      "A groundbreaking technology immediately transforms global industries and market dynamics.",
    sentiment: "positive" as const,
    magnitude: 0.95,
    effects: {
      TECH: { change: 18.0, duration: 140 },
      CYSC: { change: 15.0, duration: 130 },
      ENRG: { change: -10.0, duration: 100 },
      RARE: { change: 14.0, duration: 120 },
      OIL: { change: -12.0, duration: 110 },
      NGAS: { change: -8.0, duration: 90 },
      ETH: { change: 10.0, duration: 100 },
      SOL: { change: 12.0, duration: 110 },
    },
    circuitBreaker: true,
    aftershockProbability: 0.7,
    aftershockDelay: 25,
  },
  {
    id: "global-pandemic",
    title: "ALERT: Global Pandemic Declared",
    content:
      "WHO declares global emergency as new virus spreads rapidly with high mortality rate.",
    sentiment: "negative" as const,
    magnitude: 0.98,
    effects: {
      HEAL: { change: 15.0, duration: 130 },
      TECH: { change: -8.0, duration: 100 },
      SHIP: { change: -20.0, duration: 150 },
      TRDE: { change: -18.0, duration: 140 },
      OIL: { change: -22.0, duration: 160 },
      GOLD: { change: 10.0, duration: 120 },
      WHET: { change: 8.0, duration: 110 },
      CORN: { change: 6.0, duration: 100 },
    },
    circuitBreaker: true,
    aftershockProbability: 0.9,
    aftershockDelay: 15,
  },
  {
    id: "currency-collapse",
    title: "CRISIS: Major World Currency Collapses",
    content:
      "One of the world's major currencies loses 70% of its value in 24 hours.",
    sentiment: "negative" as const,
    magnitude: 0.95,
    effects: {
      FINX: { change: -18.0, duration: 140 },
      GOLD: { change: 25.0, duration: 160 },
      SLVR: { change: 20.0, duration: 150 },
      BTC: { change: 30.0, duration: 170 },
      ETH: { change: 25.0, duration: 160 },
      STBL: { change: -5.0, duration: 80 },
    },
    circuitBreaker: true,
    aftershockProbability: 0.7,
    aftershockDelay: 20,
  },
  {
    id: "global-peace-breakthrough",
    title: "HISTORIC: World Peace Agreement Signed",
    content:
      "After decades of conflict, all major global powers sign comprehensive peace accord.",
    sentiment: "positive" as const,
    magnitude: 0.9,
    effects: {
      FINX: { change: 12.0, duration: 130 },
      TECH: { change: 10.0, duration: 120 },
      TRDE: { change: 15.0, duration: 140 },
      SHIP: { change: 14.0, duration: 130 },
      OIL: { change: -8.0, duration: 100 },
      RARE: { change: -5.0, duration: 90 },
    },
    circuitBreaker: false,
    aftershockProbability: 0.6,
    aftershockDelay: 30,
  },
];

/**
 * Get news templates that are specific to a particular asset
 * @param assetId - The ID of the asset to find news for
 * @returns An array of news templates relevant to the asset
 */
const getAssetSpecificTemplates = (assetId: string) => {
  // First try to find category-based news with this specific asset mentioned
  const categorySpecificTemplates = categoryBasedNewsEvents.filter(
    (event) =>
      event.specificAssets && event.specificAssets[assetId] !== undefined
  );

  if (categorySpecificTemplates.length > 0) {
    return categorySpecificTemplates;
  }

  // Check for ticker-based events
  const asset = assetId.split("-");
  if (asset.length > 1) {
    const assetTicker = getTickerFromAssetId(assetId);
    if (assetTicker) {
      const tickerSpecificTemplates = tickerBasedNewsEvents.filter(
        (event) => event.effects && event.effects[assetTicker] !== undefined
      );

      if (tickerSpecificTemplates.length > 0) {
        return tickerSpecificTemplates;
      }
    }
  }

  // If no specific news for this asset, try to find category-based news for this asset's category
  const assetCategory = assetId.split("-")[0]; // 'stock', 'commodity', or 'crypto'

  return categoryBasedNewsEvents.filter(
    (event) =>
      event.effects &&
      event.effects[assetCategory] &&
      event.effects[assetCategory].change !== 0 &&
      event.effects[assetCategory].duration > 0
  );
};

/**
 * Map an asset ID to its ticker symbol
 * @param assetId - The asset ID to convert
 * @returns The ticker symbol or undefined if not found
 */
export const getTickerFromAssetId = (assetId: string): string | undefined => {
  const assetMap: Record<string, string> = {
    "stock-tech": "TECH",
    "stock-cybersec": "CYSC",
    "stock-energy": "ENRG",
    "stock-finance": "FINX",
    "stock-shipping": "SHIP",
    "stock-trade": "TRDE",
    "stock-healthcare": "HEAL",
    "commodity-gold": "GOLD",
    "commodity-oil": "OIL",
    "commodity-natgas": "NGAS",
    "commodity-silver": "SLVR",
    "commodity-wheat": "WHET",
    "commodity-corn": "CORN",
    "commodity-copper": "COPR",
    "commodity-rare": "RARE",
    "crypto-btc": "BTC",
    "crypto-eth": "ETH",
    "crypto-sol": "SOL",
    "crypto-stable": "STBL",
  };

  return assetMap[assetId];
};

/**
 * Get general market news templates that can affect multiple assets
 * @returns An array of news templates
 */
const getGeneralMarketNews = () => {
  // Category-based news events that affect multiple categories significantly
  const categoryNewsEvents = categoryBasedNewsEvents.filter((event) => {
    const categories = ["stock", "commodity", "crypto"];
    const affectedCategories = categories.filter(
      (cat) =>
        event.effects[cat] &&
        event.effects[cat].change !== 0 &&
        event.effects[cat].duration > 0
    );
    return affectedCategories.length >= 2;
  });

  // Ticker-based events affecting multiple assets
  const tickerNewsEvents = tickerBasedNewsEvents.filter((event) => {
    // If it affects 3 or more tickers, consider it a general market event
    return Object.keys(event.effects).length >= 3;
  });

  return [...categoryNewsEvents, ...tickerNewsEvents];
};

/**
 * Generate a market news item that affects one or more assets
 * @param assets - The list of available assets in the game
 * @param round - The current game round number
 * @returns A generated news item
 */
export const generateMarketNews = (
  assets: Asset[],
  round: number
): NewsItem => {
  if (!assets || assets.length === 0) {
    console.error("Cannot generate news: No assets provided");
    return createEmptyNewsItem(round);
  }

  // Determine which asset(s) will be affected by this news
  const targetAssetProbability = Math.random();

  let newsSource: string;
  let selectedTemplate: any;
  let primaryAssetId: string;

  // 60% chance to generate asset-specific news
  if (targetAssetProbability < 0.6) {
    // Select a random asset to target with the news
    const randomAssetIndex = Math.floor(Math.random() * assets.length);
    primaryAssetId = assets[randomAssetIndex].id;

    // Get news templates specific to this asset
    const templates = getAssetSpecificTemplates(primaryAssetId);

    if (templates.length === 0) {
      console.warn(
        `No suitable news templates found for asset ${primaryAssetId}`
      );
      return createEmptyNewsItem(round);
    }

    selectedTemplate = templates[Math.floor(Math.random() * templates.length)];
    newsSource = "Asset";
  } else {
    // General market news that affects multiple assets
    const templates = getGeneralMarketNews();

    if (templates.length === 0) {
      console.warn("No suitable general market news templates found");
      return createEmptyNewsItem(round);
    }

    selectedTemplate = templates[Math.floor(Math.random() * templates.length)];

    // For general news, determine primary asset based on the news template format
    if (
      selectedTemplate.effects.stock ||
      selectedTemplate.effects.commodity ||
      selectedTemplate.effects.crypto
    ) {
      // Category-based format
      const potentialAssets = assets.filter((asset) => {
        const assetCategory = asset.id.split("-")[0];
        if (
          !selectedTemplate.effects ||
          !selectedTemplate.effects[assetCategory]
        ) {
          return false;
        }

        const effectChange = selectedTemplate.effects[assetCategory].change;
        const effectMagnitude = Array.isArray(effectChange)
          ? Math.abs(effectChange[0])
          : Math.abs(effectChange);

        return effectMagnitude > 1.0;
      });

      if (potentialAssets.length > 0) {
        const randomIndex = Math.floor(Math.random() * potentialAssets.length);
        primaryAssetId = potentialAssets[randomIndex].id;
      } else {
        // Fallback if no asset is significantly affected
        const randomAssetIndex = Math.floor(Math.random() * assets.length);
        primaryAssetId = assets[randomAssetIndex].id;
      }
    } else {
      // Ticker-based format
      const assetTickerMap: Record<string, string> = {};
      assets.forEach((asset) => {
        const ticker = getTickerFromAssetId(asset.id);
        if (ticker) {
          assetTickerMap[ticker] = asset.id;
        }
      });

      // Find assets with the highest impact
      const highImpactTickers = Object.keys(selectedTemplate.effects).filter(
        (ticker) => Math.abs(selectedTemplate.effects[ticker].change) > 3.0
      );

      if (highImpactTickers.length > 0) {
        // Choose a random high-impact ticker
        const randomTicker =
          highImpactTickers[
            Math.floor(Math.random() * highImpactTickers.length)
          ];
        primaryAssetId = assetTickerMap[randomTicker] || assets[0].id;
      } else {
        // No high impact tickers, choose random asset
        const randomAssetIndex = Math.floor(Math.random() * assets.length);
        primaryAssetId = assets[randomAssetIndex].id;
      }
    }

    newsSource = "Market";
  }

  // Generate list of all assets impacted by this news
  const impactedAssets = [primaryAssetId];

  // Add other assets that would be affected by this news
  assets.forEach((asset) => {
    if (asset.id !== primaryAssetId) {
      const effect = applyNewsToAsset(asset.id, selectedTemplate);
      if (Math.abs(effect) > 0.5) {
        impactedAssets.push(asset.id);
      }
    }
  });

  // Create the news item
  const newsItem: NewsItem = {
    id: `${selectedTemplate.id}-${round}-${Date.now()}`,
    title: selectedTemplate.title,
    content: selectedTemplate.content,
    timestamp: Date.now(),
    source: newsSource,
    sentiment: selectedTemplate.sentiment,
    magnitude: selectedTemplate.magnitude,
    impactedAssets,
    isActive: true, // Set news as active by default
  };

  return newsItem;
};

/**
 * Create an empty news item as a fallback when news generation fails
 * @param round - The current game round
 * @returns A default news item
 */
const createEmptyNewsItem = (round: number): NewsItem => {
  return {
    id: `default-news-${round}-${Date.now()}`,
    title: "Market Update",
    content:
      "Markets are trading normally with no significant events to report.",
    timestamp: Date.now(),
    source: "Market",
    sentiment: "neutral",
    magnitude: 0.1,
    impactedAssets: [],
    isActive: true,
  };
};

/**
 * Get the CSS class for styling based on news sentiment
 * @param sentiment - The sentiment of the news (positive/negative/neutral/mixed/humorous)
 * @returns The CSS class name
 */
export const getNewsSentimentClass = (sentiment: string): string => {
  switch (sentiment) {
    case "positive":
      return "border-l-profit";
    case "negative":
      return "border-l-loss";
    case "neutral":
    case "mixed":
    case "humorous":
    default:
      return "border-neutral";
  }
};

/**
 * Generate a Black Swan event (rare but extreme market impact)
 * @param assets - The list of available assets in the game
 * @param round - The current game round
 * @returns A news item representing a Black Swan event or null if none should be generated
 */
export const generateBlackSwanEvent = (
  assets: Asset[],
  round: number
): NewsItem | null => {
  // Black Swan events are extremely rare - 0.5% chance per round
  // Should not happen in first few rounds
  if (round < 3 || Math.random() > 0.005) {
    return null;
  }

  // Choose a random Black Swan event
  const eventIndex = Math.floor(Math.random() * blackSwanEvents.length);
  const selectedEvent = blackSwanEvents[eventIndex];

  // Add all assets as impacted
  const impactedAssets = assets.map((asset) => asset.id);

  // Create the news item
  const newsItem: NewsItem = {
    id: `${selectedEvent.id}-${round}-${Date.now()}`,
    title: selectedEvent.title,
    content: selectedEvent.content,
    timestamp: Date.now(),
    source: "BREAKING",
    sentiment: selectedEvent.sentiment,
    magnitude: selectedEvent.magnitude,
    impactedAssets,
    isActive: true,
    isBlackSwan: true,
    circuitBreaker: selectedEvent.circuitBreaker,
    aftershockProbability: selectedEvent.aftershockProbability,
    aftershockDelay: selectedEvent.aftershockDelay,
  };

  return newsItem;
};

/**
 * Modifies the newsItem to prepare it for gradual impact application
 * @param newsItem - The news item to prepare
 * @param baseImpact - The full impact that would be applied instantly
 * @returns The news item with time-based impact fields initialized
 */
export const prepareGradualImpact = (
  newsItem: NewsItem,
  baseImpact: number
): NewsItem => {
  // For Black Swan events, impact builds up more drastically
  const isBlackSwan = newsItem.isBlackSwan || false;

  // Initialize the impact parameters
  newsItem.targetImpact = baseImpact;
  newsItem.appliedImpact = 0; // Start with zero impact

  // Different impact rates based on news magnitude
  if (isBlackSwan) {
    // Black swan events apply impact faster but still not instantly
    newsItem.impactRate = Math.abs(baseImpact) * 0.3; // 30% per time unit
  } else if (newsItem.magnitude > 0.7) {
    // High magnitude news applies faster
    newsItem.impactRate = Math.abs(baseImpact) * 0.2; // 20% per time unit
  } else {
    // Regular news applies more gradually
    newsItem.impactRate = Math.abs(baseImpact) * 0.1; // 10% per time unit
  }

  // Decay rates - how quickly the effect fades when news becomes inactive
  if (isBlackSwan) {
    // Black swan events have longer-lasting effects that fade slowly
    newsItem.decayRate = Math.abs(baseImpact) * 0.05; // 5% per time unit
  } else {
    // Regular news fades more quickly
    newsItem.decayRate = Math.abs(baseImpact) * 0.15; // 15% per time unit
  }

  return newsItem;
};

/**
 * Updates the applied impact for news based on time passed
 * @param newsItem - The news item to update
 * @param isActive - Whether the news is currently active
 * @returns The updated impact value
 */
export const updateNewsImpact = (
  newsItem: NewsItem,
  isActive: boolean
): number => {
  if (!newsItem.appliedImpact || !newsItem.targetImpact) {
    return 0; // No impact defined
  }

  let currentImpact = newsItem.appliedImpact;

  if (isActive) {
    // When active, gradually build up to target impact
    const impactRate =
      newsItem.impactRate || Math.abs(newsItem.targetImpact) * 0.1;
    const remainingImpact = newsItem.targetImpact - currentImpact;

    if (Math.abs(remainingImpact) < 0.01) {
      // We've reached the target impact
      currentImpact = newsItem.targetImpact;
    } else {
      // Apply a portion of the remaining impact
      currentImpact +=
        Math.sign(remainingImpact) *
        Math.min(impactRate, Math.abs(remainingImpact));
    }
  } else {
    // When inactive, gradually decay impact back to zero
    const decayRate = newsItem.decayRate || Math.abs(currentImpact) * 0.15;

    if (Math.abs(currentImpact) < 0.01) {
      // Impact has essentially faded away
      currentImpact = 0;
    } else {
      // Reduce impact by decay rate
      currentImpact -=
        Math.sign(currentImpact) * Math.min(decayRate, Math.abs(currentImpact));
    }
  }

  // Update the news item with the new impact value
  newsItem.appliedImpact = currentImpact;

  return currentImpact;
};

/**
 * Generates an aftershock news event based on a previous event
 * @param originalEvent - The original news event that triggers the aftershock
 * @param round - The current game round
 * @param assets - The list of available assets
 * @returns A new news item representing the aftershock
 */
export const generateAftershock = (
  originalEvent: NewsItem,
  round: number,
  assets: Asset[]
): NewsItem => {
  // Determine which assets will be affected by the aftershock
  // Usually a subset of the original event's impacted assets
  const impactedAssetCount = Math.max(
    1,
    Math.floor(originalEvent.impactedAssets.length * 0.7)
  );

  // Randomly select a subset of the original impacted assets
  const shuffledAssets = [...originalEvent.impactedAssets].sort(
    () => Math.random() - 0.5
  );
  const aftershockImpactedAssets = shuffledAssets.slice(0, impactedAssetCount);

  // Create a title and content for the aftershock
  let aftershockTitle, aftershockContent;

  if (originalEvent.sentiment === "positive") {
    aftershockTitle = `Aftermath: Markets Adjust to ${originalEvent.title
      .replace("BREAKING: ", "")
      .replace("HISTORIC: ", "")}`;
    aftershockContent = `Continued effects from recent ${originalEvent.title.toLowerCase()} lead to further market adjustments.`;
  } else {
    aftershockTitle = `Aftershock: ${originalEvent.title
      .replace("BREAKING: ", "")
      .replace("CRISIS: ", "")
      .replace("ALERT: ", "")} Continues`;
    aftershockContent = `Markets continue to react as the full impact of the ${originalEvent.title.toLowerCase()} unfolds.`;
  }

  // Aftershocks have reduced magnitude compared to original event
  const aftershockMagnitude = originalEvent.magnitude * 0.7;

  // Create the aftershock news item with the same sentiment type as the original
  const newsItem: NewsItem = {
    id: `aftershock-${originalEvent.id}-${round}-${Date.now()}`,
    title: aftershockTitle,
    content: aftershockContent,
    timestamp: Date.now(),
    source: "Market",
    sentiment: originalEvent.sentiment as
      | "positive"
      | "negative"
      | "neutral"
      | "mixed"
      | "humorous",
    magnitude: aftershockMagnitude,
    impactedAssets: aftershockImpactedAssets,
    isActive: true,
    // Aftershocks can also have aftershocks, but with diminishing probability
    aftershockProbability: (originalEvent.aftershockProbability || 0.5) * 0.5,
    aftershockDelay: originalEvent.aftershockDelay,
  };

  return newsItem;
};
