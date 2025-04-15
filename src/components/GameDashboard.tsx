
import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { formatCurrency } from '../utils/marketLogic';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import AssetPanel from './AssetPanel';
import HoldingsList from './HoldingsList';
import NewsPanel from './NewsPanel';
import TradeModal from './TradeModal';
import PerformanceChart from './PerformanceChart';
import RoundInfo from './RoundInfo';
import MarketHealth from './MarketHealth';
import { Bell, Clock, Settings } from 'lucide-react';

type SelectedAsset = {
  id: string;
  name: string;
} | null;

const GameDashboard: React.FC = () => {
  const { state, calculateNetWorth, startGame, pauseGame, resumeGame, endGame } = useGame();
  const [selectedAsset, setSelectedAsset] = useState<SelectedAsset>(null);
  
  const netWorth = calculateNetWorth();
  const netWorthChange = state.netWorthHistory.length > 1
    ? netWorth - state.netWorthHistory[0].value
    : 0;
  const netWorthPercentChange = (netWorthChange / state.netWorthHistory[0].value) * 100;
  
  const handleAssetClick = (id: string, name: string) => {
    setSelectedAsset({ id, name });
  };
  
  return (
    <div className="min-h-screen bg-[#0B1222] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0F172A]/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">PORTFOLIO PANIC</h1>
            <span className="bg-orange-500 text-xs px-2 py-0.5 rounded-full">t:00</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm">Round {state.round}/10</div>
            <Bell className="w-5 h-5 text-gray-400 cursor-pointer hover:text-white transition-colors" />
            <Clock className="w-5 h-5 text-gray-400 cursor-pointer hover:text-white transition-colors" />
            <Settings className="w-5 h-5 text-gray-400 cursor-pointer hover:text-white transition-colors" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-[#0F172A]/80 border-white/10 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-400">Current Portfolio Value</div>
                  <div className="text-2xl font-bold mt-1">{formatCurrency(netWorth)}</div>
                  <div className={`text-sm ${netWorthChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {netWorthChange >= 0 ? '+' : ''}{netWorthPercentChange.toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Invested</div>
                  <div className="text-2xl font-bold mt-1">$0</div>
                  <div className="text-sm text-gray-400">0% of portfolio</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Available Cash</div>
                  <div className="text-2xl font-bold mt-1">{formatCurrency(state.cash)}</div>
                  <div className="text-sm text-gray-400">100% of portfolio</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Returns</div>
                  <div className="text-2xl font-bold mt-1">+$0</div>
                  <div className="text-sm text-gray-400">0% of portfolio</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assets */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Assets</h2>
              <Button variant="ghost" className="text-sm text-gray-400">See All</Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {state.assets.map(asset => (
                <AssetPanel 
                  key={asset.id}
                  asset={asset}
                  onClick={() => handleAssetClick(asset.id, asset.name)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card className="bg-[#0F172A]/80 border-white/10 backdrop-blur-xl">
            <CardContent className="p-6">
              <PerformanceChart data={state.netWorthHistory} />
            </CardContent>
          </Card>

          <Card className="bg-[#0F172A]/80 border-white/10 backdrop-blur-xl">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Market News</h2>
              <NewsPanel />
            </CardContent>
          </Card>

          <Card className="bg-[#0F172A]/80 border-white/10 backdrop-blur-xl">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-semibold">Game Progress</h2>
              <RoundInfo />
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => state.isPaused ? resumeGame() : pauseGame()}
                >
                  {state.isPaused ? 'Resume' : 'Pause'}
                </Button>
                <Button 
                  variant="destructive"
                  onClick={endGame}
                >
                  End Game
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {selectedAsset && (
        <TradeModal
          assetId={selectedAsset.id}
          assetName={selectedAsset.name}
          onClose={() => setSelectedAsset(null)}
        />
      )}
    </div>
  );
};

export default GameDashboard;
