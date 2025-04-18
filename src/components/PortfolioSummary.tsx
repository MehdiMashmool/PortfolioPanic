import React from 'react';
import { useGame } from '../contexts/GameContext';
import { Card, CardContent } from './ui/card';
import PortfolioValue from './portfolio/PortfolioValue';
import InvestmentSummary from './portfolio/InvestmentSummary';
import AllocationSection from './portfolio/AllocationSection';
import PerformanceSection from './portfolio/PerformanceSection';
import SparklineChart from './charts/SparklineChart';

interface PortfolioSummaryProps {
  compactMode?: boolean;
}

const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({ compactMode = false }) => {
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

  if (compactMode) {
    return (
      <div className="flex flex-col space-y-3">
        <PortfolioValue 
          netWorth={netWorth}
          netWorthChange={netWorthChange}
          netWorthPercentChange={netWorthPercentChange}
          compact={true}
        />
        
        <div className="grid grid-cols-2 gap-2">
          <InvestmentSummary
            totalInvested={totalInvested}
            netWorth={netWorth}
            cash={state.cash}
            compact={true}
          />
            
          <AllocationSection
            holdings={state.holdings}
            assets={state.assets}
            cash={state.cash}
            compact={true}
          />
        </div>
        
        {!compactMode && (
          <PerformanceSection
            netWorthHistory={state.netWorthHistory}
            hasFirstTrade={hasFirstTrade}
            hasDoubledPortfolio={hasDoubledPortfolio}
            isDiversified={isDiversified}
            height={120}
          />
        )}
      </div>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-[#0F172A]/90 to-[#1E293B]/60 border-white/10 backdrop-blur-xl relative overflow-hidden">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-4">
          {/* Top section: Portfolio value, invested amount and allocation */}
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-4">
              <PortfolioValue 
                netWorth={netWorth}
                netWorthChange={netWorthChange}
                netWorthPercentChange={netWorthPercentChange}
              />
            </div>
            
            <div className="col-span-4">
              <InvestmentSummary
                totalInvested={totalInvested}
                netWorth={netWorth}
                cash={state.cash}
                compact={true}
              />
            </div>
            
            <div className="col-span-4">
              <AllocationSection
                holdings={state.holdings}
                assets={state.assets}
                cash={state.cash}
                compact={true}
              />
            </div>
          </div>
          
          {/* Performance chart */}
          <PerformanceSection
            netWorthHistory={state.netWorthHistory}
            hasFirstTrade={hasFirstTrade}
            hasDoubledPortfolio={hasDoubledPortfolio}
            isDiversified={isDiversified}
            height={220}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioSummary;
