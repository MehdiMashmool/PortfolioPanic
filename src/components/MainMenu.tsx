
import React from 'react';
import { Button } from './ui/button';
import { Info, Trophy, ArrowRight, Medal, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';

const MainMenu = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check current auth status
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B1222] to-[#0F1A2A] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 animate-pulse">
            PORTFOLIO PANIC
          </h1>
          <p className="text-xl text-gray-300">Master the markets before time runs out!</p>
        </div>

        <div className="space-y-8">
          <Button 
            className="w-full h-16 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            onClick={() => navigate('/game')}
          >
            Play Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          <div className="grid grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="bg-panel/70 border-panel-light hover:bg-panel-light text-white h-14 rounded-lg shadow transition-all duration-300 hover:shadow-md"
              onClick={() => navigate('/how-to-play')}
            >
              <Info className="mr-2 h-4 w-4 text-blue-400" />
              How to Play
            </Button>
            {user ? (
              <>
                <Button 
                  variant="outline"
                  className="bg-panel/70 border-panel-light hover:bg-panel-light text-white h-14 rounded-lg shadow transition-all duration-300 hover:shadow-md"
                  onClick={() => navigate('/achievements')}
                >
                  <Trophy className="mr-2 h-4 w-4 text-amber-400" />
                  Achievements
                </Button>
                <Button 
                  variant="outline"
                  className="bg-panel/70 border-panel-light hover:bg-panel-light text-white h-14 rounded-lg shadow transition-all duration-300 hover:shadow-md"
                  onClick={() => navigate('/leaderboard')}
                >
                  <Medal className="mr-2 h-4 w-4 text-emerald-400" />
                  Leaderboard
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline"
                  className="bg-panel/70 border-panel-light hover:bg-panel-light text-white h-14 rounded-lg col-span-2 shadow transition-all duration-300 hover:shadow-md"
                  onClick={() => navigate('/auth')}
                >
                  <LogIn className="mr-2 h-4 w-4 text-primary" />
                  Sign In for Leaderboard
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="p-4 bg-black/30 rounded-lg mt-8 border border-white/10">
          <h3 className="text-lg font-bold mb-2 text-gray-200">How to Win</h3>
          <ul className="text-sm text-gray-300 space-y-1 text-left">
            <li className="flex items-start">
              <span className="text-green-400 mr-2">•</span>
              <span>Buy low, sell high to maximize portfolio value</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span>Pay attention to market news for trading opportunities</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-400 mr-2">•</span>
              <span>Diversify your investments to minimize risk</span>
            </li>
            <li className="flex items-start">
              <span className="text-amber-400 mr-2">•</span>
              <span>Complete all 10 rounds with maximum profits</span>
            </li>
          </ul>
        </div>

        <p className="text-neutral text-sm">Version 1.0.0</p>
      </div>
    </div>
  );
};

export default MainMenu;
