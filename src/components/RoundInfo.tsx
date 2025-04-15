
import { CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { useGame } from '../contexts/GameContext';
import { Clock, AlertTriangle } from 'lucide-react';

const RoundInfo = () => {
  const { state } = useGame();
  const { round, timeRemaining, isGameOver } = state;
  
  // Calculate progress percentage
  const progressPercentage = (timeRemaining / 60) * 100;
  
  // Determine color based on time remaining
  const getTimeColor = () => {
    if (timeRemaining <= 10) return 'text-red-500 animate-pulse font-bold';
    if (timeRemaining <= 20) return 'text-amber-500 font-bold';
    return 'text-white';
  };
  
  const getBarColor = () => {
    if (timeRemaining <= 10) return 'bg-red-500';
    if (timeRemaining <= 20) return 'bg-amber-500';
    return 'bg-blue-500';
  };
  
  return (
    <CardHeader className="pb-2">
      <div className="flex justify-between items-center">
        <CardTitle className="text-lg font-semibold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent flex items-center">
          {isGameOver ? 'Game Over' : `Round ${round}/10`}
        </CardTitle>
        <div className={`text-lg font-semibold flex items-center ${getTimeColor()}`}>
          {timeRemaining <= 10 && <AlertTriangle size={16} className="mr-1 animate-pulse text-red-500" />}
          <Clock size={16} className="mr-1" />
          {timeRemaining <= 0 ? '0:00' : `${Math.floor(timeRemaining / 60)}:${(Math.floor(timeRemaining) % 60).toString().padStart(2, '0')}`}
        </div>
      </div>
      <Progress 
        value={progressPercentage} 
        className={`h-2 mt-2 ${getBarColor()}`} 
      />
      {timeRemaining <= 10 && !isGameOver && (
        <div className="text-xs text-red-400 mt-1 animate-pulse text-center">
          Time running out! Make your final trades for this round.
        </div>
      )}
    </CardHeader>
  );
};

export default RoundInfo;
