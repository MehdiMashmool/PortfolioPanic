
import React from 'react';
import { useGame } from '../contexts/GameContext';
import { Button } from './ui/button';
import AssetPanel from './AssetPanel';

interface AssetListProps {
  onAssetClick: (id: string, name: string) => void;
}

const AssetList = ({ onAssetClick }: AssetListProps) => {
  const { state } = useGame();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Assets
        </h2>
        <Button variant="ghost" className="text-sm text-gray-400">See All</Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {state.assets.map(asset => (
          <AssetPanel 
            key={asset.id}
            asset={asset}
            onClick={() => onAssetClick(asset.id, asset.name)}
            priceHistory={Array(10).fill(0).map((_, i) => ({ 
              value: asset.price * (0.9 + Math.random() * 0.2) 
            }))}
          />
        ))}
      </div>
    </div>
  );
};

export default AssetList;
