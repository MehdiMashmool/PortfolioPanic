
import React, { useMemo } from 'react';
import type { Asset } from '../types/game';
import { formatCurrency, getPriceChangeColor } from '../utils/marketLogic';
import { Card, CardContent } from './ui/card';
import { ArrowUp, ArrowDown, TrendingUp, ArrowRight } from 'lucide-react';
import SparklineChart from './charts/SparklineChart';
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
    // First choice: use the asset's stored price history if it has enough points
    if (assetPriceHistory[asset.id]?.data?.length > 2) {
      return assetPriceHistory[asset.id].data;
    }
    
    // Second choice: use provided price history if it has enough points
    if (priceHistory && priceHistory.length > 2) {
      return priceHistory;
    }
    
    // If we don't have any real history, generate some visual data
    return generateEnhancedSparklineData({
      price: asset.price,
      previousPrice: asset.previousPrice,
      volatility: asset.volatility
    }, 25); // Generate 25 data points for a smoother graph
  }, [asset.id, asset.price, asset.previousPrice, asset.volatility, priceHistory]);
  
  const getVolatilityLevel = (volatility: number) => {
    if (volatility >= 0.7) return 'Very High';
    if (volatility >= 0.5) return 'High';
    if (volatility >= 0.3) return 'Medium';
    return 'Low';
  };

  const getAssetColor = (color: string) => {
    switch (color) {
      case 'stock': return 'TECH';
      case 'gold': return 'GOLD';
      case 'oil': return 'OIL';
      case 'crypto': return 'CRYP';
      default: return 'ASSET';
    }
  };
  
  const getAssetGradient = (color: string) => {
    switch (color) {
      case 'stock': 
        return 'bg-[#0c1322] border-[#1a2942]';
      case 'gold': 
        return 'bg-[#1a1505] border-[#332505]';
      case 'oil': 
        return 'bg-[#171717] border-[#2a2a2a]';
      case 'crypto': 
        return 'bg-[#1e0b29] border-[#3a1451]';
      default: 
        return 'bg-[#0c1322]';
    }
  };
  
  const getChartColor = (color: string) => {
    switch (color) {
      case 'stock': return '#3B82F6';
      case 'gold': return '#F59E0B';
      case 'oil': return '#6B7280';
      case 'crypto': return '#8B5CF6';
      default: return '#10B981';
    }
  };
  
  return (
    <Card 
      className={`${getAssetGradient(asset.color)}
              cursor-pointer transition-all hover:scale-[1.02] border`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-lg">{asset.name}</h3>
          <div className="text-xs px-2 py-0.5 bg-[#0d1424] rounded-md">{getAssetColor(asset.color)}</div>
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
            <span className={`${priceChange > 0 ? 'text-profit' : 'text-loss'}`}>
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
            color={getChartColor(asset.color)}
            showTooltip={false}
          />
        </div>
        
        <div className="flex justify-between items-center mt-3">
          <div className="flex items-center text-xs text-neutral">
            <TrendingUp size={14} className="mr-1" />
            <span>Volatility: {getVolatilityLevel(asset.volatility)}</span>
          </div>
          
          <Button 
            size="sm" 
            variant="secondary" 
            className="h-7 px-2 bg-[#1a2133] hover:bg-[#232b3d] text-white"
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
