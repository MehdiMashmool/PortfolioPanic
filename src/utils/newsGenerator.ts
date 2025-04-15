
import type { Asset, NewsItem } from '../types/game';

// Market News Events Database
const marketNewsEvents = [
  // Economic News
  {
    id: "gdp-growth-exceeds",
    title: "GDP Growth Exceeds Expectations",
    content: "Quarterly GDP growth comes in at 4.2%, well above the 3.1% forecast.",
    sentiment: 'positive',
    magnitude: 0.5,
    effects: {
      stock: { change: 2.5, duration: 45 },
      gold: { change: -1.2, duration: 30 },
      oil: { change: 1.8, duration: 60 },
      crypto: { change: [1.0, -0.5], duration: [30, 20] }
    }
  },
  {
    id: "unemployment-low",
    title: "Unemployment Rate Hits Multi-Year Low",
    content: "Labor market strengthens as unemployment falls to 3.4%, lowest in 50 years.",
    sentiment: 'positive',
    magnitude: 0.6,
    effects: {
      stock: { change: [1.7, 0.8], duration: [30, 60] },
      gold: { change: -0.9, duration: 40 },
      oil: { change: 1.3, duration: 35 },
      crypto: { change: [-0.5, 1.2], duration: [15, 45] }
    }
  },
  {
    id: "manufacturing-contracts",
    title: "Manufacturing PMI Contracts",
    content: "Manufacturing Purchasing Managers' Index falls below 50, indicating sector contraction.",
    sentiment: 'negative',
    magnitude: 0.5,
    effects: {
      stock: { change: -1.5, duration: 40 },
      gold: { change: 1.1, duration: 30 },
      oil: { change: -2.3, duration: 50 },
      crypto: { change: [-0.7, 0], duration: [25, 0] }
    }
  },
  {
    id: "inflation-surges",
    title: "Inflation Surges Past Expectations",
    content: "Consumer Price Index rises 6.8% year-over-year, exceeding forecasts of 6.2%.",
    sentiment: 'negative',
    magnitude: 0.7,
    effects: {
      stock: { change: [-2.0, 0.7], duration: [30, 30] },
      gold: { change: 2.4, duration: 60 },
      oil: { change: 1.7, duration: 45 },
      crypto: { change: [-1.5, 3.0], duration: [20, 40] }
    }
  },
  {
    id: "trade-deficit-widens",
    title: "Trade Deficit Widens Unexpectedly",
    content: "Monthly trade deficit increases to $78.2 billion, highest in three years.",
    sentiment: 'negative',
    magnitude: 0.4,
    effects: {
      stock: { change: -0.8, duration: 30 },
      gold: { change: 0.6, duration: 25 },
      oil: { change: -1.2, duration: 40 },
      crypto: { change: [0, -0.5], duration: [0, 30] }
    }
  },

  // Central Bank News
  {
    id: "fed-hikes-rates",
    title: "Federal Reserve Hikes Interest Rates",
    content: "Fed increases rates by 50 basis points, signals additional hikes ahead.",
    sentiment: 'negative',
    magnitude: 0.8,
    effects: {
      stock: { change: -3.2, duration: 60 },
      gold: { change: [-1.5, 2.1], duration: [20, 50] },
      oil: { change: -1.8, duration: 45 },
      crypto: { change: -4.5, duration: 75 }
    }
  },
  {
    id: "quantitative-easing",
    title: "Central Bank Announces Quantitative Easing",
    content: "Central bank launches new $500 billion asset purchase program.",
    sentiment: 'positive',
    magnitude: 0.8,
    effects: {
      stock: { change: 3.5, duration: 60 },
      gold: { change: 2.2, duration: 50 },
      oil: { change: 1.9, duration: 40 },
      crypto: { change: [5.0, 2.0], duration: [70, 30] }
    }
  },
  {
    id: "rate-cut",
    title: "Unexpected Interest Rate Cut",
    content: "Central bank surprises markets with emergency 25 basis point rate cut.",
    sentiment: 'positive',
    magnitude: 0.7,
    effects: {
      stock: { change: [-1.0, 3.5], duration: [20, 40] },
      gold: { change: 1.7, duration: 45 },
      oil: { change: 2.3, duration: 50 },
      crypto: { change: 4.2, duration: 65 }
    }
  },
  {
    id: "hawkish-policy",
    title: "Central Bank Signals Hawkish Policy Shift",
    content: "Meeting minutes reveal board members favor accelerating monetary tightening.",
    sentiment: 'negative',
    magnitude: 0.7,
    effects: {
      stock: { change: -2.7, duration: 55 },
      gold: { change: [0.8, -1.5], duration: [25, 35] },
      oil: { change: -1.4, duration: 40 },
      crypto: { change: -3.3, duration: 60 }
    }
  },
  {
    id: "reserve-requirements-lowered",
    title: "Reserve Requirement Ratios Lowered",
    content: "Central bank reduces banking reserve requirements to boost lending.",
    sentiment: 'positive',
    magnitude: 0.5,
    effects: {
      stock: { change: 1.9, duration: 45 },
      gold: { change: -0.8, duration: 30 },
      oil: { change: 1.1, duration: 35 },
      crypto: { change: 2.5, duration: 50 }
    }
  },

  // Geopolitical Events
  {
    id: "military-conflict",
    title: "Military Conflict Erupts in Oil-Producing Region",
    content: "Armed conflict breaks out in key oil-producing country, threatening global supply.",
    sentiment: 'negative',
    magnitude: 0.9,
    effects: {
      stock: { change: -1.7, duration: 40 },
      gold: { change: 3.2, duration: 60 },
      oil: { change: [7.5, 5.2], duration: [30, 30] },
      crypto: { change: [-2.0, 1.5], duration: [25, 35] }
    }
  },
  {
    id: "trade-agreement",
    title: "Major Trade Agreement Announced",
    content: "Countries representing 40% of global GDP sign comprehensive trade pact.",
    sentiment: 'positive',
    magnitude: 0.6,
    effects: {
      stock: { change: 2.8, duration: 55 },
      gold: { change: -1.3, duration: 40 },
      oil: { change: 1.6, duration: 45 },
      crypto: { change: [1.0, 1.2], duration: [30, 60] }
    }
  },
  {
    id: "political-instability",
    title: "Political Instability in Manufacturing Hub",
    content: "Government collapses in key manufacturing nation, disrupting global supply chains.",
    sentiment: 'negative',
    magnitude: 0.7,
    effects: {
      stock: { change: [-2.5, -1.0], duration: [50, 120] },
      gold: { change: 1.9, duration: 45 },
      oil: { change: 0.8, duration: 30 },
      crypto: { change: [-1.5, 2.0], duration: [40, 60] }
    }
  },
  {
    id: "sanctions",
    title: "Sanctions Imposed on Major Economy",
    content: "Economic sanctions target world's 5th largest economy over policy disputes.",
    sentiment: 'negative',
    magnitude: 0.8,
    effects: {
      stock: { change: -1.5, duration: 45 },
      gold: { change: 2.4, duration: 55 },
      oil: { change: [3.5, -2.0, 1.5], duration: [30, 30, 30] },
      crypto: { change: [4.0, 2.5], duration: [30, 40] }
    }
  },
  {
    id: "shipping-blocked",
    title: "Maritime Shipping Route Blocked",
    content: "Major shipping channel blocked by stranded vessel, disrupting global trade.",
    sentiment: 'negative',
    magnitude: 0.6,
    effects: {
      stock: { change: [-1.2, -0.8], duration: [35, 90] },
      gold: { change: 0.7, duration: 30 },
      oil: { change: 3.1, duration: 60 },
      crypto: { change: [0, 0.9], duration: [0, 80] }
    }
  },

  // Technology & Innovation
  {
    id: "ai-breakthrough",
    title: "Revolutionary AI Breakthrough Announced",
    content: "Tech company unveils AI model with unprecedented capabilities, transforming industry outlook.",
    sentiment: 'positive',
    magnitude: 0.8,
    effects: {
      stock: { change: [4.5, 2.0], duration: [30, 60] },
      gold: { change: -0.7, duration: 25 },
      oil: { change: -0.5, duration: 20 },
      crypto: { change: [2.0, 3.5], duration: [40, 50] }
    }
  },
  {
    id: "quantum-milestone",
    title: "Quantum Computing Milestone Achieved",
    content: "Research team demonstrates quantum advantage in real-world application.",
    sentiment: 'positive',
    magnitude: 0.7,
    effects: {
      stock: { change: 3.3, duration: 55 },
      gold: { change: [0, -0.6], duration: [0, 60] },
      oil: { change: 0, duration: 0 },
      crypto: { change: [-2.5, 3.5], duration: [25, 60] }
    }
  },
  {
    id: "cyber-breach",
    title: "Major Cybersecurity Breach Revealed",
    content: "Widespread security vulnerability affects millions of devices globally.",
    sentiment: 'negative',
    magnitude: 0.8,
    effects: {
      stock: { change: -3.8, duration: 60 },
      gold: { change: 1.0, duration: 35 },
      oil: { change: -0.4, duration: 20 },
      crypto: { change: [-5.0, 2.0], duration: [40, 50] }
    }
  },
  {
    id: "renewable-breakthrough",
    title: "Renewable Energy Efficiency Breakthrough",
    content: "New solar panel technology achieves 40% efficiency, double the current standard.",
    sentiment: 'positive',
    magnitude: 0.6,
    effects: {
      stock: { change: 2.5, duration: 50 },
      gold: { change: -0.5, duration: 25 },
      oil: { change: [-2.8, -1.5], duration: [60, 120] },
      crypto: { change: 1.2, duration: 35 }
    }
  },
  {
    id: "tech-antitrust",
    title: "Major Tech Antitrust Investigation",
    content: "Regulators launch comprehensive investigation into tech giants' market practices.",
    sentiment: 'negative',
    magnitude: 0.7,
    effects: {
      stock: { change: -3.5, duration: 65 },
      gold: { change: 0.6, duration: 30 },
      oil: { change: 0, duration: 0 },
      crypto: { change: [2.0, -1.0], duration: [30, 30] }
    }
  },

  // Commodity & Energy News
  {
    id: "opec-production-cut",
    title: "OPEC Announces Oil Production Cut",
    content: "OPEC slashes production by 1 million barrels/day.",
    sentiment: 'positive',
    magnitude: 0.7,
    effects: {
      stock: { change: -0.5, duration: 20 },
      gold: { change: 1.0, duration: 30 },
      oil: { change: [5.0, 3.0], duration: [60, 60] },
      crypto: { change: 0, duration: 0 }
    }
  },
  {
    id: "oil-discovery",
    title: "Massive Oil Discovery",
    content: "Largest oil field discovered in a decade.",
    sentiment: 'positive',
    magnitude: 0.6,
    effects: {
      stock: { change: 0.5, duration: 25 },
      gold: { change: -0.7, duration: 30 },
      oil: { change: -4.5, duration: 70 },
      crypto: { change: 0, duration: 0 }
    }
  },

  // Currency & FX News
  {
    id: "usd-strengthens",
    title: "USD Strengthens Sharply",
    content: "US Dollar Index surges on risk-off sentiment.",
    sentiment: 'negative',
    magnitude: 0.6,
    effects: {
      stock: { change: -1.5, duration: 40 },
      gold: { change: -1.2, duration: 35 },
      oil: { change: -0.8, duration: 30 },
      crypto: { change: -2.0, duration: 50 }
    }
  },
  {
    id: "crypto-legal-tender",
    title: "Crypto-Friendly Currency Policy",
    content: "Nation legalizes Bitcoin as currency.",
    sentiment: 'positive',
    magnitude: 0.8,
    effects: {
      stock: { change: 0.7, duration: 25 },
      gold: { change: -0.4, duration: 20 },
      oil: { change: 0, duration: 0 },
      crypto: { change: 6.0, duration: 70 }
    }
  },

  // Regulatory & Policy Changes
  {
    id: "crypto-etf",
    title: "Crypto ETF Approved",
    content: "SEC approves first spot Bitcoin ETF.",
    sentiment: 'positive',
    magnitude: 0.9,
    effects: {
      stock: { change: 1.0, duration: 30 },
      gold: { change: -0.4, duration: 20 },
      oil: { change: 0, duration: 0 },
      crypto: { change: 8.0, duration: 80 }
    }
  },

  // Social Media & Meme News
  {
    id: "meme-coin-influencer",
    title: "Influencer Endorses Meme Coin",
    content: "Global influencer posts viral video hyping up meme cryptocurrency.",
    sentiment: 'positive',
    magnitude: 0.7,
    effects: {
      stock: { change: 0, duration: 0 },
      gold: { change: 0, duration: 0 },
      oil: { change: 0, duration: 0 },
      crypto: { change: [9.0, -3.0], duration: [90, 45] }
    }
  },

  // Environmental & ESG Events
  {
    id: "climate-treaty",
    title: "Global Climate Treaty Signed",
    content: "Nations agree to carbon reduction targets by 2030.",
    sentiment: 'positive',
    magnitude: 0.6,
    effects: {
      stock: { change: 1.2, duration: 30 },
      gold: { change: 0.5, duration: 25 },
      oil: { change: -3.5, duration: 60 },
      crypto: { change: -0.7, duration: 35 }
    }
  },

  // Crypto-Specific News
  {
    id: "exchange-hacked",
    title: "Major Exchange Hacked",
    content: "$500M stolen in latest crypto exchange security breach.",
    sentiment: 'negative',
    magnitude: 0.9,
    effects: {
      stock: { change: -0.5, duration: 20 },
      gold: { change: 0.7, duration: 30 },
      oil: { change: 0, duration: 0 },
      crypto: { change: -6.5, duration: 80 }
    }
  },
  {
    id: "stablecoin-depegs",
    title: "Stablecoin Loses Peg",
    content: "Top stablecoin depegs from USD, causing panic.",
    sentiment: 'negative',
    magnitude: 0.9,
    effects: {
      stock: { change: -0.6, duration: 25 },
      gold: { change: 0.8, duration: 30 },
      oil: { change: 0, duration: 0 },
      crypto: { change: -8.0, duration: 70 }
    }
  },

  // Black Swan Events
  {
    id: "ai-flash-crash",
    title: "AI Mistake Causes Market Flash Crash",
    content: "Trading AI error triggers massive short-term sell-off.",
    sentiment: 'negative',
    magnitude: 0.95,
    effects: {
      stock: { change: [-6.5, 3.5], duration: [30, 60] },
      gold: { change: 1.0, duration: 45 },
      oil: { change: -2.0, duration: 40 },
      crypto: { change: -4.0, duration: 30 }
    }
  },
  {
    id: "cyberwar",
    title: "Global Cyberwar Breaks Out",
    content: "Nation-states launch coordinated cyberattacks on infrastructure.",
    sentiment: 'negative',
    magnitude: 0.95,
    effects: {
      stock: { change: -6.0, duration: 80 },
      gold: { change: 3.5, duration: 60 },
      oil: { change: 1.2, duration: 45 },
      crypto: { change: -2.5, duration: 50 }
    }
  }
];

