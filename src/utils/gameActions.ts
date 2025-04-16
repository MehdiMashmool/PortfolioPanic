
import { GameState, TradeAction } from '../types/game';
import { toast } from '@/hooks/use-toast';
import { updateAssetPriceHistory, updatePortfolioHistory } from './chartUtils';
import { supabase } from '../integrations/supabase/client';

export const calculateNetWorth = (state: GameState) => {
  let netWorth = state.cash;
  
  Object.entries(state.holdings).forEach(([assetId, holding]) => {
    const asset = state.assets.find(a => a.id === assetId);
    if (asset) {
      netWorth += holding.quantity * asset.price;
      if (holding.shortQuantity > 0) {
        const shortProfit = holding.shortQuantity * (holding.averageShortPrice - asset.price);
        netWorth += shortProfit;
      }
    }
  });
  
  return netWorth;
};

export const executeTrade = (
  state: GameState,
  dispatch: React.Dispatch<any>,
  assetId: string,
  action: TradeAction,
  amount: number
) => {
  if (state.isGameOver) return;
  
  const asset = state.assets.find(a => a.id === assetId);
  if (!asset) return;
  
  dispatch({ 
    type: 'EXECUTE_TRADE', 
    payload: { assetId, action, amount, price: asset.price, timestamp: Date.now() } 
  });
};

export const startGame = (state: GameState, dispatch: React.Dispatch<any>) => {
  const now = Date.now();
  dispatch({ type: 'START_GAME' });
  
  state.assets.forEach(asset => {
    updateAssetPriceHistory(asset.id, asset.price, now);
  });
  
  const startingNetWorth = calculateNetWorth(state);
  updatePortfolioHistory(startingNetWorth, now);
  
  toast({
    title: "Game Started",
    description: "Good luck, trader!",
    duration: 2000
  });
};

export const endGame = async (state: GameState, dispatch: React.Dispatch<any>) => {
  dispatch({ type: 'END_GAME' });
  
  // Save high score
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const finalValue = calculateNetWorth(state);
      await supabase
        .from('high_scores')
        .insert({
          user_id: user.id,
          portfolio_value: finalValue,
          achieved_at: new Date().toISOString()
        });
    }
  } catch (error) {
    console.error('Error saving high score:', error);
  }
  
  toast({
    title: "Game Over",
    description: "Your trading session has ended.",
    duration: 2000
  });
};

export const nextRound = (state: GameState, dispatch: React.Dispatch<any>) => {
  if (state.round >= 10) {
    endGame(state, dispatch);
  } else {
    dispatch({ type: 'NEXT_ROUND' });
    toast({
      title: `Round ${state.round + 1}`,
      description: "A new round begins!",
      duration: 2000
    });
  }
};
