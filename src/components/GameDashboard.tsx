
import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { formatCurrency, getPriceChangeColor } from '../utils/marketLogic';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import AssetPanel from './AssetPanel';
import HoldingsList from './HoldingsList';
import NewsPanel from './NewsPanel';
import TradeModal from './TradeModal';
import PerformanceChart from './PerformanceChart';
import RoundInfo from './RoundInfo';
import MarketHealth from './MarketHealth';

type SelectedAsset = {
  id: string;
  name: string;
} | null;

const GameDashboard: React.FC = () => {
  const { state, calculateNetWorth, startGame, pauseGame, resumeGame, endGame, nextRound } = useGame();
  const [selectedAsset, setSelectedAsset] = useState<SelectedAsset>(null);
  
  const netWorth = calculateNetWorth();
  const netWorthChange = state.netWorthHistory.length > 1
    ? netWorth - state.netWorthHistory[0].value
    : 0;
  const netWorthPercentChange = (netWorthChange / state.netWorthHistory[0].value) * 100;
  
  const handleAssetClick = (id: string, name: string) => {
    setSelectedAsset({ id, name });
  };
  
  const handleCloseModal = () => {
    setSelectedAsset(null);
  };
  
  const handleGameAction = () => {
    if (state.isGameOver) {
      startGame();
    } else if (state.timeRemaining <= 0) {
      nextRound();
    } else if (state.isPaused) {
      resumeGame();
    } else {
      pauseGame();
    }
  };
  
  const getActionButtonText = () => {
    if (state.isGameOver) return "New Game";
    if (state.timeRemaining <= 0) return "Next Round";
    return state.isPaused ? "Resume" : "Pause";
  };
  
  return (
    <div className="container px-4 mx-auto py-8">
      <div className="flex flex-col space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Card className="bg-panel border-highlight">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-neutral">Portfolio Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">{formatCurrency(netWorth)}</div>
              <div className={`text-sm ${getPriceChangeColor(netWorthChange)}`}>
                {netWorthChange > 0 ? '↑' : netWorthChange < 0 ? '↓' : ''} {formatCurrency(Math.abs(netWorthChange))} ({netWorthPercentChange.toFixed(2)}%)
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-panel border-highlight">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-neutral">Available Cash</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(state.cash)}</div>
              <div className="text-sm text-neutral">Ready to invest</div>
            </CardContent>
          </Card>
          
          <Card className="bg-panel border-highlight">
            <RoundInfo />
            <CardContent className="pt-0">
              <Button 
                className="w-full"
                variant={state.isGameOver ? "default" : state.timeRemaining <= 0 ? "default" : state.isPaused ? "default" : "secondary"}
                onClick={handleGameAction}
              >
                {getActionButtonText()}
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <Card className="bg-panel border-highlight">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Performance</CardTitle>
                  <MarketHealth health={state.marketHealth} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <PerformanceChart data={state.netWorthHistory} />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-panel border-highlight">
              <CardHeader>
                <CardTitle>Market Assets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {state.assets.map(asset => (
                    <AssetPanel 
                      key={asset.id}
                      asset={asset}
                      onClick={() => handleAssetClick(asset.id, asset.name)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-4">
            <Card className="bg-panel border-highlight">
              <CardHeader>
                <CardTitle>Your Holdings</CardTitle>
              </CardHeader>
              <CardContent>
                <HoldingsList />
              </CardContent>
            </Card>
            
            <Card className="bg-panel border-highlight">
              <CardHeader>
                <CardTitle>Market News</CardTitle>
              </CardHeader>
              <CardContent>
                <NewsPanel />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {selectedAsset && (
        <TradeModal
          assetId={selectedAsset.id}
          assetName={selectedAsset.name}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default GameDashboard;
