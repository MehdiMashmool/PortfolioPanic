
import { AchievementType } from '../AchievementBadge';
import PerformanceChart from '../PerformanceChart';
import AchievementBadge from '../AchievementBadge';
import { NetWorthHistoryEntry } from '@/types/game';

interface PerformanceSectionProps {
  netWorthHistory: NetWorthHistoryEntry[];
  hasFirstTrade: boolean;
  hasDoubledPortfolio: boolean;
  isDiversified: boolean;
}

const PerformanceSection = ({ 
  netWorthHistory,
  hasFirstTrade,
  hasDoubledPortfolio,
  isDiversified
}: PerformanceSectionProps) => {
  return (
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
      <PerformanceChart data={netWorthHistory} height={180} />
    </div>
  );
};

export default PerformanceSection;
