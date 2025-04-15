
import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import HoldingsList from './HoldingsList';
import NewsPanel from './NewsPanel';
import TradeModal from './TradeModal';
import RoundInfo from './RoundInfo';
import MarketHealth from './MarketHealth';
import { Pause, Play } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { toast } from '@/hooks/use-toast';
import GameHeader from './GameHeader';
import PortfolioSummary from './PortfolioSummary';
import AssetList from './AssetList';

type SelectedAsset = {
  id: string;
  name: string;
} | null;

const GameDashboard: React.FC = () => {
  const { state, pauseGame, resumeGame, endGame } = useGame();
  const [selectedAsset, setSelectedAsset] = useState<SelectedAsset>(null);
  
  const toggleGameState = () => {
    if (state.isPaused) {
      resumeGame();
      toast({
        title: "Game Resumed",
        description: "The market is live again!",
        duration: 2000
      });
    } else {
      pauseGame();
      toast({
        title: "Game Paused",
        description: "Market activity is now paused",
        duration: 2000
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B1222] to-[#0F1A2A] text-white">
      <GameHeader />

      <main className="container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <PortfolioSummary />
          <AssetList onAssetClick={(id, name) => setSelectedAsset({ id, name })} />
        </div>

        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-[#0F172A]/90 to-[#1E293B]/60 border-white/10 backdrop-blur-xl">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Market News
              </h2>
              <NewsPanel />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#0F172A]/90 to-[#1E293B]/60 border-white/10 backdrop-blur-xl">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Market Health
              </h2>
              <MarketHealth health={state.marketHealth} />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#0F172A]/90 to-[#1E293B]/60 border-white/10 backdrop-blur-xl">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-semibold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Game Progress
              </h2>
              <RoundInfo />
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  onClick={toggleGameState}
                  className="flex items-center justify-center bg-panel border-panel-light hover:bg-panel-light"
                >
                  {state.isPaused ? (
                    <><Play className="mr-2 h-4 w-4" /> Resume</>
                  ) : (
                    <><Pause className="mr-2 h-4 w-4" /> Pause</>
                  )}
                </Button>
                <Button 
                  variant="destructive"
                  onClick={endGame}
                  className="bg-red-900/50 hover:bg-red-900/80 text-white border border-red-700/50"
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
