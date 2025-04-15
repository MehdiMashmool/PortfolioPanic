
import React from 'react';
import { useGame } from '../contexts/GameContext';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { formatCurrency } from '../utils/marketLogic';
import { Trophy, Frown, ThumbsUp, TrendingUp, TrendingDown } from 'lucide-react';

const GameOverScreen = () => {
  const { state, startGame } = useGame();
  
  const initialValue = state.netWorthHistory[0]?.value || 10000;
  const finalValue = state.netWorthHistory[state.netWorthHistory.length - 1]?.value || 0;
  
  const percentReturn = ((finalValue - initialValue) / initialValue) * 100;
  const isProfit = percentReturn >= 0;
  
  // Determine performance tier
  const getPerformanceTier = () => {
    if (percentReturn >= 50) return { tier: 'Master Investor', icon: <Trophy className="text-gold h-10 w-10" /> };
    if (percentReturn >= 20) return { tier: 'Skilled Trader', icon: <ThumbsUp className="text-profit h-10 w-10" /> };
    if (percentReturn >= 0) return { tier: 'Market Survivor', icon: <TrendingUp className="text-primary h-10 w-10" /> };
    return { tier: 'Unlucky Investor', icon: <TrendingDown className="text-loss h-10 w-10" /> };
  };
  
  const { tier, icon } = getPerformanceTier();
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-panel border-highlight animate-fade-in">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold">Game Over</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center py-4">
            {icon}
            <h3 className="font-bold text-xl mt-2">{tier}</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-dark p-4 rounded-md">
              <p className="text-sm text-neutral mb-1">Starting Value</p>
              <p className="font-bold text-lg">{formatCurrency(initialValue)}</p>
            </div>
            
            <div className="bg-dark p-4 rounded-md">
              <p className="text-sm text-neutral mb-1">Final Value</p>
              <p className="font-bold text-lg">{formatCurrency(finalValue)}</p>
            </div>
            
            <div className="bg-dark p-4 rounded-md col-span-2">
              <p className="text-sm text-neutral mb-1">Total Return</p>
              <p className={`font-bold text-xl ${isProfit ? 'text-profit' : 'text-loss'}`}>
                {isProfit ? '+' : ''}{percentReturn.toFixed(2)}%
              </p>
            </div>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button className="w-full" onClick={startGame}>
            Play Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default GameOverScreen;
