
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import HoldingsList from './HoldingsList';
import NewsPanel from './NewsPanel';
import TradeModal from './TradeModal';
import RoundInfo from './RoundInfo';
import MarketHealth from './MarketHealth';
import { Pause, Play, HelpCircle, AlertTriangle } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { toast } from '@/hooks/use-toast';
import GameHeader from './GameHeader';
import PortfolioSummary from './PortfolioSummary';
import AssetList from './AssetList';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type SelectedAsset = {
  id: string;
  name: string;
} | null;

const GameDashboard: React.FC = () => {
  const { state, pauseGame, resumeGame, endGame } = useGame();
  const [selectedAsset, setSelectedAsset] = useState<SelectedAsset>(null);
  const [showHint, setShowHint] = useState(true);
  
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

  // Show hint for first-time users
  useEffect(() => {
    const hasTraded = Object.values(state.holdings).some(h => h.quantity > 0);
    
    if (!hasTraded && showHint) {
      setTimeout(() => {
        toast({
          title: "Get Started!",
          description: "Click on any asset below to make your first trade.",
          duration: 8000,
        });
      }, 3000);
    }
  }, []);
  
  // Handle asset click from news panel
  const handleAssetClick = (id: string, name: string) => {
    setSelectedAsset({ id, name });
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B1222] to-[#0F1A2A] text-white">
      <GameHeader />

      <main className="container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <PortfolioSummary />

          {/* Get Started Hint Card */}
          {Object.keys(state.holdings).length === 0 && showHint && (
            <Card className="bg-blue-900/30 border border-blue-500/50 shadow-lg animate-pulse">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <HelpCircle className="text-blue-400 mr-2" />
                  <div>
                    <h3 className="font-bold">Ready to start investing?</h3>
                    <p className="text-sm text-blue-200">Click on any asset below to make your first trade!</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-blue-400 text-blue-200"
                  onClick={() => setShowHint(false)}
                >
                  Got it
                </Button>
              </CardContent>
            </Card>
          )}

          <AssetList onAssetClick={(id, name) => setSelectedAsset({ id, name })} />
        </div>

        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-[#0F172A]/90 to-[#1E293B]/60 border-white/10 backdrop-blur-xl">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent flex items-center justify-between">
                <span>Market News</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle size={16} className="text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-dark border-highlight max-w-xs">
                      <p className="text-xs">News affects asset prices. Click on asset tickers to trade them directly!</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </h2>
              <NewsPanel onAssetClick={handleAssetClick} />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#0F172A]/90 to-[#1E293B]/60 border-white/10 backdrop-blur-xl">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent flex items-center justify-between">
                <span>Market Health</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle size={16} className="text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-dark border-highlight max-w-xs">
                      <p className="text-xs">Market health affects volatility. Lower health means higher risk and potentially higher rewards!</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </h2>
              <MarketHealth health={state.marketHealth} />
              
              {state.marketHealth < 30 && (
                <div className="mt-4 flex items-center text-sm text-red-400">
                  <AlertTriangle size={16} className="mr-1 animate-pulse" />
                  <span>Warning: Market highly volatile!</span>
                </div>
              )}
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
                    <><Play className="mr-2 h-4 w-4 text-green-400" /> Resume</>
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
