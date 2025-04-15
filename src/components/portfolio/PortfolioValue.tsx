
import { formatCurrency } from '@/utils/marketLogic';
import { HelpCircle, ArrowUp, ArrowDown, Sparkles } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

interface PortfolioValueProps {
  netWorth: number;
  netWorthChange: number;
  netWorthPercentChange: number;
}

const PortfolioValue = ({ netWorth, netWorthChange, netWorthPercentChange }: PortfolioValueProps) => {
  return (
    <div className="relative">
      <div className="text-sm text-gray-400 font-medium flex items-center">
        Portfolio Value
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle size={14} className="ml-1 text-gray-500 cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-dark border-highlight w-60">
              <p className="text-xs">Your total portfolio value includes cash and all investments at current market prices.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="text-3xl font-bold mt-1 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
        {formatCurrency(netWorth)}
      </div>
      <div className={`text-sm flex items-center ${netWorthChange >= 0 ? 'text-profit' : 'text-loss'}`}>
        {netWorthChange >= 0 ? (
          <ArrowUp size={16} className="mr-1" />
        ) : (
          <ArrowDown size={16} className="mr-1" />
        )}
        <span className={`${netWorthChange >= 0 ? 'text-profit drop-shadow-[0_0_5px_rgba(16,185,129,0.4)]' : 'text-loss drop-shadow-[0_0_5px_rgba(239,68,68,0.4)]'}`}>
          {netWorthChange >= 0 ? '+' : ''}{netWorthPercentChange.toFixed(1)}%
        </span>
      </div>
      
      {Math.abs(netWorthPercentChange) > 5 && (
        <div className={`absolute -right-1 top-0 text-lg font-bold ${
          netWorthPercentChange > 0 ? 'text-green-400' : 'text-red-400'
        } animate-fade-in`}>
          {netWorthPercentChange > 0 ? '+' : ''}
          {netWorthPercentChange.toFixed(1)}%
        </div>
      )}
      
      {netWorthPercentChange > 50 && (
        <div className="absolute top-0 right-0 p-2">
          <Sparkles className="text-amber-400 animate-pulse" size={24} />
        </div>
      )}
    </div>
  );
};

export default PortfolioValue;
