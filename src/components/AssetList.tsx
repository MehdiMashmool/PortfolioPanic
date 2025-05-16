import React from "react";
import { useGame } from "../contexts/GameContext";
import AssetPanel from "./AssetPanel";

interface AssetListProps {
  onAssetClick: (id: string, name: string) => void;
  filter?: string;
  compactView?: boolean;
}

const AssetList: React.FC<AssetListProps> = ({
  onAssetClick,
  filter,
  compactView = false,
}) => {
  const { state } = useGame();

  // Filter assets based on the filter prop
  const filteredAssets = state.assets.filter((asset) => {
    if (!filter) return true;

    switch (filter) {
      case "stocks":
        return asset.color === "stock";
      case "crypto":
        return asset.color === "crypto";
      case "commodities":
        return asset.color === "commodity";
      default:
        return true;
    }
  });

  if (filteredAssets.length === 0) {
    return (
      <div className="text-center py-8 text-neutral">
        No assets found matching this filter.
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col slim-scrollbar ${
        compactView ? "gap-4" : "gap-6"
      }`}
    >
      {filteredAssets.map((asset) => (
        <AssetPanel
          key={asset.id}
          asset={asset}
          onClick={() => onAssetClick(asset.id, asset.name)}
        />
      ))}
    </div>
  );
};

export default AssetList;
