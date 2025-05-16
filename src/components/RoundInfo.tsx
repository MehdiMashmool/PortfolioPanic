import { CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { useGame } from "../contexts/GameContext";
import {
  AlertTriangle,
  ChevronRight,
  Flag,
  Clock,
  TrendingUp,
  Target,
} from "lucide-react";
import { Button } from "./ui/button";
import RoundMissions from "./RoundMissions";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RoundInfoProps {
  hideMissions?: boolean;
  compactMode?: boolean;
}

const RoundInfo: React.FC<RoundInfoProps> = ({
  hideMissions = false,
  compactMode = false,
}) => {
  const { state, nextRound, endGame } = useGame();
  const { round, timeRemaining, isGameOver, activeMissions } = state;

  // Calculate progress percentage
  const progressPercentage = (timeRemaining / 60) * 100;

  // Determine color based on time remaining
  const getTimeColor = () => {
    if (timeRemaining <= 10) return "text-red-500 animate-pulse font-bold";
    if (timeRemaining <= 20) return "text-amber-500 font-bold";
    return "text-white";
  };

  const getBarColor = () => {
    if (timeRemaining <= 10) return "bg-red-500";
    if (timeRemaining <= 20) return "bg-amber-500";
    return "bg-stale-500";
  };

  const isRoundComplete = timeRemaining <= 0 && !isGameOver;

  // Calculate portfolio goals
  const portfolioGoal = 10000 + (round - 1) * 3000;
  const currentNetWorth =
    state.netWorthHistory[state.netWorthHistory.length - 1]?.value || 10000;
  const hasReachedGoal = currentNetWorth >= portfolioGoal;

  if (compactMode) {
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center w-full">
            <span className="text-gray-400 block grow text-xl">
              Portfolio Goal:
            </span>
            <div className="ml-2 flex items-center">
              <span
                className={`text-xl ${
                  hasReachedGoal ? "text-green-400" : "text-amber-400"
                }`}
              >
                ${portfolioGoal.toLocaleString()}
              </span>
              {hasReachedGoal && (
                <span className="ml-1 px-1 py-0.5 text-[10px] bg-green-900/50 text-green-300 rounded-sm">
                  REACHED
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Clock
            size={16}
            className={`${
              timeRemaining <= 10 ? "text-red-500 animate-pulse" : "text-white"
            }`}
          />
          <div className={`text-sm font-medium ${getTimeColor()}`}>
            {timeRemaining <= 0
              ? "0:00"
              : `${Math.floor(timeRemaining / 60)}:${(
                  Math.floor(timeRemaining) % 60
                )
                  .toString()
                  .padStart(2, "0")}`}
          </div>
        </div>

        <Progress
          value={progressPercentage}
          className={`h-2 ${getBarColor()}`}
        />

        {isRoundComplete && (
          <div className="flex justify-center mt-2">
            <Button
              size="lg"
              onClick={nextRound}
              className="w-full py-4 text-xl"
            >
              {round < 10 ? "Next Round" : "Complete Game"}{" "}
              <ChevronRight size={24} />
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <CardHeader className="pb-2">
      <div className="flex justify-between items-center">
        <CardTitle className="text-lg font-semibold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent flex items-center">
          {isGameOver ? "Game Over" : `Round ${round}/10`}
          {!isGameOver && (
            <span className="text-sm text-gray-400 ml-2">
              ({Math.min(round * 10, 100)}% complete)
            </span>
          )}
        </CardTitle>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={`text-lg px-2 py-1 rounded-md ${
                  timeRemaining <= 10
                    ? "bg-red-900/50 shadow-glow-red animate-pulse"
                    : timeRemaining <= 20
                    ? "bg-amber-900/50"
                    : "bg-blue-900/30"
                } font-bold ${getTimeColor()} flex items-center`}
              >
                <Clock
                  size={16}
                  className={`mr-1.5 ${
                    timeRemaining <= 10 ? "animate-spin-slow" : ""
                  }`}
                />
                {timeRemaining <= 10 && (
                  <AlertTriangle
                    size={16}
                    className="mr-1 animate-pulse text-red-500 inline"
                  />
                )}
                {timeRemaining <= 0
                  ? "0:00"
                  : `${Math.floor(timeRemaining / 60)}:${(
                      Math.floor(timeRemaining) % 60
                    )
                      .toString()
                      .padStart(2, "0")}`}
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-dark border-highlight">
              <p className="text-xs">Time remaining in this round</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Portfolio Goal Section */}
      <div className="mt-2 mb-2 p-2 bg-amber-900/20 border border-amber-900/30 rounded-md">
        <div className="flex justify-between items-center">
          <span className="block grow text-lg"> Round Goal:</span>
          <div className="flex items-center">
            <span
              className={`font-bold ${
                hasReachedGoal ? "text-green-400" : "text-amber-400"
              }`}
            >
              ${portfolioGoal.toLocaleString()}
            </span>
            {hasReachedGoal && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-green-900/50 text-green-300 rounded-sm flex items-center">
                <TrendingUp size={12} className="mr-1" /> ACHIEVED
              </span>
            )}
          </div>
        </div>

        <div className="mt-1 text-xs text-neutral">
          Current value: ${currentNetWorth.toLocaleString()}(
          {hasReachedGoal ? (
            <span className="text-green-400">
              +${(currentNetWorth - portfolioGoal).toLocaleString()}
            </span>
          ) : (
            <span className="text-amber-400">
              -${(portfolioGoal - currentNetWorth).toLocaleString()}
            </span>
          )}
          )
        </div>

        <Progress
          value={(currentNetWorth / portfolioGoal) * 100}
          className={`h-1.5 mt-1 ${
            hasReachedGoal ? "bg-green-900/30" : "bg-amber-900/30"
          }`}
        />
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

      {/* Only show missions if not hidden */}
      {!hideMissions && (
        <div className="mt-4">
          <RoundMissions missions={activeMissions} />
        </div>
      )}

      {isRoundComplete && (
        <div className="mt-4 flex gap-2 justify-center">
          <Button
            onClick={nextRound}
            className="bg-blue-600 hover:bg-blue-700 text-white animate-pulse transition-all flex items-center gap-1 px-4 py-2"
          >
            {round < 10 ? "Go to Next Round" : "Complete Game"}{" "}
            <ChevronRight size={16} />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="bg-red-900/50 hover:bg-red-900/80 flex items-center gap-1"
              >
                <Flag size={16} /> End Game
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-[#1A1F2C] border border-white/10">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-red-400">
                  End Game Early?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-gray-300">
                  Are you sure you want to end the game now? Your final score
                  will be calculated based on your current portfolio value.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-white/10 hover:bg-gray-800">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={endGame}
                  className="bg-red-600 hover:bg-red-700"
                >
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
