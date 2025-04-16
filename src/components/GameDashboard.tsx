
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import HoldingsList from './HoldingsList';
import NewsPanel from './NewsPanel';
import TradeModal from './TradeModal';
import RoundInfo from './RoundInfo';
import MarketHealth from './MarketHealth';
import { HelpCircle, AlertTriangle } from 'lucide-react';
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
  const { state, endGame } = useGame();
  const [selectedAsset, setSelectedAsset] = useState<SelectedAsset>(null);
  const [showHint, setShowHint] = useState(true);

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
  
  const handleAssetClick = (id: string, name: string) => {
    setSelectedAsset({ id, name });
  };
  
  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-[#0B1222] to-[#0F1A2A] text-white overflow-hidden">
      <GameHeader />

      <main className="flex-grow container mx-auto px-4 py-4 grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-hidden">
        <div className="lg:col-span-2 space-y-4 overflow-auto max-h-full pb-4">
          <PortfolioSummary />

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

        <div className="space-y-4 flex flex-col h-full overflow-hidden">
          {/* Market News card that fills available vertical space */}
          <Card className="bg-gradient-to-br from-[#0F172A]/90 to-[#1E293B]/60 border-white/10 backdrop-blur-xl flex-grow">
            <CardContent className="p-4 flex flex-col h-full">
              <h2 className="text-lg font-semibold mb-3 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent flex items-center justify-between">
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
              <div className="flex-grow overflow-auto">
                <NewsPanel onAssetClick={handleAssetClick} />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-[#0F172A]/90 to-[#1E293B]/60 border-white/10 backdrop-blur-xl">
              <CardContent className="p-4">
                <h2 className="text-lg font-semibold mb-3 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent flex items-center justify-between">
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
              <CardContent className="p-4">
                <h2 className="text-lg font-semibold mb-3 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Game Progress
                </h2>
                <RoundInfo />
              </CardContent>
            </Card>
          </div>
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
