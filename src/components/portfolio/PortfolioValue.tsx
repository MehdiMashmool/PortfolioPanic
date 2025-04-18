import { formatCurrency } from '@/utils/marketLogic';
import { HelpCircle, ArrowUp, ArrowDown, Sparkles } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import SparklineChart from '../charts/SparklineChart';
import { useGame } from '@/contexts/GameContext';

interface PortfolioValueProps {
  netWorth: number;
  netWorthChange: number;
  netWorthPercentChange: number;
  compactMode?: boolean;
}

const PortfolioValue = ({ netWorth, netWorthChange, netWorthPercentChange, compactMode = false }: PortfolioValueProps) => {
  const { state } = useGame();
  
  // Format history data for sparkline chart
  const portfolioHistory = state.netWorthHistory.map(entry => ({
    value: entry.value,
    timestamp: entry.timestamp
  }));
  
  return (
    <div className={`relative ${compactMode ? 'p-3' : 'p-4'} bg-panel/50 rounded-lg border border-panel-light/50`}>
      <div className={`${compactMode ? 'text-xs' : 'text-sm'} text-gray-400 font-medium flex items-center mb-1`}>
        Portfolio Value
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle size={compactMode ? 12 : 14} className="ml-1 text-gray-500 cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-dark border-highlight w-60">
              <p className="text-xs">Your total portfolio value includes cash and all investments at current market prices.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className={`${compactMode ? 'text-2xl' : 'text-3xl'} font-bold text-white`}>
        {formatCurrency(netWorth)}
      </div>
      <div className={`${compactMode ? 'text-xs' : 'text-sm'} flex items-center ${netWorthChange >= 0 ? 'text-profit' : 'text-loss'}`}>
        {netWorthChange >= 0 ? (
          <ArrowUp size={compactMode ? 14 : 16} className="mr-1" />
        ) : (
          <ArrowDown size={compactMode ? 14 : 16} className="mr-1" />
        )}
        <span className={`${netWorthChange >= 0 ? 'text-profit drop-shadow-[0_0_5px_rgba(16,185,129,0.4)]' : 'text-loss drop-shadow-[0_0_5px_rgba(239,68,68,0.4)]'}`}>
          {netWorthChange >= 0 ? '+' : ''}{netWorthPercentChange.toFixed(1)}%
        </span>
      </div>
      
      {/* Trend Chart */}
      {portfolioHistory.length > 1 && (
        <div className={`mt-2 ${compactMode ? 'h-10' : 'h-16'}`}>
          <SparklineChart 
            data={portfolioHistory}
            height={compactMode ? 40 : 64}
            areaFill={true}
            showTooltip={true}
            assetType={netWorthChange >= 0 ? "stock" : "loss"}
            amplifyVisuals={true}
            referenceValue={portfolioHistory[0]?.value || 0}
          />
        </div>
      )}
      
      {!compactMode && Math.abs(netWorthPercentChange) > 5 && (
        <div className={`absolute -right-1 top-0 text-lg font-bold ${
          netWorthPercentChange > 0 ? 'text-green-400' : 'text-red-400'
        } animate-fade-in`}>
          {netWorthPercentChange > 0 ? '+' : ''}
          {netWorthPercentChange.toFixed(1)}%
        </div>
      )}
      
      {!compactMode && netWorthPercentChange > 50 && (
        <div className="absolute top-0 right-0 p-2">
          <Sparkles className="text-amber-400 animate-pulse" size={24} />
        </div>
      )}
    </div>
  );
};

export default PortfolioValue;
