
import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { formatCurrency, calculateAllocation } from '../utils/marketLogic';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import AssetPanel from './AssetPanel';
import HoldingsList from './HoldingsList';
import NewsPanel from './NewsPanel';
import TradeModal from './TradeModal';
import PerformanceChart from './PerformanceChart';
import RoundInfo from './RoundInfo';
import MarketHealth from './MarketHealth';
import AllocationPieChart from './AllocationPieChart';
import { 
  Bell, Clock, Settings, Pause, Play, 
  Volume2, VolumeX, ArrowUp, ArrowDown 
} from 'lucide-react';
import { Badge } from './ui/badge';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { toast } from './ui/use-toast';

type SelectedAsset = {
  id: string;
  name: string;
} | null;

const GameDashboard: React.FC = () => {
  const { state, calculateNetWorth, startGame, pauseGame, resumeGame, endGame } = useGame();
  const [selectedAsset, setSelectedAsset] = useState<SelectedAsset>(null);
  const [muted, setMuted] = useState<boolean>(true);
  const [showSettingsMenu, setShowSettingsMenu] = useState<boolean>(false);
  
  const netWorth = calculateNetWorth();
  const netWorthChange = state.netWorthHistory.length > 1
    ? netWorth - state.netWorthHistory[0].value
    : 0;
  const netWorthPercentChange = state.netWorthHistory.length > 1
    ? (netWorthChange / state.netWorthHistory[0].value) * 100
    : 0;

  // Calculate portfolio allocation
  const calculatePortfolioData = () => {
    let totalInvested = 0;
    const assetValues: { [key: string]: number } = {};
    
    // Calculate invested value per asset
    Object.entries(state.holdings).forEach(([assetId, holding]) => {
      const asset = state.assets.find(a => a.id === assetId);
      if (asset && holding.quantity > 0) {
        const value = holding.quantity * asset.price;
        assetValues[assetId] = value;
        totalInvested += value;
      }
    });
    
    // If nothing is invested, show cash as 100%
    if (totalInvested === 0) {
      return [{
        name: 'Cash',
        value: 100,
        color: '#64748b'
      }];
    }
    
    // Calculate allocation percentages
    const allocation = Object.entries(assetValues).map(([assetId, value]) => {
      const asset = state.assets.find(a => a.id === assetId);
      const percentage = (value / (totalInvested + state.cash)) * 100;
      
      return {
        name: asset ? asset.name : 'Unknown',
        value: percentage,
        color: asset ? 
          asset.color === 'stock' ? '#3B82F6' : 
          asset.color === 'gold' ? '#FFC107' : 
          asset.color === 'oil' ? '#6B7280' : 
          '#8B5CF6' : '#64748b'
      };
    });
    
    // Add cash to allocation
    const cashPercentage = (state.cash / (totalInvested + state.cash)) * 100;
    if (cashPercentage > 0) {
      allocation.push({
        name: 'Cash',
        value: cashPercentage,
        color: '#64748b'
      });
    }
    
    return allocation;
  };

  const totalInvested = Object.entries(state.holdings).reduce((total, [assetId, holding]) => {
    const asset = state.assets.find(a => a.id === assetId);
    if (asset && holding.quantity > 0) {
      return total + (holding.quantity * asset.price);
    }
    return total;
  }, 0);

  const portfolioAllocation = calculatePortfolioData();
  
  const handleAssetClick = (id: string, name: string) => {
    setSelectedAsset({ id, name });
  };

  const handleToggleSound = () => {
    setMuted(!muted);
    toast({
      title: muted ? "Sound Enabled" : "Sound Muted",
      description: muted ? "Game sounds will now play" : "Game sounds are now muted",
      duration: 2000
    });
  };
  
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
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0F172A]/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">PORTFOLIO PANIC</h1>
            <Badge variant="outline" className="bg-orange-500/20 text-orange-400 border-orange-500/50">
              Round {state.round}/10
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Bell 
                    className="w-5 h-5 text-gray-400 cursor-pointer hover:text-white transition-colors" 
                    onClick={() => {
                      toast({
                        title: "Notifications",
                        description: "All notifications are currently shown in the news panel",
                        duration: 3000
                      });
                    }}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Notifications</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Clock 
                    className="w-5 h-5 text-gray-400 cursor-pointer hover:text-white transition-colors" 
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Time remaining: {Math.floor(state.timeRemaining)}s</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={handleToggleSound}>
                    {muted ? (
                      <VolumeX className="w-5 h-5 text-gray-400 cursor-pointer hover:text-white transition-colors" />
                    ) : (
                      <Volume2 className="w-5 h-5 text-gray-400 cursor-pointer hover:text-white transition-colors" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{muted ? "Unmute" : "Mute"} Game Sounds</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Settings 
                    className="w-5 h-5 text-gray-400 cursor-pointer hover:text-white transition-colors" 
                    onClick={() => {
                      setShowSettingsMenu(!showSettingsMenu);
                      toast({
                        title: "Settings",
                        description: "Game settings menu will be available in a future update",
                        duration: 3000
                      });
                    }}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Game Settings</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-gradient-to-br from-[#0F172A]/90 to-[#1E293B]/60 border-white/10 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-400 font-medium">Current Portfolio Value</div>
                  <div className="text-3xl font-bold mt-1 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    {formatCurrency(netWorth)}
                  </div>
                  <div className={`text-sm flex items-center ${netWorthChange >= 0 ? 'text-profit' : 'text-loss'}`}>
                    {netWorthChange >= 0 ? (
                      <ArrowUp size={16} className="mr-1" />
                    ) : (
                      <ArrowDown size={16} className="mr-1" />
                    )}
                    <span className={`${netWorthChange >= 0 ? 'text-profit drop-shadow-[0_0_5px_rgba(16,185,129,0.4)]' : 'text-loss drop-shadow-[0_0_5px_rgba(239,68,68,0.4)]'}`}>
                      {netWorthChange >= 0 ? '+' : ''}{netWorthPercentChange.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 font-medium">Invested</div>
                  <div className="text-2xl font-bold mt-1">{formatCurrency(totalInvested)}</div>
                  <div className="text-sm text-gray-400">
                    {formatCurrency(totalInvested / netWorth * 100)}% of portfolio
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 font-medium">Available Cash</div>
                  <div className="text-2xl font-bold mt-1">{formatCurrency(state.cash)}</div>
                  <div className="text-sm text-gray-400">
                    {formatCurrency(state.cash / netWorth * 100)}% of portfolio
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="text-sm text-gray-400 font-medium mb-1">Allocation</div>
                  <AllocationPieChart data={portfolioAllocation} />
                </div>
              </div>
              
              <div className="mt-6">
                <PerformanceChart data={state.netWorthHistory} />
              </div>
            </CardContent>
          </Card>

          {/* Assets */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Assets</h2>
              <Button variant="ghost" className="text-sm text-gray-400">See All</Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {state.assets.map(asset => (
                <AssetPanel 
                  key={asset.id}
                  asset={asset}
                  onClick={() => handleAssetClick(asset.id, asset.name)}
                  priceHistory={Array(10).fill(0).map((_, i) => ({ 
                    value: asset.price * (0.9 + Math.random() * 0.2) 
                  }))}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-[#0F172A]/90 to-[#1E293B]/60 border-white/10 backdrop-blur-xl">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Market News</h2>
              <NewsPanel />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#0F172A]/90 to-[#1E293B]/60 border-white/10 backdrop-blur-xl">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Market Health</h2>
              <MarketHealth />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#0F172A]/90 to-[#1E293B]/60 border-white/10 backdrop-blur-xl">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-semibold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Game Progress</h2>
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
