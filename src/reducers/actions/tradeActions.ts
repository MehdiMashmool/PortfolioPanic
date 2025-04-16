
import { GameState } from '../../types/game';

export const handleExecuteTrade = (
  state: GameState,
  payload: { assetId: string; action: 'buy' | 'sell' | 'short' | 'cover'; amount: number; price: number; timestamp?: number }
): GameState => {
  const { assetId, action: tradeAction, amount, price, timestamp = Date.now() } = payload;
  const asset = state.assets.find(a => a.id === assetId);
  if (!asset) return state;

  let newCash = state.cash;
  const newHoldings = { ...state.holdings };
  
  if (!newHoldings[assetId]) {
    newHoldings[assetId] = {
      quantity: 0,
      averageBuyPrice: 0,
      shortQuantity: 0,
      averageShortPrice: 0
    };
  }
  
  const holding = newHoldings[assetId];

  switch (tradeAction) {
    case 'buy': {
      const totalCost = amount * price;
      if (totalCost > newCash) return state;
      const newQuantity = holding.quantity + amount;
      const newAverageBuyPrice = (holding.averageBuyPrice * holding.quantity + totalCost) / newQuantity;
      newCash -= totalCost;
      newHoldings[assetId] = {
        ...holding,
        quantity: newQuantity,
        averageBuyPrice: newAverageBuyPrice
      };
      break;
    }
    
    case 'sell': {
      if (amount > holding.quantity) return state;
      const saleProceeds = amount * price;
      const newQuantity = holding.quantity - amount;
      newCash += saleProceeds;
      newHoldings[assetId] = {
        ...holding,
        quantity: newQuantity,
      };
      break;
    }
    
    case 'short': {
      const shortProceeds = amount * price;
      const newShortQuantity = holding.shortQuantity + amount;
      const newAverageShortPrice = (holding.averageShortPrice * holding.shortQuantity + shortProceeds) / newShortQuantity;
      newCash += shortProceeds;
      newHoldings[assetId] = {
        ...holding,
        shortQuantity: newShortQuantity,
        averageShortPrice: newAverageShortPrice
      };
      break;
    }
    
    case 'cover': {
      if (amount > holding.shortQuantity) return state;
      const coverCost = amount * price;
      if (coverCost > newCash) return state;
      const newShortQuantity = holding.shortQuantity - amount;
      newCash -= coverCost;
      newHoldings[assetId] = {
        ...holding,
        shortQuantity: newShortQuantity,
      };
      break;
    }
  }

  // Calculate current net worth
  let netWorth = newCash;
  Object.entries(newHoldings).forEach(([assetId, holding]) => {
    const asset = state.assets.find(a => a.id === assetId);
    if (asset) {
      netWorth += holding.quantity * asset.price;
      if (holding.shortQuantity > 0) {
        const shortProfit = holding.shortQuantity * (holding.averageShortPrice - asset.price);
        netWorth += shortProfit;
      }
    }
  });

  const updatedNetWorthHistory = [...state.netWorthHistory];
  const lastEntry = updatedNetWorthHistory[updatedNetWorthHistory.length - 1];
  if (Math.abs(netWorth - lastEntry.value) / lastEntry.value > 0.001) {
    updatedNetWorthHistory.push({ 
      round: state.round, 
      value: netWorth,
      timestamp
    });
  }

  return { 
    ...state, 
    cash: newCash, 
    holdings: newHoldings,
    netWorthHistory: updatedNetWorthHistory
  };
};

