import { Asset, Holdings } from "@/types/game";
import { HelpCircle } from "lucide-react";
import DonutChart from "../CircularProgress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface AllocationSectionProps {
  holdings: Holdings;
  assets: Asset[];
  cash: number;
  compact?: boolean;
}

type PortfolioItem = {
  name: string;
  value: number;
  color: string;
};

type PortfolioItemWithPercentage = PortfolioItem & {
  calculatedPercentage: number;
};

const calculatePortfolioData = ({
  assets,
  holdings,
  cash,
}: Partial<AllocationSectionProps>) => {
  let totalInvested = 0;
  const assetValues: { [key: string]: number } = {};

  Object.entries(holdings).forEach(([assetId, holding]) => {
    const asset = assets.find((a) => a.id === assetId);
    if (asset && holding.quantity > 0) {
      const value = holding.quantity * asset.price;
      assetValues[assetId] = value;
      totalInvested += value;
    }
  });

  const totalPortfolio = totalInvested + cash;

  if (totalInvested === 0) {
    return [
      {
        name: "Cash",
        value: 100,
        color: "#64748b",
      },
    ];
  }

  const allocation = Object.entries(assetValues).map(([assetId, value]) => {
    const asset = assets.find((a) => a.id === assetId);
    return {
      name: asset ? asset.name : "Unknown",
      value: (value / totalPortfolio) * 100,
      color: asset
        ? asset.color === "stock"
          ? "#3B82F6"
          : asset.color === "gold"
          ? "#FFC107"
          : asset.color === "oil"
          ? "#6B7280"
          : "#8B5CF6"
        : "#64748b",
    };
  });

  const cashPercentage = (cash / totalPortfolio) * 100;
  if (cashPercentage > 0) {
    allocation.push({
      name: "Cash",
      value: cashPercentage,
      color: "#64748b",
    });
  }

  return allocation;
};

const calculatePercentages = (
  data: PortfolioItem[],
  totalPortfolioValue: number
): PortfolioItemWithPercentage[] => {
  return data.map((item) => {
    const percentage = (item.value / 100) * (100 / totalPortfolioValue) * 100;

    return {
      ...item,
      calculatedPercentage: isNaN(percentage)
        ? 0
        : parseFloat(percentage.toFixed(2)),
    };
  });
};

const AllocationSection = ({
  holdings,
  assets,
  cash,
  compact = false,
}: AllocationSectionProps) => {
  const data = calculatePortfolioData({ assets, cash, holdings, compact });
  const totalDataValue = data.reduce((sum, item) => sum + item.value, 0);
  const donutChartValue = (totalDataValue / cash) * 100;

  return (
    <div className={`${compact ? "p-3" : "p-4"} flex flex-col gap-2 `}>
      <div className="text-2xl text-gray-400 font-medium mb-1 flex items-center justify-between">
        <span>Allocation</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle size={14} className="text-gray-500 cursor-help" />
            </TooltipTrigger>
            <TooltipContent
              side="top"
              className="bg-dark border-highlight w-60"
            >
              A diversified portfolio spreads investments across different asset
              types to reduce risk.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="relative self-end">
        {/* <AllocationPieChart
          data={calculatePortfolioData({ assets, cash, holdings })}
          className={compact ? "h-[80px]" : ""}
        /> */}
        <DonutChart percentage={donutChartValue} />
      </div>
    </div>
  );
};

export default AllocationSection;
