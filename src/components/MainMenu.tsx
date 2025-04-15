
import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Info, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MainMenu = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-bold text-white">PORTFOLIO PANIC</h1>
          <p className="text-neutral">Master the markets before time runs out!</p>
        </div>

        <Button 
          className="w-full h-14 bg-accent hover:bg-accent/90 text-white"
          onClick={() => navigate('/game')}
        >
          Play Now
        </Button>

        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            className="bg-panel border-panel-light hover:bg-panel-light text-neutral"
            onClick={() => navigate('/how-to-play')}
          >
            <Info className="mr-2 h-4 w-4" />
            How to Play
          </Button>
          <Button 
            variant="outline"
            className="bg-panel border-panel-light hover:bg-panel-light text-neutral"
            onClick={() => navigate('/achievements')}
          >
            <Trophy className="mr-2 h-4 w-4" />
            Achievements
          </Button>
        </div>

        <p className="text-neutral text-sm">Version 1.0.0</p>
      </div>
    </div>
  );
};

export default MainMenu;
