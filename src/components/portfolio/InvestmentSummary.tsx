
import { formatCurrency } from '@/utils/marketLogic';

interface InvestmentSummaryProps {
  totalInvested: number;
  netWorth: number;
  cash: number;
}

const InvestmentSummary = ({ totalInvested, netWorth, cash }: InvestmentSummaryProps) => {
  return (
    <>
      <div>
        <div className="text-sm text-gray-400 font-medium">Invested</div>
        <div className="text-2xl font-bold mt-1">
          {formatCurrency(totalInvested)}
        </div>
        <div className="text-sm text-gray-400">
          {(totalInvested / netWorth * 100).toFixed(1)}% of portfolio
        </div>
      </div>
      
      <div>
        <div className="text-sm text-gray-400 font-medium">Available Cash</div>
        <div className="text-2xl font-bold mt-1">
          {formatCurrency(cash)}
        </div>
        <div className="text-sm text-gray-400">
          {(cash / netWorth * 100).toFixed(1)}% of portfolio
        </div>
      </div>
    </>
  );
};

export default InvestmentSummary;
