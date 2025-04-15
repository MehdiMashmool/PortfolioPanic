
import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { Trophy } from 'lucide-react';
import AchievementBadge, { AchievementType } from './AchievementBadge';

interface AchievementToastProps {
  type: AchievementType;
  title: string;
  description: string;
}

export const showAchievementToast = (achievement: AchievementType) => {
  const achievements = {
    'first-trade': {
      title: 'First Trade Complete!',
      description: 'You made your first investment. Keep going!'
    },
    'doubled-portfolio': {
      title: 'Portfolio Doubled!',
      description: 'You doubled your initial investment!'
    },
    'diversified': {
      title: 'Diversification Expert!',
      description: 'You now have investments in all asset classes!'
    },
    'safe-investor': {
      title: 'Safe Investor!',
      description: 'Protected your portfolio during market volatility!'
    },
    'market-timing': {
      title: 'Perfect Timing!',
      description: 'Bought low and sold high in the same round!'
    },
    'profit-streak': {
      title: 'On Fire!',
      description: 'Maintained profits for 3 consecutive rounds!'
    }
  };

  const { title, description } = achievements[achievement];

  toast.custom((t: { visible?: boolean } | null) => {
    // More explicit type checking and null handling
    const isVisible = t && 'visible' in t ? t.visible : true;
    
    return (
      <div className={`
        ${isVisible ? 'animate-enter' : 'animate-leave'}
        max-w-md w-full bg-gradient-to-br from-[#1A1F2C] to-[#0F172A] shadow-lg rounded-lg pointer-events-auto overflow-hidden`}>
        <div className="p-4 flex items-center">
          <div className="flex-shrink-0 mr-3">
            <AchievementBadge type={achievement} unlocked={true} showTooltip={false} />
          </div>
          <div className="ml-2 flex-1">
            <div className="font-medium text-white flex items-center">
              <Trophy size={16} className="mr-1 text-amber-400" />
              <span>{title}</span>
            </div>
            <p className="text-sm text-gray-300">{description}</p>
          </div>
        </div>
      </div>
    );
  }, { duration: 5000 });
};

const AchievementToast: React.FC<AchievementToastProps> = ({ type, title, description }) => {
  useEffect(() => {
    showAchievementToast(type);
  }, [type, title, description]);

  return null; // This component doesn't render anything, just shows the toast
};

export default AchievementToast;
