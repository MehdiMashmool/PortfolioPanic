
import { GameState } from '../../types/game';
import { checkMissionProgress } from '../../utils/missionGenerator';

export const handleUpdateMissionProgress = (state: GameState): GameState => {
  const updatedActiveMissions = state.activeMissions.map(mission => 
    checkMissionProgress(mission, state)
  );
  
  return {
    ...state,
    activeMissions: updatedActiveMissions
  };
};

export const handleCompleteMission = (state: GameState, missionId: string): GameState => {
  const updatedActiveMissions = state.activeMissions.map(mission => 
    mission.id === missionId ? { ...mission, status: 'completed' as const } : mission
  );
  
  const completedMission = state.activeMissions.find(m => m.id === missionId);
  let updatedMissionRewards = { ...state.missionRewards };
  let updatedCash = state.cash;
  
  if (completedMission && completedMission.reward && completedMission.rewardValue) {
    if (completedMission.reward.includes('Cash Bonus')) {
      const bonus = state.cash * completedMission.rewardValue;
      updatedCash = state.cash + bonus;
    }
    
    updatedMissionRewards[completedMission.type] = completedMission.rewardValue;
  }
  
  return {
    ...state,
    activeMissions: updatedActiveMissions,
    missionRewards: updatedMissionRewards,
    cash: updatedCash
  };
};

export const handleFailMission = (state: GameState, missionId: string): GameState => ({
  ...state,
  activeMissions: state.activeMissions.map(mission => 
    mission.id === missionId ? { ...mission, status: 'failed' as const } : mission
  )
});

