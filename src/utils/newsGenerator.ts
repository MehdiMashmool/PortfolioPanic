import { Asset, NewsItem } from '../contexts/GameContext';

// Stock-specific news templates
const stockNewsTemplates = [
  {
    title: "Tech Breakthrough Announced",
    content: "A major technology breakthrough has been announced that could disrupt multiple industries.",
    sentiment: 'positive',
    magnitude: 0.4,
  },
  {
    title: "Corporate Earnings Disappoint",
    content: "Several major companies reported earnings below analyst expectations.",
    sentiment: 'negative',
    magnitude: 0.3,
  },
  {
    title: "New Consumer Product Launch",
    content: "A highly anticipated new consumer product is set to hit the markets.",
    sentiment: 'positive',
    magnitude: 0.25,
  },
  {
    title: "Regulatory Investigation",
    content: "Regulators have opened an investigation into industry practices.",
    sentiment: 'negative',
    magnitude: 0.35,
  }
];

// Gold-specific news templates
const goldNewsTemplates = [
  {
    title: "Inflation Concerns Rise",
    content: "Economic data suggests inflation may be higher than previously expected.",
    sentiment: 'positive',
    magnitude: 0.3,
  },
  {
    title: "Central Bank Sells Gold Reserves",
    content: "A major central bank has announced plans to sell significant gold reserves.",
    sentiment: 'negative',
    magnitude: 0.4,
  },
  {
    title: "Geopolitical Tensions Increase",
    content: "Rising global tensions have investors seeking safe-haven assets.",
    sentiment: 'positive',
    magnitude: 0.45,
  },
  {
    title: "Strong Dollar Impacts Gold",
    content: "The US dollar's strength puts pressure on gold prices.",
    sentiment: 'negative',
    magnitude: 0.25,
  }
];

// Oil-specific news templates
const oilNewsTemplates = [
  {
    title: "OPEC Announces Production Cuts",
    content: "Oil producing nations agree to reduce output to stabilize prices.",
    sentiment: 'positive',
    magnitude: 0.5,
  },
  {
    title: "New Oil Reserves Discovered",
    content: "Significant new oil reserves have been discovered, potentially increasing global supply.",
    sentiment: 'negative',
    magnitude: 0.3,
  },
  {
    title: "Geopolitical Crisis Threatens Supply",
    content: "Tensions in oil-producing regions threaten to disrupt global supply chains.",
    sentiment: 'positive',
    magnitude: 0.6,
  },
  {
    title: "Renewable Energy Breakthrough",
    content: "A major breakthrough in renewable energy technology may reduce oil demand.",
    sentiment: 'negative',
    magnitude: 0.35,
  }
];

// Crypto-specific news templates
const cryptoNewsTemplates = [
  {
    title: "Major Retailer Accepts Crypto",
    content: "A major global retailer has announced plans to accept cryptocurrency payments.",
    sentiment: 'positive',
    magnitude: 0.6,
  },
  {
    title: "Regulatory Crackdown on Crypto",
    content: "Government regulators announce new restrictions on cryptocurrency trading.",
    sentiment: 'negative',
    magnitude: 0.7,
  },
  {
    title: "Institutional Investment in Crypto",
    content: "Large financial institutions are increasing their cryptocurrency holdings.",
    sentiment: 'positive',
    magnitude: 0.5,
  },
  {
    title: "Major Security Breach",
    content: "A popular cryptocurrency exchange reports a significant security breach.",
    sentiment: 'negative',
    magnitude: 0.8,
  }
];

// General market news templates
const marketNewsTemplates = [
  {
    title: "Interest Rates Changed",
    content: "Central bank announces unexpected changes to interest rates.",
    sentiment: 'negative',
    magnitude: 0.4,
  },
  {
    title: "Economic Growth Surges",
    content: "New economic data shows stronger than expected growth figures.",
    sentiment: 'positive',
    magnitude: 0.3,
  },
  {
    title: "Trade Agreement Reached",
    content: "Major economies have reached a new trade agreement.",
    sentiment: 'positive',
    magnitude: 0.35,
  },
  {
    title: "Unemployment Rises",
    content: "Unemployment figures are higher than analysts predicted.",
    sentiment: 'negative',
    magnitude: 0.3,
  }
];

// Crisis news templates - these have major market impact
const crisisNewsTemplates = [
  {
    title: "MARKET CRASH: Global Sell-off",
    content: "Markets are experiencing a major sell-off across all sectors. Investors are panic selling.",
    sentiment: 'negative',
    magnitude: 0.9,
  },
  {
    title: "FINANCIAL CRISIS: Bank Failures",
    content: "Multiple major financial institutions are reporting insolvency issues.",
    sentiment: 'negative',
    magnitude: 0.85,
  },
  {
    title: "GEOPOLITICAL CRISIS: Conflict Erupts",
    content: "Armed conflict has broken out in a geopolitically sensitive region.",
    sentiment: 'negative',
    magnitude: 0.8,
  }
];

// Generate news based on available assets and current game round
export const generateMarketNews = (assets: Asset[], round: number): NewsItem => {
  // Determine which news type to generate
  let newsPool;
  let impactedAssets: string[] = [];
  
  // 5% chance of generating crisis news in later rounds
  if (round > 3 && Math.random() < 0.05) {
    newsPool = crisisNewsTemplates;
    // Crisis news impacts all assets
    impactedAssets = assets.map(asset => asset.id);
  } else {
    // Otherwise select a specific asset or general market news
    const newsType = Math.random();
    
    if (newsType < 0.6) { // 60% chance of asset-specific news
      // Select a random asset
      const asset = assets[Math.floor(Math.random() * assets.length)];
      impactedAssets = [asset.id];
      
      // Choose appropriate news pool based on asset type
      switch (asset.id) {
        case 'stock-tech':
          newsPool = stockNewsTemplates;
          break;
        case 'gold':
          newsPool = goldNewsTemplates;
          break;
        case 'oil':
          newsPool = oilNewsTemplates;
          break;
        case 'crypto':
          newsPool = cryptoNewsTemplates;
          break;
        default:
          newsPool = marketNewsTemplates;
      }
    } else { // 40% chance of general market news
      newsPool = marketNewsTemplates;
      
      // General news impacts a random subset of assets (1 to all)
      const numAssetsImpacted = Math.floor(Math.random() * assets.length) + 1;
      const shuffledAssets = [...assets].sort(() => 0.5 - Math.random());
      impactedAssets = shuffledAssets.slice(0, numAssetsImpacted).map(a => a.id);
    }
  }
  
  // Select a random news template from the pool
  const newsTemplate = newsPool[Math.floor(Math.random() * newsPool.length)];
  
  // Create the news item
  const newsItem: NewsItem = {
    id: `news-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    title: newsTemplate.title,
    content: newsTemplate.content,
    impactedAssets,
    sentiment: newsTemplate.sentiment as 'positive' | 'negative' | 'neutral',
    magnitude: newsTemplate.magnitude,
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
