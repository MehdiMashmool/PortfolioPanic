import { Mission, MissionType, MissionCollection } from '../types/missions';
import { v4 as uuidv4 } from 'uuid';

export const generateRoundMissions = (round: number): Mission[] => {
  // Each round has 1-2 missions
  const missionsCount = Math.floor(Math.random() * 2) + 1;
  const missions: Mission[] = [];
  
  // Ensure we don't duplicate mission types in the same round
  const usedTypes: Set<MissionType> = new Set();
  
  for (let i = 0; i < missionsCount; i++) {
    const missionType = getAppropriateMissionType(round, usedTypes);
    if (missionType) {
      usedTypes.add(missionType);
      missions.push(createMission(missionType, round));
    }
  }
  
  return missions;
};

const getAppropriateMissionType = (round: number, usedTypes: Set<MissionType>): MissionType | null => {
  // Different mission pools based on game progression
  const earlyGameMissions: MissionType[] = ['diversify', 'value-investing', 'react-to-news'];
  const midGameMissions: MissionType[] = ['survive-crash', 'sector-rotation', 'market-timing'];
  const lateGameMissions: MissionType[] = ['flight-to-safety', 'government-stimulus', 'short-selling', 'risk-management'];
  
  let availableMissions: MissionType[];
  
  if (round <= 3) {
    availableMissions = earlyGameMissions;
  } else if (round <= 7) {
    availableMissions = [...earlyGameMissions, ...midGameMissions];
  } else {
    availableMissions = [...midGameMissions, ...lateGameMissions];
  }
  
  // Filter out already used types
  const validMissions = availableMissions.filter(type => !usedTypes.has(type));
  
  if (validMissions.length === 0) return null;
  
  // Return a random mission type from the valid ones
  return validMissions[Math.floor(Math.random() * validMissions.length)];
};

export const createMission = (type: MissionType, round: number): Mission => {
  const missionTemplates: Record<MissionType, Omit<Mission, 'id' | 'round' | 'status'>> = {
    'diversify': {
      type: 'diversify',
      title: 'Build a Diversified Portfolio',
      description: 'Own at least 3 different asset types.',
      reward: '+5% Cash Bonus',
      rewardValue: 0.05,
      icon: 'Layers',
      progressRequired: 3,
      currentProgress: 0
    },
    'survive-crash': {
      type: 'survive-crash',
      title: 'Market Downturn',
      description: 'End the round with your portfolio value no more than 3% below starting value.',
      reward: '+3% Portfolio Value',
      rewardValue: 0.03,
      icon: 'Shield',
      progressRequired: 1,
      currentProgress: 0
    },
    'react-to-news': {
      type: 'react-to-news',
      title: 'News Trader',
      description: 'Make at least 3 trades based on news events this round.',
      reward: 'Early News Preview',
      rewardValue: 1,
      icon: 'Newspaper',
      progressRequired: 3,
      currentProgress: 0
    },
    'flight-to-safety': {
      type: 'flight-to-safety',
      title: 'Flight to Safety',
      description: 'Hold gold during a market downturn.',
      reward: 'Reduced Volatility Next Round',
      rewardValue: 0.5,
      icon: 'TrendingDown',
      progressRequired: 1,
      currentProgress: 0
    },
    'government-stimulus': {
      type: 'government-stimulus',
      title: 'Government Stimulus',
      description: 'Capitalize on the stimulus by increasing tech holdings.',
      reward: '+7% Tech Returns',
      rewardValue: 0.07,
      icon: 'TrendingUp',
      progressRequired: 1,
      currentProgress: 0
    },
    'market-timing': {
      type: 'market-timing',
      title: 'Market Timer',
      description: 'Sell any asset within 5% of its peak price.',
      reward: 'Market Insight Bonus',
      rewardValue: 1,
      icon: 'Timer',
      progressRequired: 1,
      currentProgress: 0
    },
    'value-investing': {
      type: 'value-investing',
      title: 'Value Investor',
      description: 'Buy an asset when it drops by at least 5%, then hold until round end.',
      reward: '+10% Returns on That Asset',
      rewardValue: 0.1,
      icon: 'TrendingUp',
      progressRequired: 1,
      currentProgress: 0
    },
    'short-selling': {
      type: 'short-selling',
      title: 'Short Seller',
      description: 'Profit from a short position on any asset.',
      reward: 'Lower Short Fees Next Round',
      rewardValue: 0.5,
      icon: 'ArrowDown',
      progressRequired: 1,
      currentProgress: 0
    },
    'sector-rotation': {
      type: 'sector-rotation',
      title: 'Sector Rotation',
      description: 'Sell one asset type completely and invest in another.',
      reward: '+5% Initial Returns on New Sector',
      rewardValue: 0.05,
      icon: 'RefreshCw',
      progressRequired: 1,
      currentProgress: 0
    },
    'risk-management': {
      type: 'risk-management',
      title: 'Risk Manager',
      description: 'Keep your portfolio volatility below market average.',
      reward: 'Reduced Risk Next Round',
      rewardValue: 0.5,
      icon: 'Shield',
      progressRequired: 1,
      currentProgress: 0
    }
  };
  
  const template = missionTemplates[type];
  
  return {
    ...template,
    id: uuidv4(),
    round,
    status: 'active'
  };
};

// Generate a full set of missions for a 10-round game
export const generateGameMissions = (): MissionCollection => {
  const missionCollection: MissionCollection = {};
  
  for (let round = 1; round <= 10; round++) {
    missionCollection[round] = generateRoundMissions(round);
  }
  
  return missionCollection;
};

// This function will be called to check mission progress
export const checkMissionProgress = (
  mission: Mission, 
  state: any
): Mission => {
  // Deep clone the mission to avoid mutation
  const updatedMission = { ...mission };
  
  switch (mission.type) {
    case 'diversify': {
      // Count unique asset types
      const assetTypes = new Set();
      Object.entries(state.holdings).forEach(([assetId]) => {
        const asset = state.assets.find(a => a.id === assetId);
        if (asset && state.holdings[assetId].quantity > 0) {
          assetTypes.add(asset.color);
        }
      });
      updatedMission.currentProgress = assetTypes.size;
      break;
    }
    
    // Other mission progress checks would go here
    // We'll implement these as we add more mission logic
    
    default:
      break;
  }
  
  // Check if mission is completed
  if (updatedMission.progressRequired && 
      updatedMission.currentProgress !== undefined &&
      updatedMission.currentProgress >= updatedMission.progressRequired) {
    updatedMission.status = 'completed';
  }
  
  return updatedMission;
};
