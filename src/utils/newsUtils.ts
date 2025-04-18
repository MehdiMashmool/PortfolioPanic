import type { Asset, NewsItem } from '../types/game';

// Map an asset ID to its ticker symbol
const getTickerFromAssetId = (assetId: string): string | undefined => {
  const assetMap: Record<string, string> = {
    'stock-tech': 'TECH',
    'stock-cybersec': 'CYSC',
    'stock-energy': 'ENRG',
    'stock-finance': 'FINX',
    'stock-shipping': 'SHIP',
    'stock-trade': 'TRDE',
    'stock-healthcare': 'HEAL',
    'commodity-gold': 'GOLD',
    'commodity-oil': 'OIL',
    'commodity-natgas': 'NGAS',
    'commodity-silver': 'SLVR',
    'commodity-wheat': 'WHET',
    'commodity-corn': 'CORN',
    'commodity-copper': 'COPR',
    'commodity-rare': 'RARE',
    'crypto-btc': 'BTC',
    'crypto-eth': 'ETH',
    'crypto-sol': 'SOL',
    'crypto-stable': 'STBL'
  };

  return assetMap[assetId];
};

// Get the effect a specific news event has on a specific asset
export const applyNewsToAsset = (assetId: string, newsEvent: any, asset?: Asset, marketHealth = 100): number => {
  if (!newsEvent || !assetId) {
    return 0; // Return zero effect if no valid asset or event
  }
  
  // Determine the base impact
  let baseImpact = 0;
  
  // If this news has a specific effect defined for this asset, use it directly
  if (newsEvent.specificAssets && newsEvent.specificAssets[assetId] !== undefined) {
    baseImpact = newsEvent.specificAssets[assetId];
  } else {
    // Check for ticker-based effects
    const ticker = getTickerFromAssetId(assetId);
    if (ticker && newsEvent.effects && newsEvent.effects[ticker] !== undefined) {
      baseImpact = newsEvent.effects[ticker].change;
    } else {
      // Otherwise determine effect based on asset category
      const assetCategory = assetId.split('-')[0]; // 'stock', 'commodity', or 'crypto'
      
      if (newsEvent.effects && newsEvent.effects[assetCategory]) {
        const categoryEffect = newsEvent.effects[assetCategory];
        if (Array.isArray(categoryEffect.change)) {
          // If it's an array, randomly pick one of the effects
          const effectIndex = Math.floor(Math.random() * categoryEffect.change.length);
          baseImpact = categoryEffect.change[effectIndex];
        } else {
          baseImpact = categoryEffect.change;
        }
      } else {
        // Default minimal impact if no relevant effect defined
        baseImpact = (Math.random() - 0.5) * 0.2;
      }
    }
  }

  // Feature 1: Volatility-Based Impact Scaling
  // Scale the impact based on the asset's volatility if provided
  let actualImpact = baseImpact;
  if (asset && asset.volatility) {
    actualImpact = baseImpact * (1 + asset.volatility);
  }
  
  // Feature 2: Market Health Modifiers
  // Stronger negative impact during bear markets, stronger positive impact during bull markets
  const isNegativeImpact = actualImpact < 0;
  const isPositiveImpact = actualImpact > 0;
  
  // Market health below 50 indicates bear market, above 50 indicates bull market
  const isBearMarket = marketHealth < 50;
  const isBullMarket = marketHealth > 50;
  
  if (isNegativeImpact && isBearMarket) {
    // Negative news has stronger impact in bear markets
    actualImpact *= 1.5;
  } else if (isPositiveImpact && isBullMarket) {
    // Positive news has stronger impact in bull markets
    actualImpact *= 1.3;
  }
  
  return actualImpact;
};

// Helper function to get news sentiment class for UI
export const getNewsSentimentClass = (sentiment: string): string => {
  switch (sentiment) {
    case 'positive':
      return 'border-profit';
    case 'negative':
      return 'border-loss';
    case 'neutral':
    case 'mixed':
    case 'humorous':
    default:
      return 'border-neutral';
  }
};

// Get the duration of effect for a news event on a specific asset
export const getNewsDuration = (assetId: string, newsEvent: any): number => {
  if (!newsEvent || !assetId) {
    return 30; // Default duration if no valid asset or event
  }
  
  // Check for ticker-based duration
  const ticker = getTickerFromAssetId(assetId);
  if (ticker && newsEvent.effects && newsEvent.effects[ticker] !== undefined) {
    return newsEvent.effects[ticker].duration;
  }
  
  const assetCategory = assetId.split('-')[0]; // 'stock', 'commodity', or 'crypto'
  
  if (newsEvent.effects && newsEvent.effects[assetCategory]) {
    const categoryEffect = newsEvent.effects[assetCategory];
    if (Array.isArray(categoryEffect.duration)) {
      // If it's an array, randomly pick one of the durations
      const durationIndex = Math.floor(Math.random() * categoryEffect.duration.length);
      return categoryEffect.duration[durationIndex];
    } else {
      return categoryEffect.duration;
    }
  }
  
  // Default duration if not specified
  return 30;
};

// Get all assets that are impacted by this news, even if not explicitly listed
export const getImplicitlyImpactedAssets = (newsItem: NewsItem, allAssets: Asset[]): string[] => {
  if (!newsItem || !allAssets || allAssets.length === 0 || !newsItem.impactedAssets) {
    return [];
  }
  
  // Start with explicitly impacted assets
  const impactedAssets = [...newsItem.impactedAssets];
  
  // For specific categories of news, add related assets with reduced impact
  // For example, if a tech stock is impacted, other tech stocks might be impacted too
  
  // Get categories of impacted assets
  const impactedCategories = new Set<string>();
  const impactedSubtypes = new Set<string>();
  
  newsItem.impactedAssets.forEach(assetId => {
    if (!assetId) return;
    
    const parts = assetId.split('-');
    if (parts.length >= 2) {
      const [category, subtype] = parts;
      impactedCategories.add(category);
      impactedSubtypes.add(subtype);
    }
  });
  
  // Find similar assets that might be indirectly affected
  allAssets.forEach(asset => {
    if (!asset || !asset.id || impactedAssets.includes(asset.id)) {
      return;
    }
    
    const parts = asset.id.split('-');
    if (parts.length < 2) {
      return;
    }
    
    const [category, subtype] = parts;
    
    // If the news affects the same category and subtype, it likely affects this asset too
    if (impactedSubtypes.has(subtype) && newsItem.magnitude > 0.6) {
      impactedAssets.push(asset.id);
    }
    // If it's a high magnitude news and affects the same category, add with lower probability
    else if (impactedCategories.has(category) && newsItem.magnitude > 0.8 && Math.random() < 0.3) {
      impactedAssets.push(asset.id);
    }
  });
  
  return impactedAssets;
}; 