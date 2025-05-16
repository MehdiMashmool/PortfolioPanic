import React, { useMemo } from "react";
import {
  assetPriceHistory,
  generateEnhancedSparklineData,
} from "../utils/chartUtils";
import { formatCurrency, getPriceChangeColor } from "../utils/marketLogic";
import AssetAreaChart from "./charts/AssetAreaChart";

export type Asset = {
  id: string;
  name: string;
  ticker: string;
  price: number;
  previousPrice: number;
  volatility: number;
  color: string;
  description?: string;
};

interface AssetPanelProps {
  asset: Asset;
  onClick?: () => void;
  priceHistory?: Array<{ value: number; timestamp?: number }>;
}

const AssetPanel: React.FC<AssetPanelProps> = ({
  asset,
  onClick,
  priceHistory,
}) => {
  const priceChange = asset.price - asset.previousPrice;
  const priceChangePercent = (priceChange / asset.previousPrice) * 100;
  const priceColorClass = getPriceChangeColor(priceChange);

  const sparklineData = useMemo(() => {
    if (assetPriceHistory[asset.id]?.data?.length > 2) {
      return assetPriceHistory[asset.id].data;
    }
    if (priceHistory && priceHistory.length > 2) {
      return priceHistory;
    }
    return generateEnhancedSparklineData(
      {
        price: asset.price,
        previousPrice: asset.previousPrice,
        volatility: asset.volatility,
      },
      30
    );
  }, [asset, priceHistory]);

  return (
    <div
      className="flex flex-col bg-transparent relative cursor-pointer py-4 transition overflow-hidden"
      onClick={onClick}
    >
      {/* Header: name, ticker, price, change */}
      <div className="flex justify-between items-center mb-2 px-3">
        <div className="flex items-center space-x-2">
          {/* Optional token icon could go here */}
          <div>
            <h3 className="text-sm font-medium text-white">{asset.name}</h3>
            <p className="text-xs text-neutral-400 uppercase">{asset.ticker}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-base font-semibold text-white">
            {formatCurrency(asset.price)}
          </p>
          <p className={`text-sm font-medium ${priceColorClass}`}>
            {priceChange >= 0 ? "+" : ""}
            {priceChangePercent.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Sparkline chart full width */}
      <div className="w-[120%] h-16 absolute inset-x-0 bottom-0 z-0 ">
        <AssetAreaChart
          data={sparklineData}
          referenceValue={asset.previousPrice}
          areaFill
          height={64}
          assetType={asset.color}
          showTooltip={false}
          showAxes={false}
        />
      </div>
    </div>
  );
};

export default AssetPanel;

// Note: other utils (chartUtils, marketLogic) remain unchanged, import them as shown.
