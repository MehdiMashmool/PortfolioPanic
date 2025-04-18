import { useMemo } from 'react';
import { formatCurrency, formatPercentage } from '@/utils/marketLogic';
import { Holdings, Asset } from '@/types/game';
import { HelpCircle } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import AllocationPieChart from '../AllocationPieChart';

interface AllocationSectionProps {
  holdings: Holdings;
  assets: Asset[];
  cash: number;
  compact?: boolean;
}

const AllocationSection = ({ holdings, assets, cash, compact = false }: AllocationSectionProps) => {
  const calculatePortfolioData = () => {
    let totalInvested = 0;
    const assetValues: { [key: string]: number } = {};
    
    Object.entries(holdings).forEach(([assetId, holding]) => {
      const asset = assets.find(a => a.id === assetId);
      if (asset && holding.quantity > 0) {
        const value = holding.quantity * asset.price;
        assetValues[assetId] = value;
        totalInvested += value;
      }
    });
    
    const totalPortfolio = totalInvested + cash;
    
    if (totalInvested === 0) {
      return [{
        name: 'Cash',
        value: 100,
        color: '#64748b'
      }];
    }
    
    const allocation = Object.entries(assetValues).map(([assetId, value]) => {
      const asset = assets.find(a => a.id === assetId);
      return {
        name: asset ? asset.name : 'Unknown',
        value: (value / totalPortfolio) * 100,
        color: asset ? 
          asset.color === 'stock' ? '#3B82F6' : 
          asset.color === 'gold' ? '#FFC107' : 
          asset.color === 'oil' ? '#6B7280' : 
          '#8B5CF6' : '#64748b'
      };
    });
    
    const cashPercentage = (cash / totalPortfolio) * 100;
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
    <div className={`p-${compact ? '3' : '4'} rounded-lg bg-panel/50 border border-panel-light/50`}>
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
        <AllocationPieChart data={calculatePortfolioData()} className={compact ? "h-[80px]" : ""} />
        
        {Object.keys(holdings).length > 0 && new Set(assets.filter(asset => 
          holdings[asset.id]?.quantity > 0
        ).map(asset => asset.color)).size === 1 && (
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
  );
};

export default AllocationSection;
