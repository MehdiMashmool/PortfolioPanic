
import React, { useState } from 'react';
import { Bell, Settings } from 'lucide-react';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { toast } from '@/hooks/use-toast';
import { useGame } from '../contexts/GameContext';
import { useNavigate } from 'react-router-dom';

const GameHeader = () => {
  const { state } = useGame();
  const [showSettingsMenu, setShowSettingsMenu] = useState<boolean>(false);
  const navigate = useNavigate();

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
                <Settings 
                  className="w-5 h-5 text-gray-400 cursor-pointer hover:text-white transition-colors" 
                  onClick={() => {
                    setShowSettingsMenu(!showSettingsMenu);
                    toast({
                      title: "Settings",
                      description: "Use settings to return to the main menu or adjust game options",
                      duration: 3000,
                      action: (
                        <button 
                          onClick={() => navigate('/')} 
                          className="bg-blue-600 text-white px-3 py-1 rounded text-xs"
                        >
                          Return to Menu
                        </button>
                      )
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
