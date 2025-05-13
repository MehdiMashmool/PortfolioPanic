import GameDashboard from "../components/GameDashboard";
import GameOverScreen from "../components/GameOverScreen";
import StartScreen from "../components/StartScreen";
import { GameProvider, useGame } from "../contexts/GameContext";

// Game wrapper component that uses the useGame hook
const GameWrapper = () => {
  const { state } = useGame();

  // Show the appropriate screen based on game state
  return (
    <div className="min-h-screen bg-background">
      {!state.round ||
      (state.isPaused && state.round === 1 && state.timeRemaining === 60) ? (
        <StartScreen />
      ) : (
        <GameDashboard />
      )}

      {state.isGameOver && <GameOverScreen />}
    </div>
  );
};

// Main index component that wraps everything with the GameProvider
const Index = () => {
  return (
    <GameProvider>
      <GameWrapper />
    </GameProvider>
  );
};

export default Index;
