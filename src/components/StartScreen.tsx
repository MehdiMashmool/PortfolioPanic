
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { useGame } from '../contexts/GameContext';
import { TrendingUp, DollarSign, Banknote, BarChart3 } from 'lucide-react';

const StartScreen = () => {
  const { startGame } = useGame();
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md bg-panel border-highlight">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold mb-2">Portfolio Panic</CardTitle>
          <CardDescription className="text-neutral">
            A financial trading simulation game
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-dark p-3 rounded-md">
              <div className="flex items-center mb-2">
                <TrendingUp size={18} className="mr-2 text-profit" />
                <h3 className="font-semibold">Trade Assets</h3>
              </div>
              <p className="text-xs text-neutral">Buy low and sell high across multiple asset classes.</p>
            </div>
            
            <div className="bg-dark p-3 rounded-md">
              <div className="flex items-center mb-2">
                <DollarSign size={18} className="mr-2 text-gold" />
                <h3 className="font-semibold">Manage Risk</h3>
              </div>
              <p className="text-xs text-neutral">Diversify your portfolio to protect against market crashes.</p>
            </div>
            
            <div className="bg-dark p-3 rounded-md">
              <div className="flex items-center mb-2">
                <Banknote size={18} className="mr-2 text-primary" />
                <h3 className="font-semibold">Build Wealth</h3>
              </div>
              <p className="text-xs text-neutral">Grow your initial $10,000 investment over 10 rounds.</p>
            </div>
            
            <div className="bg-dark p-3 rounded-md">
              <div className="flex items-center mb-2">
                <BarChart3 size={18} className="mr-2 text-crypto" />
                <h3 className="font-semibold">React to News</h3>
              </div>
              <p className="text-xs text-neutral">Adapt your strategy to news and market events.</p>
            </div>
          </div>
          
          <div className="bg-dark p-4 rounded-md">
            <h3 className="font-semibold mb-2">How to Play</h3>
            <ul className="space-y-2 text-sm text-neutral">
              <li className="flex">
                <span className="font-bold mr-2">1.</span>
                <span>Manage your $10,000 starting portfolio over 10 rounds of 60 seconds each.</span>
              </li>
              <li className="flex">
                <span className="font-bold mr-2">2.</span>
                <span>Click on assets to buy/sell and build a diverse portfolio.</span>
              </li>
              <li className="flex">
                <span className="font-bold mr-2">3.</span>
                <span>Watch for news events that impact asset prices.</span>
              </li>
              <li className="flex">
                <span className="font-bold mr-2">4.</span>
                <span>Maximize your total portfolio value by the final round.</span>
              </li>
            </ul>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button className="w-full" onClick={startGame}>
            Start Game
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default StartScreen;
