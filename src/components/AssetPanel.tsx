
import React, { useMemo } from 'react';
import type { Asset } from '../types/game';
import { formatCurrency, getPriceChangeColor } from '../utils/marketLogic';
import { Card, CardContent } from './ui/card';
import { ArrowUp, ArrowDown, TrendingUp, ArrowRight } from 'lucide-react';
import SparklineChart from './SparklineChart'; // Use the root SparklineChart component
import { Button } from './ui/button';
import { assetPriceHistory, generateEnhancedSparklineData } from '../utils/chartUtils';

interface AssetPanelProps {
  asset: Asset;
  onClick: () => void;
  priceHistory?: Array<{ value: number; timestamp?: number }>;
}

const AssetPanel: React.FC<AssetPanelProps> = ({ asset, onClick, priceHistory }) => {
  const priceChange = asset.price - asset.previousPrice;
  const priceChangePercent = (priceChange / asset.previousPrice) * 100;
  const priceChangeColor = getPriceChangeColor(priceChange);
  
  // Use stored price history data or generate some enhanced chart data if missing
  const sparklineData = useMemo(() => {
    if (assetPriceHistory[asset.id]?.data?.length > 1) {
      return assetPriceHistory[asset.id].data;
    }
    
    if (priceHistory && priceHistory.length > 1) {
      return priceHistory;
    }
    
    // If we don't have any real history, generate some visual data
    return generateEnhancedSparklineData({
      price: asset.price,
      previousPrice: asset.previousPrice,
      volatility: asset.volatility
    });
  }, [asset.id, asset.price, asset.previousPrice, asset.volatility, priceHistory]);
  
  const getVolatilityLevel = (volatility: number) => {
    if (volatility >= 0.7) return 'Very High';
    if (volatility >= 0.5) return 'High';
    if (volatility >= 0.3) return 'Medium';
    return 'Low';
  };

  const getAssetGradient = (color: string) => {
    switch (color) {
      case 'stock': 
        return 'bg-gradient-to-br from-blue-900/40 to-blue-900/10';
      case 'gold': 
        return 'bg-gradient-to-br from-amber-900/40 to-amber-900/10';
      case 'oil': 
        return 'bg-gradient-to-br from-gray-800/40 to-gray-800/10';
      case 'crypto': 
        return 'bg-gradient-to-br from-purple-900/40 to-purple-900/10';
      default: 
        return 'bg-gradient-dark';
    }
  };
  
  const getAssetBorderColor = (color: string) => {
    switch (color) {
      case 'stock': return 'border-blue-500';
      case 'gold': return 'border-amber-500';
      case 'oil': return 'border-gray-500';
      case 'crypto': return 'border-purple-500';
      default: return 'border-gray-700';
    }
  };

  const getAssetIconColor = (color: string) => {
    switch (color) {
      case 'stock': return 'text-blue-500';
      case 'gold': return 'text-amber-500';
      case 'oil': return 'text-gray-500';
      case 'crypto': return 'text-purple-500';
      default: return 'text-gray-500';
    }
  };
  
  return (
    <Card 
      className={`${getAssetGradient(asset.color)} ${getAssetBorderColor(asset.color)} 
              cursor-pointer transition-all hover:scale-[1.02] border border-opacity-60`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-lg">{asset.name}</h3>
          <div className="text-sm px-2 py-0.5 bg-dark rounded-md">{asset.ticker}</div>
        </div>
        
        <div className="mb-3">
          <div className="text-xl font-semibold">
            {formatCurrency(asset.price)}
          </div>
          <div className={`flex items-center text-sm ${priceChangeColor}`}>
            {priceChange > 0 ? 
              <ArrowUp size={16} className="mr-1" /> : 
              <ArrowDown size={16} className="mr-1" />
            }
            <span className={`${priceChange > 0 ? 'text-profit' : 'text-loss'} ${priceChange > 0 ? 'drop-shadow-[0_0_4px_rgba(16,185,129,0.3)]' : 'drop-shadow-[0_0_4px_rgba(239,68,68,0.3)]'}`}>
              {Math.abs(priceChangePercent).toFixed(2)}%
            </span>
          </div>
        </div>
        
        <div className="mb-2">
          <div className="text-xs text-neutral mb-1">24h Change</div>
          <SparklineChart 
            data={sparklineData}
            referenceValue={asset.previousPrice}
            areaFill={true}
            amplifyVisuals={true}
            height={40}
            assetType={asset.color}
            showTooltip={true}
          />
        </div>
        
        <div className="flex justify-between items-center mt-3">
          <div className={`flex items-center text-xs ${getAssetIconColor(asset.color)}`}>
            <TrendingUp size={14} className="mr-1" />
            <span>Volatility: {getVolatilityLevel(asset.volatility)}</span>
          </div>
          
          <Button 
            size="sm" 
            variant="secondary" 
            className="h-7 px-2 bg-panel-light hover:bg-panel"
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click
              onClick();
            }}
          >
            Trade <ArrowRight size={14} className="ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AssetPanel;
