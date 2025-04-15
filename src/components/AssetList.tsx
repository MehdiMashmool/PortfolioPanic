
import React from 'react';
import { useGame } from '../contexts/GameContext';
import { Button } from './ui/button';
import AssetPanel from './AssetPanel';
import { ChevronRight } from 'lucide-react';

interface AssetListProps {
  onAssetClick: (id: string, name: string) => void;
}

const AssetList = ({ onAssetClick }: AssetListProps) => {
  const { state } = useGame();

  // Generate price history data with realistic fluctuations
  const generatePriceHistory = (asset: any) => {
    const points = 20; // Number of data points
    const basePrice = asset.price;
    const previousPrice = asset.previousPrice;
    const volatility = asset.volatility;
    
    // Start and end with the actual prices for accuracy
    const history = [{ value: previousPrice }];

    // Generate intermediate points with appropriate volatility - amplified for better visual effect
    for (let i = 1; i < points - 1; i++) {
      // Calculate a position factor (0-1) representing where in the sequence we are
      const position = i / (points - 1);
      
      // Start trending toward the final price after the midpoint
      const trendFactor = position > 0.5 ? (position - 0.5) * 2 : 0;
      
      // Base the intermediate value on a weighted average of start and end prices
      const baseValue = previousPrice * (1 - position) + basePrice * position;
      
      // Apply volatility - higher volatility = more dramatic swings
      // Scaled volatility for better visual effect - amplifying by 1.5x
      const deviation = (Math.random() - 0.5) * volatility * basePrice * 0.6;
      
      // Combine trend and volatility with a weighted random walk
      const value = baseValue + deviation * (1 - trendFactor);
      
      history.push({ value });
    }

    // Ensure the last point is exactly the current price
    history.push({ value: basePrice });
    
    return history;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-white flex items-center">
          Assets
          <span className="ml-2 text-sm text-gray-400 font-normal">
            ({state.assets.length})
          </span>
        </h2>
        <Button variant="ghost" className="text-sm text-gray-400 group">
          See All
          <ChevronRight size={16} className="ml-1 group-hover:translate-x-0.5 transition-transform" />
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {state.assets.map(asset => (
          <AssetPanel 
            key={asset.id}
            asset={asset}
            onClick={() => onAssetClick(asset.id, asset.name)}
            priceHistory={generatePriceHistory(asset)}
          />
        ))}
      </div>
    </div>
  );
};

export default AssetList;
