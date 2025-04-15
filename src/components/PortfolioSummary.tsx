
import React from 'react';
import { useGame } from '../contexts/GameContext';
import { formatCurrency } from '../utils/marketLogic';
import { Card, CardContent } from './ui/card';
import { ArrowUp, ArrowDown, Sparkles, HelpCircle } from 'lucide-react';
import AllocationPieChart from './AllocationPieChart';
import PerformanceChart from './PerformanceChart';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import AchievementBadge from './AchievementBadge';

const PortfolioSummary = () => {
  const { state, calculateNetWorth } = useGame();
  const netWorth = calculateNetWorth();
  const netWorthChange = state.netWorthHistory.length > 1
    ? netWorth - state.netWorthHistory[0].value
    : 0;
  const netWorthPercentChange = state.netWorthHistory.length > 1
    ? (netWorthChange / state.netWorthHistory[0].value) * 100
    : 0;

  const totalInvested = Object.entries(state.holdings).reduce((total, [assetId, holding]) => {
    const asset = state.assets.find(a => a.id === assetId);
    if (asset && holding.quantity > 0) {
      return total + (holding.quantity * asset.price);
    }
    return total;
  }, 0);

  const calculatePortfolioData = () => {
    let totalInvested = 0;
    const assetValues: { [key: string]: number } = {};
    
    Object.entries(state.holdings).forEach(([assetId, holding]) => {
      const asset = state.assets.find(a => a.id === assetId);
      if (asset && holding.quantity > 0) {
        const value = holding.quantity * asset.price;
        assetValues[assetId] = value;
        totalInvested += value;
      }
    });
    
    if (totalInvested === 0) {
      return [{
        name: 'Cash',
        value: 100,
        color: '#64748b'
      }];
    }
    
    const allocation = Object.entries(assetValues).map(([assetId, value]) => {
      const asset = state.assets.find(a => a.id === assetId);
      return {
        name: asset ? asset.name : 'Unknown',
        value: (value / (totalInvested + state.cash)) * 100,
        color: asset ? 
          asset.color === 'stock' ? '#3B82F6' : 
          asset.color === 'gold' ? '#FFC107' : 
          asset.color === 'oil' ? '#6B7280' : 
          '#8B5CF6' : '#64748b'
      };
    });
    
    const cashPercentage = (state.cash / (totalInvested + state.cash)) * 100;
    if (cashPercentage > 0) {
      allocation.push({
        name: 'Cash',
        value: cashPercentage,
        color: '#64748b'
      });
    }
    
    return allocation;
  };

  // Calculate if we've earned achievements
  const hasDoubledPortfolio = netWorth >= 20000;
  const hasFirstTrade = Object.values(state.holdings).some(h => h.quantity > 0);
  
  // Check for diversification (investing in all asset types)
  const assetTypes = new Set(state.assets.map(a => a.color));
  const investedTypes = new Set();
  Object.entries(state.holdings).forEach(([assetId, holding]) => {
    if (holding.quantity > 0) {
      const asset = state.assets.find(a => a.id === assetId);
      if (asset) investedTypes.add(asset.color);
    }
  });
  const isDiversified = investedTypes.size >= assetTypes.size;

  return (
    <Card className="bg-gradient-to-br from-[#0F172A]/90 to-[#1E293B]/60 border-white/10 backdrop-blur-xl relative overflow-hidden">
      {/* Sparkle effect for high performance */}
      {netWorthPercentChange > 50 && (
        <div className="absolute top-0 right-0 p-2">
          <Sparkles className="text-amber-400 animate-pulse" size={24} />
        </div>
      )}
      
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            
            {/* Performance indicator animation */}
            {Math.abs(netWorthPercentChange) > 5 && (
              <div className={`absolute -right-1 top-0 text-lg font-bold ${
                netWorthPercentChange > 0 ? 'text-green-400' : 'text-red-400'
              } animate-fade-in`}>
                {netWorthPercentChange > 0 ? '+' : ''}
                {netWorthPercentChange.toFixed(1)}%
              </div>
            )}
          </div>
          
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
              {formatCurrency(state.cash)}
            </div>
            <div className="text-sm text-gray-400">
              {(state.cash / netWorth * 100).toFixed(1)}% of portfolio
            </div>
          </div>
          
          <div className="flex flex-col">
            <div className="text-sm text-gray-400 font-medium mb-1 flex items-center justify-between">
              <span>Allocation</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle size={14} className="text-gray-500 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-dark border-highlight w-60">
                    <p className="text-xs">A diversified portfolio spreads investments across different asset types to reduce risk.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="relative">
              <AllocationPieChart data={calculatePortfolioData()} />
              
              {/* Show warning if not diversified enough */}
              {Object.keys(state.holdings).length > 0 && investedTypes.size === 1 && (
                <div className="absolute top-0 right-0">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="text-amber-400 cursor-help">
                          <HelpCircle size={16} />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="bg-dark border-highlight">
                        <p className="text-xs">Your portfolio isn't diversified! Consider investing in different asset types.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm text-gray-400 font-medium">Portfolio Performance</h3>
            
            {/* Achievements row */}
            <div className="flex space-x-2">
              <AchievementBadge type="first-trade" unlocked={hasFirstTrade} size="sm" />
              <AchievementBadge type="doubled-portfolio" unlocked={hasDoubledPortfolio} size="sm" />
              <AchievementBadge type="diversified" unlocked={isDiversified} size="sm" />
            </div>
          </div>
          <PerformanceChart data={state.netWorthHistory} height={180} />
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioSummary;
