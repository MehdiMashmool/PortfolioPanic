
import { useGame } from '../contexts/GameContext';
import GameDashboard from '../components/GameDashboard';
import StartScreen from '../components/StartScreen';
import GameOverScreen from '../components/GameOverScreen';

const Index = () => {
  const { state } = useGame();
  
  // Show the appropriate screen based on game state
  return (
    <div className="min-h-screen h-screen flex flex-col bg-background">
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
