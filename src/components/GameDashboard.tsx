import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import NewsPanel from './NewsPanel';
import TradeModal from './TradeModal';
import RoundInfo from './RoundInfo';
import MarketHealth from './MarketHealth';
import { HelpCircle, AlertTriangle, Layers, BarChart3, Newspaper } from 'lucide-react';
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

type SelectedAsset = {
  id: string;
  name: string;
} | null;

const GameDashboard: React.FC = () => {
  const { state, endGame } = useGame();
  const [selectedAsset, setSelectedAsset] = useState<SelectedAsset>(null);
  const [showHint, setShowHint] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");

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

  // Game Status Bar Component - Elevated game information
  const GameStatusBar = () => (
    <div className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] border-b border-white/10 mb-2">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center space-x-4">
          <div className="text-lg font-bold">
            Round {state.round}/10
          </div>
          <div className="text-sm text-gray-400">
            {Math.min(state.round * 10, 100)}% Complete
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <MarketHealth health={state.marketHealth} />
          </div>
          <div className={`text-lg font-semibold flex items-center ${
            state.timeRemaining <= 10 ? 'text-red-500 animate-pulse' : 
            state.timeRemaining <= 20 ? 'text-amber-500' : 'text-white'
          }`}>
            {state.timeRemaining <= 0 ? '0:00' : 
             `${Math.floor(state.timeRemaining / 60)}:${(Math.floor(state.timeRemaining) % 60).toString().padStart(2, '0')}`}
          </div>
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="min-h-screen h-screen w-full overflow-hidden flex flex-col bg-gradient-to-b from-[#0B1222] to-[#0F1A2A] text-white">
      <GameHeader />
      <GameStatusBar />

      <main className="w-full flex-grow grid grid-cols-12 gap-2 px-2 pb-2 overflow-hidden">
        {/* Left Column - Portfolio Summary */}
        <div className="col-span-12 md:col-span-3 flex flex-col gap-2 overflow-hidden">
          <Card className="bg-gradient-to-br from-[#0F172A]/90 to-[#1E293B]/60 border-white/10">
            <CardContent className="p-3">
              <PortfolioSummary compactMode={true} />
            </CardContent>
          </Card>
          
          <Card className="flex-grow bg-gradient-to-br from-[#0F172A]/90 to-[#1E293B]/60 border-white/10 overflow-hidden">
            <CardContent className="p-0 h-full flex flex-col">
              <div className="p-3 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Assets</h2>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                  <TabsList className="bg-transparent border border-white/10 p-0 h-8">
                    <TabsTrigger 
                      value="all" 
                      className="text-xs px-2 py-1 h-full data-[state=active]:bg-white/10"
                    >
                      All
                    </TabsTrigger>
                    <TabsTrigger 
                      value="stocks" 
                      className="text-xs px-2 py-1 h-full data-[state=active]:bg-white/10"
                    >
                      Stocks
                    </TabsTrigger>
                    <TabsTrigger 
                      value="crypto" 
                      className="text-xs px-2 py-1 h-full data-[state=active]:bg-white/10"
                    >
                      Crypto
                    </TabsTrigger>
                    <TabsTrigger 
                      value="commodities" 
                      className="text-xs px-2 py-1 h-full data-[state=active]:bg-white/10"
                    >
                      Commodities
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div className="flex-grow overflow-auto p-2">
                <AssetList 
                  onAssetClick={handleAssetClick} 
                  filter={activeTab !== "all" ? activeTab : undefined}
                  compactView={true}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle Column - Market News (Expanded) */}
        <div className="col-span-12 md:col-span-5 flex flex-col gap-2 overflow-hidden">
          <Card className="flex-grow bg-gradient-to-br from-[#0F172A]/90 to-[#1E293B]/60 border-white/10 overflow-hidden">
            <CardContent className="p-0 h-full flex flex-col">
              <div className="bg-gradient-to-r from-[#0F172A]/90 to-[#1E293B]/60 p-3 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center">
                  <Newspaper className="h-5 w-5 mr-2 text-blue-400" />
                  <h2 className="text-lg font-semibold">Market News</h2>
                </div>
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
              </div>
              <div className="flex-grow overflow-hidden p-2">
                <NewsPanel onAssetClick={handleAssetClick} showLimit={8} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Game Progress and Insights */}
        <div className="col-span-12 md:col-span-4 flex flex-col gap-2 overflow-hidden">
          {Object.keys(state.holdings).length === 0 && showHint && (
            <Card className="bg-blue-900/30 border border-blue-500/50 shadow-lg animate-pulse">
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center">
                  <HelpCircle className="text-blue-400 mr-2" />
                  <div>
                    <h3 className="font-bold">Ready to start investing?</h3>
                    <p className="text-sm text-blue-200">Click on any asset in the left panel to make your first trade!</p>
                  </div>
                </div>
                <Button 
                  className="bg-transparent border border-blue-400 text-blue-200 hover:bg-blue-900/30"
                  onClick={() => setShowHint(false)}
                >
                  Got it
                </Button>
              </CardContent>
            </Card>
          )}
          
          <Card className="bg-gradient-to-br from-[#0F172A]/90 to-[#1E293B]/60 border-white/10">
            <CardContent className="p-0">
              <div className="p-3 border-b border-white/5 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-green-400" />
                <h2 className="text-lg font-semibold">Portfolio Details</h2>
              </div>
              <div className="p-3">
                <RoundInfo hideMissions={true} compactMode={true} />
              </div>
            </CardContent>
          </Card>
          
          <Card className="flex-grow bg-gradient-to-br from-[#0F172A]/90 to-[#1E293B]/60 border-white/10 overflow-hidden">
            <CardContent className="p-0 h-full flex flex-col">
              <div className="p-3 border-b border-white/5 flex items-center">
                <Layers className="h-5 w-5 mr-2 text-amber-400" />
                <h2 className="text-lg font-semibold">Holdings & Performance</h2>
              </div>
              <div className="flex-grow overflow-auto p-3">
                {Object.keys(state.holdings).filter(id => state.holdings[id].quantity > 0).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(state.holdings)
                      .filter(([_, holding]) => holding.quantity > 0)
                      .map(([assetId, holding]) => {
                        const asset = state.assets.find(a => a.id === assetId);
                        if (!asset) return null;
                        
                        const currentValue = holding.quantity * asset.price;
                        const costBasis = holding.quantity * holding.averageBuyPrice;
                        const profit = currentValue - costBasis;
                        const profitPercentage = (profit / costBasis) * 100;
                        
                        return (
                          <div 
                            key={assetId}
                            className="p-2 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                            onClick={() => handleAssetClick(assetId, asset.name)}
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center space-x-2">
                                <div className={`w-2 h-8 rounded-sm ${
                                  asset.color === 'stock' ? 'bg-blue-500' :
                                  asset.color === 'commodity' ? 'bg-amber-500' :
                                  asset.color === 'crypto' ? 'bg-purple-500' :
                                  'bg-gray-500'
                                }`} />
                                <div>
                                  <div className="font-medium">{asset.name}</div>
                                  <div className="text-xs text-gray-400">{asset.ticker} · {holding.quantity.toFixed(4)} units</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">${currentValue.toFixed(2)}</div>
                                <div className={`text-xs ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {profit >= 0 ? '+' : ''}{profitPercentage.toFixed(2)}%
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    }
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-400">
                    <p>No holdings yet.</p>
                    <p className="text-sm mt-1">Buy assets to see them here.</p>
                  </div>
                )}
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
