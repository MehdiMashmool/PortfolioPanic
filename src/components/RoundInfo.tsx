
import { CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { useGame } from '../contexts/GameContext';
import { AlertTriangle, ChevronRight, Flag, Clock } from 'lucide-react';
import { Button } from './ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const RoundInfo = () => {
  const { state, nextRound, endGame } = useGame();
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

  const isRoundComplete = timeRemaining <= 0 && !isGameOver;
  
  return (
    <CardHeader className="pb-2">
      <div className="flex justify-between items-center">
        <CardTitle className="text-lg font-semibold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent flex items-center">
          {isGameOver ? 'Game Over' : `Round ${round}/10`}
          {!isGameOver && <span className="text-sm text-gray-400 ml-2">({Math.min(round * 10, 100)}% complete)</span>}
        </CardTitle>
        <div className={`text-lg font-semibold ${getTimeColor()} flex items-center`}>
          <Clock size={16} className="mr-1.5" />
          {timeRemaining <= 10 && <AlertTriangle size={16} className="mr-1 animate-pulse text-red-500 inline" />}
          {timeRemaining <= 0 ? '0:00' : `${Math.floor(timeRemaining / 60)}:${(Math.floor(timeRemaining) % 60).toString().padStart(2, '0')}`}
        </div>
      </div>
      <Progress 
        value={progressPercentage} 
        className={`h-2 mt-2 ${getBarColor()}`} 
      />
      {timeRemaining <= 10 && !isGameOver && !isRoundComplete && (
        <div className="text-xs text-red-400 mt-1 animate-pulse text-center">
          Time running out! Make your final trades for this round.
        </div>
      )}
      {isRoundComplete && (
        <div className="mt-4 flex gap-2 justify-center">
          <Button 
            onClick={nextRound}
            className="bg-blue-600 hover:bg-blue-700 text-white animate-pulse transition-all flex items-center gap-1 px-4 py-2"
          >
            {round < 10 ? 'Go to Next Round' : 'Complete Game'} <ChevronRight size={16} />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="bg-red-900/50 hover:bg-red-900/80 flex items-center gap-1">
                <Flag size={16} /> End Game
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-[#1A1F2C] border border-white/10">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-red-400">End Game Early?</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-300">
                  Are you sure you want to end the game now? Your final score will be calculated based on your current portfolio value.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-white/10 hover:bg-gray-800">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={endGame} className="bg-red-600 hover:bg-red-700">
                  End Game
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </CardHeader>
  );
};

export default RoundInfo;
