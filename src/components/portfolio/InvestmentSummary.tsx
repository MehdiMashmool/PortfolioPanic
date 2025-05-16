import { formatCurrency } from "@/utils/marketLogic";
import { ArrowUp, ArrowDown, Wallet, DollarSign } from "lucide-react";

interface InvestmentSummaryProps {
  totalInvested: number;
  netWorth: number;
  cash: number;
  compact?: boolean;
}

const InvestmentSummary = ({
  totalInvested,
  netWorth,
  cash,
  compact = false,
}: InvestmentSummaryProps) => {
  const lowCash = cash < netWorth * 0.1;
  const highCash = cash > netWorth * 0.5;

  return (
    <div className={`grid grid-cols-1 ${compact ? "gap-2" : "gap-4"}`}>
      <div className={`${compact ? "p-3" : "p-4"} `}>
        <div className="flex justify-between items-center">
          <div className="text-xl text-indigo-200 font-medium flex items-center">
            Invested
          </div>
        </div>
        <div
          className={`${
            compact ? "text-3xl" : "text-4xl"
          } font-bold mt-1 text-white`}
        >
          {formatCurrency(totalInvested)}
        </div>
      </div>

      <div className={`${compact ? "p-3" : "p-4"}`}>
        <div className="flex justify-between items-center">
          <div
            className={`text-xl font-medium flex items-center ${
              lowCash
                ? "text-red-200"
                : highCash
                ? "text-amber-200"
                : "text-green-200"
            }`}
          >
            Available Cash
          </div>
        </div>
        <div
          className={`${
            compact ? "text-3xl" : "text-4xl"
          } font-bold mt-1 text-white`}
        >
          {formatCurrency(cash)}
        </div>

        {!compact && lowCash && (
          <div className="mt-1 text-xs text-red-300 flex items-center">
            <ArrowDown size={10} className="mr-0.5" />
            Low on cash for new opportunities
          </div>
        )}

        {!compact && highCash && (
          <div className="mt-1 text-xs text-amber-300 flex items-center">
            <ArrowUp size={10} className="mr-0.5" />
            Consider investing more cash
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestmentSummary;
