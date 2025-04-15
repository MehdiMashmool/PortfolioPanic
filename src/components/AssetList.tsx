
import React, { useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import { Button } from './ui/button';
import AssetPanel from './AssetPanel';
import { ChevronRight } from 'lucide-react';
import { initAssetPriceHistory } from '../utils/chartUtils';

interface AssetListProps {
  onAssetClick: (id: string, name: string) => void;
}

const AssetList = ({ onAssetClick }: AssetListProps) => {
  const { state } = useGame();
  
  // Initialize asset price history on mount
  useEffect(() => {
    // Initialize price history for each asset only once when component mounts
    state.assets.forEach(asset => {
      initAssetPriceHistory(asset.id, asset.price);
    });
  }, []); // Empty dependency array ensures this only runs once on mount

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
          />
        ))}
      </div>
    </div>
  );
};

export default AssetList;
