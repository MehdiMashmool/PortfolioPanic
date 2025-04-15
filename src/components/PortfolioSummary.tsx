
import React from 'react';
import { useGame } from '../contexts/GameContext';
import { formatCurrency } from '../utils/marketLogic';
import { Card, CardContent } from './ui/card';
import { ArrowUp, ArrowDown } from 'lucide-react';
import AllocationPieChart from './AllocationPieChart';
import PerformanceChart from './PerformanceChart';

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

  return (
    <Card className="bg-gradient-to-br from-[#0F172A]/90 to-[#1E293B]/60 border-white/10 backdrop-blur-xl">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-gray-400 font-medium">Current Portfolio Value</div>
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
          </div>
          <div>
            <div className="text-sm text-gray-400 font-medium">Invested</div>
            <div className="text-2xl font-bold mt-1">{formatCurrency(totalInvested)}</div>
            <div className="text-sm text-gray-400">
              {formatCurrency(totalInvested / netWorth * 100)}% of portfolio
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400 font-medium">Available Cash</div>
            <div className="text-2xl font-bold mt-1">{formatCurrency(state.cash)}</div>
            <div className="text-sm text-gray-400">
              {formatCurrency(state.cash / netWorth * 100)}% of portfolio
            </div>
          </div>
          <div className="flex flex-col">
            <div className="text-sm text-gray-400 font-medium mb-1">Allocation</div>
            <AllocationPieChart data={calculatePortfolioData()} />
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="text-sm text-gray-400 font-medium mb-2">Portfolio Performance</h3>
          <PerformanceChart data={state.netWorthHistory} height={200} />
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioSummary;
