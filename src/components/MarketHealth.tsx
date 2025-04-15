
import { Progress } from './ui/progress';

interface MarketHealthProps {
  health: number;
}

const MarketHealth: React.FC<MarketHealthProps> = ({ health }) => {
  // Determine color based on health
  const getHealthColor = () => {
    if (health > 75) return 'bg-profit';
    if (health > 40) return 'bg-gold';
    return 'bg-loss';
  };
  
  // Determine status text
  const getStatusText = () => {
    if (health > 75) return 'Stable';
    if (health > 40) return 'Volatile';
    return 'Unstable';
  };
  
  return (
    <div className="flex flex-col items-end">
      <div className="flex items-center space-x-2 mb-1">
        <span className="text-xs text-neutral">Market Status:</span>
        <span className="text-xs font-medium">{getStatusText()}</span>
      </div>
      <div className="flex items-center space-x-2 w-36">
        <Progress 
          value={health} 
          className={`h-2 ${getHealthColor()}`}
        />
      </div>
    </div>
  );
};

export default MarketHealth;
