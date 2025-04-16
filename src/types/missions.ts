
export type MissionType = 
  | 'diversify' 
  | 'survive-crash' 
  | 'react-to-news'
  | 'flight-to-safety'
  | 'government-stimulus'
  | 'market-timing'
  | 'value-investing'
  | 'short-selling'
  | 'sector-rotation'
  | 'risk-management';

export type MissionStatus = 'active' | 'completed' | 'failed';

export interface Mission {
  id: string;
  type: MissionType;
  title: string;
  description: string;
  round: number;
  status: MissionStatus;
  reward?: string;
  rewardValue?: number;
  icon?: string;
  progressRequired?: number;
  currentProgress?: number;
}

export type MissionCollection = {
  [key: number]: Mission[];
};
