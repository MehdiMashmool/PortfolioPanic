
import { useState, useEffect } from 'react';
import { GameState } from '../types/game';
import { AchievementType } from '../components/AchievementBadge';
import { showAchievementToast } from '../components/AchievementToast';

export const useAchievementTracker = (state: GameState, calculateNetWorth: () => number) => {
  const [achievementsUnlocked, setAchievementsUnlocked] = useState<Set<AchievementType>>(new Set());

  const unlockAchievement = (achievement: AchievementType) => {
    if (!achievementsUnlocked.has(achievement)) {
      setAchievementsUnlocked(prev => {
        const newSet = new Set(prev);
        newSet.add(achievement);
        return newSet;
      });
      
      showAchievementToast(achievement);
    }
  };

  useEffect(() => {
    if (Object.keys(state.holdings).length > 0 && !achievementsUnlocked.has('first-trade')) {
      unlockAchievement('first-trade');
    }
    
    const netWorth = calculateNetWorth();
    if (netWorth >= 20000 && !achievementsUnlocked.has('doubled-portfolio')) {
      unlockAchievement('doubled-portfolio');
    }

    const assetTypes = new Set(state.assets.map(asset => asset.color));
    const investedTypes = new Set();
    Object.entries(state.holdings).forEach(([assetId, holding]) => {
      if (holding.quantity > 0) {
        const asset = state.assets.find(a => a.id === assetId);
        if (asset) {
          investedTypes.add(asset.color);
        }
      }
    });
    
    if (investedTypes.size >= assetTypes.size && !achievementsUnlocked.has('diversified')) {
      unlockAchievement('diversified');
    }
  }, [state.holdings, state.netWorthHistory]);

  return { unlockAchievement };
};
