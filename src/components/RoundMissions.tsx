
import React from 'react';
import { Mission } from '../types/missions';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { ArrowRight, Award, CheckCircle2, Clock, HelpCircle, Layers, RefreshCw, Shield, Timer, TrendingDown, TrendingUp, Newspaper } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { cn } from '@/lib/utils';

interface RoundMissionsProps {
  missions: Mission[];
}

const RoundMissions: React.FC<RoundMissionsProps> = ({ missions }) => {
  if (!missions || missions.length === 0) {
    return null;
  }

  const getMissionIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Layers': return <Layers size={16} />;
      case 'Shield': return <Shield size={16} />;
      case 'Newspaper': return <Newspaper size={16} />;
      case 'TrendingDown': return <TrendingDown size={16} />;
      case 'TrendingUp': return <TrendingUp size={16} />;
      case 'Timer': return <Timer size={16} />;
      case 'ArrowRight': return <ArrowRight size={16} />;
      case 'RefreshCw': return <RefreshCw size={16} />;
      default: return <HelpCircle size={16} />;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white flex items-center gap-1.5">
          <Clock size={14} className="text-blue-400" />
          Round Missions
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle size={12} className="text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-dark border-highlight max-w-xs">
                <p className="text-xs">Complete missions to earn rewards that help you in future rounds.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </h3>
        
        <div className="text-xs text-gray-400">
          {missions.filter(m => m.status === 'completed').length}/{missions.length} Completed
        </div>
      </div>

      {missions.map(mission => (
        <Card 
          key={mission.id}
          className={cn(
            "bg-gradient-to-br from-dark/80 to-dark/40 border-highlight/20 overflow-hidden transition-all",
            mission.status === 'completed' && "border-green-600/50 from-green-900/20 to-green-900/5",
            mission.status === 'failed' && "border-red-600/30 from-red-900/10 to-red-900/5 opacity-70"
          )}
        >
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "p-1.5 rounded-md",
                  mission.status === 'completed' ? "bg-green-600/20 text-green-400" :
                  mission.status === 'failed' ? "bg-red-600/20 text-red-400" :
                  "bg-blue-600/20 text-blue-400"
                )}>
                  {mission.status === 'completed' ? 
                    <CheckCircle2 size={16} className="text-green-400" /> : 
                    getMissionIcon(mission.icon)
                  }
                </div>
                
                <div>
                  <h4 className="text-sm font-medium flex items-center">
                    {mission.title}
                    {mission.status === 'completed' && 
                      <Badge className="ml-2 bg-green-600/30 text-green-400 text-[9px] px-1.5 py-0">COMPLETED</Badge>
                    }
                  </h4>
                  <p className="text-xs text-gray-400">{mission.description}</p>
                </div>
              </div>
              
              {mission.reward && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={cn(
                        "flex items-center gap-1 text-xs px-2 py-1 rounded-md",
                        mission.status === 'completed' ? "bg-green-900/20 text-green-400" : "bg-blue-900/20 text-blue-400"
                      )}>
                        <Award size={12} />
                        <span>Reward</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="bg-dark border-highlight">
                      <p className="text-xs font-medium">{mission.reward}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            
            {mission.progressRequired && mission.currentProgress !== undefined && (
              <div className="mt-2">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-gray-400">Progress</span>
                  <span className="font-medium">
                    {mission.currentProgress}/{mission.progressRequired}
                  </span>
                </div>
                <Progress 
                  value={(mission.currentProgress / mission.progressRequired) * 100}
                  className={cn(
                    "h-1.5",
                    mission.status === 'completed' ? "bg-green-950 [&>div]:bg-green-600" : 
                    mission.status === 'failed' ? "bg-red-950 [&>div]:bg-red-600" :
                    "bg-gray-800 [&>div]:bg-blue-600"
                  )}
                />
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RoundMissions;
