
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
        <h2 className="text-lg font-semibold text-white flex items-center">
          Assets
          <span className="ml-2 text-sm text-gray-400 font-normal">
            ({state.assets.length})
          </span>
        </h2>
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
