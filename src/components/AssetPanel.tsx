import React, { useMemo, useState } from "react";
import type { Asset } from "../types/game";
import { formatCurrency, getPriceChangeColor } from "../utils/marketLogic";
import { Card, CardContent } from "./ui/card";
import {
  ArrowUp,
  ArrowDown,
  TrendingUp,
  ArrowRight,
  Eye,
  BarChart4,
  DollarSign,
  LineChart,
} from "lucide-react";
import SparklineChart from "./charts/SparklineChart";
import { Button } from "./ui/button";
import {
  assetPriceHistory,
  generateEnhancedSparklineData,
} from "../utils/chartUtils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AssetPanelProps {
  asset: Asset;
  onClick: () => void;
  priceHistory?: Array<{ value: number; timestamp?: number }>;
  compact?: boolean;
}

const AssetPanel: React.FC<AssetPanelProps> = ({
  asset,
  onClick,
  priceHistory,
  compact = false,
}) => {
  const [showDetails, setShowDetails] = useState(false);
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
    return generateEnhancedSparklineData(
      {
        price: asset.price,
        previousPrice: asset.previousPrice,
        volatility: asset.volatility,
      },
      25
    ); // Generate 25 data points for a smoother graph
  }, [
    asset.id,
    asset.price,
    asset.previousPrice,
    asset.volatility,
    priceHistory,
  ]);

  const getVolatilityLevel = (volatility: number) => {
    if (volatility >= 0.7) return "Very High";
    if (volatility >= 0.5) return "High";
    if (volatility >= 0.3) return "Medium";
    return "Low";
  };

  const getAssetGradient = (color: string) => {
    switch (color) {
      case "stock":
        return "bg-gradient-to-br from-blue-900/40 to-blue-900/10";
      case "commodity":
        return "bg-gradient-to-br from-amber-900/40 to-amber-900/10";
      case "crypto":
        return "bg-gradient-to-br from-purple-900/40 to-purple-900/10";
      default:
        return "bg-gradient-dark";
    }
  };

  // Quick action buttons
  const QuickActions = () => (
    <div className="absolute top-2 right-1 space-x-1">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="bg-white/5 hover:bg-white/10 h-6 w-6 rounded-md"
              onClick={(e) => {
                e.stopPropagation();
                setShowDetails(!showDetails);
              }}
            >
              <Eye size={14} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-dark border-highlight">
            <p className="text-xs">View Details</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );

  // Enhanced detail metrics
  const DetailMetrics = () => (
    <div
      className={`overflow-hidden transition-all duration-300 ${
        showDetails ? "max-h-96 mt-2" : "max-h-0"
      }`}
    >
      <div className="bg-black/20 rounded-md p-2">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <div className="text-neutral">Open:</div>
            <div className="font-medium">
              {formatCurrency(asset.previousPrice)}
            </div>
          </div>
          <div>
            <div className="text-neutral">Current:</div>
            <div className="font-medium">{formatCurrency(asset.price)}</div>
          </div>
          <div>
            <div className="text-neutral">Change:</div>
            <div className={`font-medium ${priceChangeColor}`}>
              {priceChange >= 0 ? "+" : ""}
              {formatCurrency(priceChange)}
            </div>
          </div>
          <div>
            <div className="text-neutral">% Change:</div>
            <div className={`font-medium ${priceChangeColor}`}>
              {priceChange >= 0 ? "+" : ""}
              {priceChangePercent.toFixed(2)}%
            </div>
          </div>
          <div>
            <div className="text-neutral">Volatility:</div>
            <div
              className={`font-medium ${
                asset.volatility >= 0.7
                  ? "text-red-400"
                  : asset.volatility >= 0.5
                  ? "text-orange-400"
                  : asset.volatility >= 0.3
                  ? "text-yellow-400"
                  : "text-green-400"
              }`}
            >
              {getVolatilityLevel(asset.volatility)}
            </div>
          </div>
          <div>
            <div className="text-neutral">Type:</div>
            <div className="font-medium capitalize">{asset.color}</div>
          </div>
        </div>

        <div className="mt-3 mb-1">
          <div className="text-xs text-neutral flex items-center mb-1">
            <LineChart size={12} className="mr-1" /> Price History
          </div>
          <SparklineChart
            data={sparklineData}
            referenceValue={asset.previousPrice}
            areaFill={true}
            amplifyVisuals={true}
            height={60}
            assetType={asset.color}
            showTooltip={true}
            showAxes={true}
          />
        </div>

        <Button
          size="sm"
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          Trade Now
        </Button>
      </div>
    </div>
  );

  // Compact view for asset card
  if (compact) {
    return (
      <Card
        className={`bg-transparent border-white/5 hover:border-white/20 transition-all cursor-pointer relative overflow-hidden group`}
        onClick={onClick}
      >
        <CardContent className="p-2">
          <QuickActions />
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div
                className={`w-1 h-10 rounded-sm ${
                  asset.color === "stock"
                    ? "bg-blue-500"
                    : asset.color === "commodity"
                    ? "bg-amber-500"
                    : asset.color === "crypto"
                    ? "bg-purple-500"
                    : "bg-gray-500"
                }`}
              />
              <div>
                <h3 className="font-medium text-sm">{asset.name}</h3>
                <div className="text-xs text-neutral">{asset.ticker}</div>
              </div>
            </div>

            <div className="text-right">
              <div className="font-medium text-sm mr-6">
                {formatCurrency(asset.price)}
              </div>
              <div
                className={`flex items-center text-xs ${priceChangeColor} justify-end`}
              >
                {priceChange > 0 ? (
                  <ArrowUp size={12} className="mr-px" />
                ) : (
                  <ArrowDown size={12} className="mr-px" />
                )}
                <span>{Math.abs(priceChangePercent).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Mini chart for compact view */}
          <div className="mt-1 h-12 -mx-1">
            <SparklineChart
              data={sparklineData}
              referenceValue={asset.previousPrice}
              areaFill={true}
              height={48}
              assetType={asset.color}
              showTooltip={false}
              amplifyVisuals={true}
            />
          </div>

          <DetailMetrics />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`asset-card ${getAssetGradient(
        asset.color
      )} border-white/5 hover:border-white/20 transition-all relative overflow-hidden`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <QuickActions />
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-lg">{asset.name}</h3>
          <div className="text-sm px-2 py-0.5 bg-dark rounded-md">
            {asset.ticker}
          </div>
        </div>

        <div className="mb-3">
          <div className="text-xl font-semibold">
            {formatCurrency(asset.price)}
          </div>
          <div className={`flex items-center text-sm ${priceChangeColor}`}>
            {priceChange > 0 ? (
              <ArrowUp size={16} className="mr-1" />
            ) : (
              <ArrowDown size={16} className="mr-1" />
            )}
            <span
              className={`${priceChange > 0 ? "text-profit" : "text-loss"} ${
                priceChange > 0
                  ? "drop-shadow-[0_0_4px_rgba(16,185,129,0.3)]"
                  : "drop-shadow-[0_0_4px_rgba(239,68,68,0.3)]"
              }`}
            >
              {Math.abs(priceChangePercent).toFixed(2)}%
            </span>
          </div>
        </div>

        <div className="mb-2">
          <div className="text-xs text-neutral mb-1 flex items-center">
            <LineChart size={12} className="mr-1" /> Price History
          </div>
          <SparklineChart
            data={sparklineData}
            referenceValue={asset.previousPrice}
            areaFill={true}
            amplifyVisuals={true}
            height={70}
            assetType={asset.color}
            showTooltip={true}
            showAxes={true}
          />
        </div>

        <div className="flex justify-between items-center">
          <div className="text-xs text-neutral flex items-center">
            <span className="mr-1">Volatility:</span>
            <span
              className={`
              ${
                asset.volatility >= 0.7
                  ? "text-red-400"
                  : asset.volatility >= 0.5
                  ? "text-orange-400"
                  : asset.volatility >= 0.3
                  ? "text-yellow-400"
                  : "text-green-400"
              }
            `}
            >
              {getVolatilityLevel(asset.volatility)}
            </span>
          </div>

          <Button
            className="p-0 h-auto bg-transparent hover:bg-white/10 text-white/70 hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            Trade <ArrowRight size={14} className="ml-1" />
          </Button>
        </div>

        <DetailMetrics />
      </CardContent>
    </Card>
  );
};

export default AssetPanel;
