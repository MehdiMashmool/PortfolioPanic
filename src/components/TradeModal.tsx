
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from './ui/dialog';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Slider } from './ui/slider';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { useGame } from '../contexts/GameContext';
import { formatCurrency } from '../utils/marketLogic';

interface TradeModalProps {
  assetId: string;
  assetName: string;
  onClose: () => void;
}

const TradeModal: React.FC<TradeModalProps> = ({ assetId, assetName, onClose }) => {
  const { state, executeTrade } = useGame();
  const asset = state.assets.find(a => a.id === assetId);
  const holding = state.holdings[assetId] || { quantity: 0, shortQuantity: 0, averageBuyPrice: 0, averageShortPrice: 0 };
  
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState<number>(1);
  const [valueType, setValueType] = useState<'units' | 'dollars'>('units');
  
  if (!asset) return null;
  
  const maxBuyUnits = Math.floor(state.cash / asset.price);
  const maxSellUnits = holding.quantity;
  const maxShortUnits = 20; // Arbitrary limit for shorting
  const maxCoverUnits = holding.shortQuantity;
  
  const getMaxUnits = () => {
    if (tradeType === 'buy') return maxBuyUnits;
    if (tradeType === 'sell' && asset) return maxSellUnits;
    return 0;
  };
  
  const handleValueTypeChange = (newValueType: 'units' | 'dollars') => {
    setValueType(newValueType);
    if (newValueType === 'units') {
      setAmount(1);
    } else {
      setAmount(asset.price);
    }
  };
  
  const handleSliderChange = (value: number[]) => {
    setAmount(value[0]);
  };
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    if (!isNaN(newValue) && newValue >= 0) {
      setAmount(newValue);
    }
  };
  
  const getMaxValue = () => {
    if (valueType === 'units') {
      return getMaxUnits();
    } else {
      if (tradeType === 'buy') {
        return state.cash;
      } else if (tradeType === 'sell') {
        return holding.quantity * asset.price;
      } else if (tradeType === 'short') {
        return maxShortUnits * asset.price;
      } else {
        return maxCoverUnits * asset.price;
      }
    }
  };
  
  const calculateUnits = () => {
    if (valueType === 'units') {
      return amount;
    } else {
      return Math.floor(amount / asset.price);
    }
  };
  
  const calculateTotal = () => {
    const units = calculateUnits();
    return units * asset.price;
  };
  
  const handleExecuteTrade = () => {
    const units = calculateUnits();
    if (units <= 0) return;
    
    // Determine trade action type
    let action: 'buy' | 'sell' | 'short' | 'cover';
    
    if (tradeType === 'buy') {
      action = 'buy';
    } else {
      action = 'sell';
    }
    
    executeTrade(assetId, action, units);
    onClose();
  };
  
  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md bg-panel border-highlight">
        <DialogHeader>
          <DialogTitle>Trade {assetName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex justify-between text-sm">
            <span>Current Price:</span>
            <span className="font-semibold">{formatCurrency(asset.price)}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span>Cash Available:</span>
            <span className="font-semibold">{formatCurrency(state.cash)}</span>
          </div>
          
          {holding.quantity > 0 && (
            <div className="flex justify-between text-sm">
              <span>Current Holdings:</span>
              <span className="font-semibold">{holding.quantity} units</span>
            </div>
          )}
          
          <Tabs defaultValue="buy" className="w-full" onValueChange={(val) => setTradeType(val as 'buy' | 'sell')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="buy">Buy</TabsTrigger>
              <TabsTrigger value="sell" disabled={holding.quantity <= 0}>Sell</TabsTrigger>
            </TabsList>
            
            <TabsContent value="buy" className="space-y-4">
              <RadioGroup 
                defaultValue="units" 
                className="flex space-x-2"
                onValueChange={(val) => handleValueTypeChange(val as 'units' | 'dollars')}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="units" id="buy-units" />
                  <Label htmlFor="buy-units">Units</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dollars" id="buy-dollars" />
                  <Label htmlFor="buy-dollars">Dollars</Label>
                </div>
              </RadioGroup>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Amount:</span>
                  <span>Max: {valueType === 'units' ? getMaxUnits() : formatCurrency(getMaxValue())}</span>
                </div>
                <Input
                  type="number"
                  value={amount}
                  onChange={handleAmountChange}
                  min={0}
                  max={getMaxValue()}
                  step={valueType === 'units' ? 1 : asset.price}
                  className="bg-dark"
                />
                <Slider
                  defaultValue={[1]}
                  max={getMaxValue()}
                  step={valueType === 'units' ? 1 : asset.price / 10}
                  value={[amount]}
                  onValueChange={handleSliderChange}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="sell" className="space-y-4">
              <RadioGroup 
                defaultValue="units" 
                className="flex space-x-2"
                onValueChange={(val) => handleValueTypeChange(val as 'units' | 'dollars')}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="units" id="sell-units" />
                  <Label htmlFor="sell-units">Units</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dollars" id="sell-dollars" />
                  <Label htmlFor="sell-dollars">Dollars</Label>
                </div>
              </RadioGroup>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Amount:</span>
                  <span>Max: {valueType === 'units' ? maxSellUnits : formatCurrency(maxSellUnits * asset.price)}</span>
                </div>
                <Input
                  type="number"
                  value={amount}
                  onChange={handleAmountChange}
                  min={0}
                  max={valueType === 'units' ? maxSellUnits : maxSellUnits * asset.price}
                  step={valueType === 'units' ? 1 : asset.price}
                  className="bg-dark"
                />
                <Slider
                  defaultValue={[1]}
                  max={valueType === 'units' ? maxSellUnits : maxSellUnits * asset.price}
                  step={valueType === 'units' ? 1 : asset.price / 10}
                  value={[amount]}
                  onValueChange={handleSliderChange}
                />
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="pt-2 border-t border-highlight">
            <div className="flex justify-between text-sm">
              <span>Units to {tradeType}:</span>
              <span>{calculateUnits()}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total:</span>
              <span>{formatCurrency(calculateTotal())}</span>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleExecuteTrade}
            disabled={calculateUnits() <= 0 || 
                     (tradeType === 'buy' && calculateTotal() > state.cash) ||
                     (tradeType === 'sell' && calculateUnits() > holding.quantity)}
          >
            Confirm {tradeType}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TradeModal;
