import { formatCurrency } from '@/utils/marketLogic';
import { ArrowUp, ArrowDown, Wallet, DollarSign } from 'lucide-react';

interface InvestmentSummaryProps {
  totalInvested: number;
  netWorth: number;
  cash: number;
  compact?: boolean;
}

const InvestmentSummary = ({ totalInvested, netWorth, cash, compact = false }: InvestmentSummaryProps) => {
  const lowCash = cash < (netWorth * 0.1);
  const highCash = cash > (netWorth * 0.5);
  
  return (
    <div className={`grid grid-cols-2 gap-${compact ? '2' : '4'}`}>
      <div className={`p-${compact ? '3' : '4'} rounded-lg bg-indigo-900/30 border border-indigo-800/30`}>
        <div className="flex justify-between items-center">
          <div className="text-sm text-indigo-200 font-medium flex items-center">
            <DollarSign size={14} className="mr-1 text-indigo-400" />
            Invested
          </div>
        </div>
        <div className={`${compact ? 'text-xl' : 'text-2xl'} font-bold mt-1 text-white`}>
          {formatCurrency(totalInvested)}
        </div>
      </div>
      
      <div className={`p-${compact ? '3' : '4'} rounded-lg ${
        lowCash 
          ? 'bg-red-900/30 border border-red-800/30' 
          : highCash 
            ? 'bg-amber-800/30 border border-amber-700/30' 
            : 'bg-green-900/30 border border-green-800/30'
      }`}>
        <div className="flex justify-between items-center">
          <div className={`text-sm font-medium flex items-center ${
            lowCash ? 'text-red-200' : highCash ? 'text-amber-200' : 'text-green-200'
          }`}>
            <Wallet size={14} className={`mr-1 ${
              lowCash ? 'text-red-400' : highCash ? 'text-amber-400' : 'text-green-400'
            }`} />
            Available Cash
          </div>
        </div>
        <div className={`${compact ? 'text-xl' : 'text-2xl'} font-bold mt-1 text-white`}>
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
