
import React from 'react';
import { useGame } from '../contexts/GameContext';
import { Card, CardContent } from './ui/card';
import PortfolioValue from './portfolio/PortfolioValue';
import InvestmentSummary from './portfolio/InvestmentSummary';
import AllocationSection from './portfolio/AllocationSection';
import PerformanceSection from './portfolio/PerformanceSection';

const PortfolioSummary = () => {
  const { state } = useGame();
  const netWorth = state.netWorthHistory[state.netWorthHistory.length - 1]?.value || 0;
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

  // Achievement checks
  const hasFirstTrade = Object.values(state.holdings).some(h => h.quantity > 0);
  const hasDoubledPortfolio = netWorth >= 20000;
  
  // Check for diversification
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
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <PortfolioValue 
            netWorth={netWorth}
            netWorthChange={netWorthChange}
            netWorthPercentChange={netWorthPercentChange}
          />
          
          <InvestmentSummary
            totalInvested={totalInvested}
            netWorth={netWorth}
            cash={state.cash}
          />
          
          <AllocationSection
            holdings={state.holdings}
            assets={state.assets}
            cash={state.cash}
          />
        </div>
        
        <PerformanceSection
          netWorthHistory={state.netWorthHistory}
          hasFirstTrade={hasFirstTrade}
          hasDoubledPortfolio={hasDoubledPortfolio}
          isDiversified={isDiversified}
        />
      </CardContent>
    </Card>
  );
};

export default PortfolioSummary;
