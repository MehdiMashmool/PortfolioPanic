
import { useGame } from '../contexts/GameContext';
import GameDashboard from '../components/GameDashboard';
import StartScreen from '../components/StartScreen';
import GameOverScreen from '../components/GameOverScreen';

const Index = () => {
  const { state } = useGame();
  
  // Show the appropriate screen based on game state
  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden">
      {!state.round || (state.isPaused && state.round === 1 && state.timeRemaining === 60) ? (
        <StartScreen />
      ) : (
        <GameDashboard />
      )}
      
      {state.isGameOver && <GameOverScreen />}
    </div>
  );
};

export default Index;
