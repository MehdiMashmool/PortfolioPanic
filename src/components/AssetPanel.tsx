
import React from 'react';
import { Asset } from '../contexts/GameContext';
import { formatCurrency, getPriceChangeColor } from '../utils/marketLogic';
import { Card, CardContent } from './ui/card';
import { ArrowUp, ArrowDown, TrendingUp } from 'lucide-react';

interface AssetPanelProps {
  asset: Asset;
  onClick: () => void;
}

const AssetPanel: React.FC<AssetPanelProps> = ({ asset, onClick }) => {
  const priceChange = asset.price - asset.previousPrice;
  const priceChangePercent = (priceChange / asset.previousPrice) * 100;
  const priceChangeColor = getPriceChangeColor(priceChange);
  
  const getVolatilityLevel = (volatility: number) => {
    if (volatility >= 0.7) return 'Very High';
    if (volatility >= 0.5) return 'High';
    if (volatility >= 0.3) return 'Medium';
    return 'Low';
  };
  
  return (
    <Card 
      className={`bg-${asset.color === 'stock' ? 'blue-900/20' : asset.color === 'gold' ? 'yellow-900/20' : asset.color === 'oil' ? 'gray-900/20' : 'purple-900/20'} 
              border-${asset.color} hover:border-${asset.color === 'stock' ? 'stock' : asset.color === 'gold' ? 'gold' : asset.color === 'oil' ? 'oil' : 'crypto'} 
              cursor-pointer transition-all hover:scale-[1.02]`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-lg">{asset.name}</h3>
          <div className="text-sm bg-dark px-2 rounded-md">{asset.ticker}</div>
        </div>
        
        <div className="mb-3">
          <div className="text-xl font-semibold">
            {formatCurrency(asset.price)}
          </div>
          <div className={`flex items-center text-sm ${priceChangeColor}`}>
            {priceChange > 0 ? <ArrowUp size={16} className="mr-1" /> : <ArrowDown size={16} className="mr-1" />}
            {Math.abs(priceChangePercent).toFixed(2)}%
          </div>
        </div>
        
        <div className="flex justify-between text-xs text-neutral">
          <div className="flex items-center">
            <TrendingUp size={14} className="mr-1" />
            <span>Volatility: {getVolatilityLevel(asset.volatility)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AssetPanel;
