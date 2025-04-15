
import { CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { useGame } from '../contexts/GameContext';

const RoundInfo = () => {
  const { state } = useGame();
  const { round, timeRemaining, isGameOver } = state;
  
  // Calculate progress percentage
  const progressPercentage = (timeRemaining / 60) * 100;
  
  return (
    <CardHeader className="pb-2">
      <div className="flex justify-between items-center">
        <CardTitle className="text-lg font-semibold text-neutral">
          {isGameOver ? 'Game Over' : `Round ${round}/10`}
        </CardTitle>
        <div className="text-lg font-semibold">
          {timeRemaining <= 0 ? '0:00' : `${Math.floor(timeRemaining / 60)}:${(Math.floor(timeRemaining) % 60).toString().padStart(2, '0')}`}
        </div>
      </div>
      <Progress value={progressPercentage} className="h-2 mt-2" />
    </CardHeader>
  );
};

export default RoundInfo;