// Get news templates based on asset type
const getAssetSpecificTemplates = (assetId: string) => {
  // Match asset with appropriate templates based on id
  if (assetId.includes('stock')) {
    return marketNewsEvents.filter(event => 
      event.effects.stock && Math.abs(Array.isArray(event.effects.stock.change) 
        ? event.effects.stock.change[0] 
        : event.effects.stock.change) >= 1.0
    );
  } else if (assetId.includes('gold')) {
    return marketNewsEvents.filter(event => 
      event.effects.gold && Math.abs(Array.isArray(event.effects.gold.change) 
        ? event.effects.gold.change[0] 
        : event.effects.gold.change) >= 0.7
    );
  } else if (assetId.includes('oil')) {
    return marketNewsEvents.filter(event => 
      event.effects.oil && Math.abs(Array.isArray(event.effects.oil.change) 
        ? event.effects.oil.change[0] 
        : event.effects.oil.change) >= 1.0
    );
  } else if (assetId.includes('crypto')) {
    return marketNewsEvents.filter(event => 
      event.effects.crypto && Math.abs(Array.isArray(event.effects.crypto.change) 
        ? event.effects.crypto.change[0] 
        : event.effects.crypto.change) >= 1.0
    );
  }
  
  // Return general market news for unknown asset types
  return marketNewsEvents.filter(event => event.magnitude < 0.7);
};

