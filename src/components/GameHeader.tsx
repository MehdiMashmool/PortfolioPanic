
import React, { useState } from 'react';
import { Bell, Clock, Settings, Volume2, VolumeX } from 'lucide-react';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { toast } from '@/hooks/use-toast';
import { useGame } from '../contexts/GameContext';

const GameHeader = () => {
  const { state } = useGame();
  const [muted, setMuted] = useState<boolean>(true);
  const [showSettingsMenu, setShowSettingsMenu] = useState<boolean>(false);

  const handleToggleSound = () => {
    setMuted(!muted);
    toast({
      title: muted ? "Sound Enabled" : "Sound Muted",
      description: muted ? "Game sounds will now play" : "Game sounds are now muted",
      duration: 2000
    });
  };

  return (
    <header className="border-b border-white/10 bg-[#0F172A]/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            PORTFOLIO PANIC
          </h1>
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
                <Clock className="w-5 h-5 text-gray-400 cursor-pointer hover:text-white transition-colors" />
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
  );
};

export default GameHeader;
