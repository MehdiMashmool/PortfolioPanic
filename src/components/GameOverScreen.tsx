
import React, { useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { formatCurrency } from '../utils/marketLogic';
import { Trophy, Frown, ThumbsUp, TrendingUp, TrendingDown, BarChart3, Home, RefreshCw, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Separator } from './ui/separator';
import { supabase } from '../integrations/supabase/client';
import { toast } from '../hooks/use-toast';

const GameOverScreen = () => {
  const { state, startGame } = useGame();
  const navigate = useNavigate();
  
  const initialValue = state.netWorthHistory[0]?.value || 10000;
  const finalValue = state.netWorthHistory[state.netWorthHistory.length - 1]?.value || 0;
  
  const percentReturn = ((finalValue - initialValue) / initialValue) * 100;
  const isProfit = percentReturn >= 0;
  
  // Determine performance tier
  const getPerformanceTier = () => {
    if (percentReturn >= 50) return { 
      tier: 'Master Investor', 
      icon: <Trophy className="text-amber-400 h-10 w-10" />,
      description: "Exceptional market insight! You've mastered the art of timing."
    };
    if (percentReturn >= 20) return { 
      tier: 'Skilled Trader', 
      icon: <ThumbsUp className="text-blue-400 h-10 w-10" />,
      description: "Strong performance with good market timing and asset selection."
    };
    if (percentReturn >= 0) return { 
      tier: 'Market Survivor', 
      icon: <TrendingUp className="text-primary h-10 w-10" />,
      description: "You managed to stay above water in challenging conditions."
    };
    if (percentReturn >= -25) return { 
      tier: 'Unlucky Investor', 
      icon: <TrendingDown className="text-orange-400 h-10 w-10" />,
      description: "Market volatility took a toll on your portfolio."
    };
    return { 
      tier: 'Devastating Loss', 
      icon: <Frown className="text-red-400 h-10 w-10" />,
      description: "Extreme market conditions crushed your investments."
    };
  };
  
  const { tier, icon, description } = getPerformanceTier();
  
  // Find best and worst performing assets
  const findBestAndWorstAssets = () => {
    const assetPerformance = state.assets.map(asset => {
      const initialHolding = state.holdings[asset.id]?.quantity || 0;
      const currentValue = initialHolding * asset.price;
      const initialPrice = asset.price / (1 + (asset.price - asset.previousPrice) / asset.previousPrice);
      const initialValue = initialHolding * initialPrice;
      const percentChange = initialValue > 0 ? ((currentValue - initialValue) / initialValue) * 100 : 0;
      
      return {
        name: asset.name,
        percentChange
      };
    });
    
    assetPerformance.sort((a, b) => b.percentChange - a.percentChange);
    
    return {
      best: assetPerformance[0] || { name: 'None', percentChange: 0 },
      worst: assetPerformance[assetPerformance.length - 1] || { name: 'None', percentChange: 0 }
    };
  };
  
  const { best, worst } = findBestAndWorstAssets();
  
  // Get a lesson based on performance
  const getLesson = () => {
    if (percentReturn >= 20) {
      return "Diversification and responding quickly to market events pays off.";
    } else if (percentReturn >= 0) {
      return "Steady investing and careful risk management helps weather volatility.";
    } else if (percentReturn >= -25) {
      return "Consider a more diversified portfolio and watch market health indicators closely.";
    } else {
      return "High-risk strategies can lead to significant losses. Next time, diversify more and respond faster to negative news.";
    }
  };
  
  // Save high score to Supabase when game ends
  useEffect(() => {
    const saveHighScore = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Check if user already has a high score
          const { data: existingScore } = await supabase
            .from('high_scores')
            .select('portfolio_value')
            .eq('user_id', user.id)
            .single();
          
          if (!existingScore || finalValue > existingScore.portfolio_value) {
            if (existingScore) {
              // Update existing score if new value is higher
              await supabase
                .from('high_scores')
                .update({ portfolio_value: finalValue, achieved_at: new Date().toISOString() })
                .eq('user_id', user.id);
            } else {
              // Create new score
              await supabase
                .from('high_scores')
                .insert({ user_id: user.id, portfolio_value: finalValue });
            }
            
            if (!existingScore || finalValue > existingScore.portfolio_value) {
              toast({
                title: "New High Score!",
                description: `Your score of ${formatCurrency(finalValue)} has been recorded!`,
                duration: 5000,
              });
            }
          }
        }
      } catch (error) {
        console.error("Error saving high score:", error);
      }
    };
    
    saveHighScore();
  }, [finalValue]);
  
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fade-in">
      <Card className="w-full max-w-2xl bg-panel border-highlight shadow-lg overflow-y-auto max-h-[90vh]">
        <CardHeader className="text-center border-b border-highlight pb-4">
          <CardTitle className="text-3xl font-bold text-gradient-primary">Game Over</CardTitle>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col items-center justify-center py-4">
            {icon}
            <h3 className="font-bold text-2xl mt-2 text-center">{tier}</h3>
            <p className="text-gray-300 text-center mt-1">{description}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
            <div className="bg-dark p-4 rounded-md border border-highlight/30">
              <p className="text-sm text-neutral mb-1">Starting Value</p>
              <p className="font-bold text-lg">{formatCurrency(initialValue)}</p>
            </div>
            
            <div className="bg-dark p-4 rounded-md border border-highlight/30">
              <p className="text-sm text-neutral mb-1">Final Value</p>
              <p className="font-bold text-lg">{formatCurrency(finalValue)}</p>
            </div>
            
            <div className="bg-dark p-4 rounded-md col-span-2 border border-highlight/30">
              <p className="text-sm text-neutral mb-1">Total Return</p>
              <p className={`font-bold text-xl ${isProfit ? 'text-profit' : 'text-loss'}`}>
                {isProfit ? '+' : ''}{percentReturn.toFixed(2)}%
              </p>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center">
              <BarChart3 className="mr-2 text-primary h-5 w-5" />
              Performance Analysis
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-dark/50 p-4 rounded-md border border-highlight/30">
                <h4 className="text-sm text-neutral mb-2">Best Performing Asset</h4>
                <p className="font-medium">{best.name}</p>
                <p className={`text-sm ${best.percentChange >= 0 ? 'text-profit' : 'text-loss'}`}>
                  {best.percentChange >= 0 ? '+' : ''}{best.percentChange.toFixed(1)}%
                </p>
              </div>
              
              <div className="bg-dark/50 p-4 rounded-md border border-highlight/30">
                <h4 className="text-sm text-neutral mb-2">Worst Performing Asset</h4>
                <p className="font-medium">{worst.name}</p>
                <p className={`text-sm ${worst.percentChange >= 0 ? 'text-profit' : 'text-loss'}`}>
                  {worst.percentChange >= 0 ? '+' : ''}{worst.percentChange.toFixed(1)}%
                </p>
              </div>
            </div>
            
            <div className="bg-dark/50 p-4 rounded-md border border-highlight/30">
              <h4 className="text-sm text-neutral mb-2">Lesson Learned</h4>
              <p className="text-sm">{getLesson()}</p>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="gap-3 border-t border-highlight pt-4 flex flex-col sm:flex-row">
          <Button 
            variant="outline"
            className="w-full sm:w-auto border-primary/50 hover:bg-primary/20" 
            onClick={() => navigate('/')}
          >
            <Home className="mr-2 h-4 w-4" />
            Main Menu
          </Button>
          <Button 
            className="w-full sm:w-auto bg-primary hover:bg-primary/90" 
            onClick={startGame}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Play Again
          </Button>
          <Button 
            variant="outline"
            className="w-full sm:w-auto border-highlight/50 hover:bg-highlight/20"
            onClick={() => navigate('/leaderboard')}
          >
            <Trophy className="mr-2 h-4 w-4 text-amber-400" />
            Leaderboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default GameOverScreen;
