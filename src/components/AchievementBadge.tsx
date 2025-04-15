
import React from 'react';
import { Trophy, Award, TrendingUp, Shield, DollarSign, ArrowUpRight } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';

export type AchievementType = 'first-trade' | 'doubled-portfolio' | 'diversified' | 'safe-investor' | 'market-timing' | 'profit-streak';

interface AchievementBadgeProps {
  type: AchievementType;
  unlocked?: boolean;
  showTooltip?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({ 
  type, 
  unlocked = false,
  showTooltip = true,
  size = 'md'
}) => {
  const achievements = {
    'first-trade': {
      icon: <DollarSign />,
      title: 'First Trade',
      description: 'Made your first investment',
      color: 'bg-blue-500'
    },
    'doubled-portfolio': {
      icon: <ArrowUpRight />,
      title: 'Portfolio Doubler',
      description: 'Doubled your initial portfolio value',
      color: 'bg-green-500'
    },
    'diversified': {
      icon: <TrendingUp />,
      title: 'Diversification Expert',
      description: 'Invested in all asset types',
      color: 'bg-purple-500'
    },
    'safe-investor': {
      icon: <Shield />,
      title: 'Safe Investor',
      description: 'Maintained a balanced portfolio during market crash',
      color: 'bg-amber-500'
    },
    'market-timing': {
      icon: <Award />,
      title: 'Market Timer',
      description: 'Bought low and sold high in the same round',
      color: 'bg-indigo-500'
    },
    'profit-streak': {
      icon: <Trophy />,
      title: 'Profit Streak',
      description: 'Maintained positive returns for 3 consecutive rounds',
      color: 'bg-rose-500'
    }
  };

  const achievement = achievements[type];
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base'
  };
  
  const badge = (
    <div className={cn(
      'rounded-full flex items-center justify-center transition-all duration-300',
      sizeClasses[size],
      unlocked 
        ? `${achievement.color} text-white shadow-lg animate-pulse` 
        : 'bg-gray-700/50 text-gray-500 grayscale'
    )}>
      {React.cloneElement(achievement.icon, { 
        size: size === 'sm' ? 16 : size === 'md' ? 24 : 32,
        className: unlocked ? 'animate-scale-in' : ''
      })}
    </div>
  );
  
  if (!showTooltip) return badge;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-dark border-highlight">
          <div className="px-2 py-1">
            <div className="font-bold">{achievement.title}</div>
            <div className="text-xs text-neutral">{achievement.description}</div>
            {!unlocked && <div className="text-xs mt-1 text-gray-400 italic">Locked</div>}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AchievementBadge;