// Get general market news that affects multiple assets
const getGeneralMarketNews = () => {
  return marketNewsEvents.filter(event => {
    // Count how many asset types this event affects significantly
    let affectedAssets = 0;
    if (event.effects.stock && Math.abs(Array.isArray(event.effects.stock.change) 
      ? event.effects.stock.change[0] 
      : event.effects.stock.change) > 0.5) affectedAssets++;
      
    if (event.effects.gold && Math.abs(Array.isArray(event.effects.gold.change) 
      ? event.effects.gold.change[0] 
      : event.effects.gold.change) > 0.5) affectedAssets++;
      
    if (event.effects.oil && Math.abs(Array.isArray(event.effects.oil.change) 
      ? event.effects.oil.change[0] 
      : event.effects.oil.change) > 0.5) affectedAssets++;
      
    if (event.effects.crypto && Math.abs(Array.isArray(event.effects.crypto.change) 
      ? event.effects.crypto.change[0] 
      : event.effects.crypto.change) > 0.5) affectedAssets++;
    
    return affectedAssets >= 2;
  });
};

// Get crisis events (high magnitude events)
const getCrisisEvents = () => {
  return marketNewsEvents.filter(event => event.magnitude >= 0.9);
};

// Generate news based on available assets and current game round
export const generateMarketNews = (assets: Asset[], round: number): NewsItem => {
  // Determine which news type to generate
  let selectedEvent;
  let impactedAssets: string[] = [];
  
  // 5% chance of generating crisis news in later rounds
  if (round > 3 && Math.random() < 0.05) {
    const crisisEvents = getCrisisEvents();
    selectedEvent = crisisEvents[Math.floor(Math.random() * crisisEvents.length)];
    // Crisis news impacts all assets
    impactedAssets = assets.map(asset => asset.id);
  } else {
    // Otherwise select a specific asset or general market news
    const newsType = Math.random();
    
    if (newsType < 0.6) { // 60% chance of asset-specific news
      // Select a random asset
      const asset = assets[Math.floor(Math.random() * assets.length)];
      impactedAssets = [asset.id];
      
      // Get news specific to this asset type
      const assetSpecificTemplates = getAssetSpecificTemplates(asset.id);
      
      if (assetSpecificTemplates.length > 0) {
        selectedEvent = assetSpecificTemplates[Math.floor(Math.random() * assetSpecificTemplates.length)];
      } else {
        // Fallback to general market news
        const generalTemplates = getGeneralMarketNews();
        selectedEvent = generalTemplates[Math.floor(Math.random() * generalTemplates.length)];
      }
    } else { // 40% chance of general market news
      const generalTemplates = getGeneralMarketNews();
      selectedEvent = generalTemplates[Math.floor(Math.random() * generalTemplates.length)];
      
      // General news impacts a random subset of assets (1 to all)
      const numAssetsImpacted = Math.floor(Math.random() * assets.length) + 1;
      const shuffledAssets = [...assets].sort(() => 0.5 - Math.random());
      impactedAssets = shuffledAssets.slice(0, numAssetsImpacted).map(a => a.id);
    }
  }

  // If no event was selected (shouldn't happen), use a placeholder
  if (!selectedEvent) {
    selectedEvent = {
      title: "Market Update",
      content: "Markets are experiencing normal fluctuations today.",
      sentiment: 'neutral',
      magnitude: 0.1
    } as any;
  }
  
  // Create the news item
  const newsItem: NewsItem = {
    id: `news-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    title: selectedEvent.title,
    content: selectedEvent.content,
    impactedAssets,
    sentiment: selectedEvent.sentiment as 'positive' | 'negative' | 'neutral',
    magnitude: selectedEvent.magnitude,
    timestamp: Date.now(),
    isActive: true
  };
  
  return newsItem;
};

// Function to get CSS class based on news sentiment
export const getNewsSentimentClass = (sentiment: string): string => {
  switch (sentiment) {
    case 'positive':
      return 'border-profit';
    case 'negative':
      return 'border-loss';
    default:
      return 'border-neutral';
  }
};
