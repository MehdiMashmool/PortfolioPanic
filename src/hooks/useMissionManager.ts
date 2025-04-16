
import { useEffect } from 'react';
import { GameState } from '../types/game';
import { toast } from '@/hooks/use-toast';

export const useMissionManager = (state: GameState, dispatch: React.Dispatch<any>) => {
  useEffect(() => {
    const checkInterval = setInterval(() => {
      if (!state.isPaused && !state.isGameOver) {
        dispatch({ type: 'UPDATE_MISSION_PROGRESS' });
      }
    }, 1000);
    
    return () => clearInterval(checkInterval);
  }, [state.isPaused, state.isGameOver]);

  useEffect(() => {
    state.activeMissions.forEach(mission => {
      if (mission.status === 'completed') {
        toast({
          title: "Mission Completed!",
          description: `${mission.title}: ${mission.reward}`,
          duration: 5000,
          className: "bg-green-900 border-green-600"
        });
        
        dispatch({ type: 'COMPLETE_MISSION', payload: { missionId: mission.id } });
      }
    });
  }, [state.activeMissions]);

  const updateMissionProgress = (missionId?: string) => {
    dispatch({ type: 'UPDATE_MISSION_PROGRESS', payload: { missionId } });
  };
  
  const completeMission = (missionId: string) => {
    dispatch({ type: 'COMPLETE_MISSION', payload: { missionId } });
  };
  
  const failMission = (missionId: string) => {
    dispatch({ type: 'FAIL_MISSION', payload: { missionId } });
  };

  return { updateMissionProgress, completeMission, failMission };
};
