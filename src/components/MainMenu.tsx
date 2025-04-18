import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Info, Trophy, ArrowRight, Medal, LogIn, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const MainMenu = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      if (session?.user) {
        setUsername(session.user.user_metadata?.username || '');
      }
    };
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsAuthenticated(!!session);
      if (session?.user) {
        setUsername(session.user.user_metadata?.username || '');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Sign out failed",
        description: "An error occurred while signing out. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B1222] to-[#0F1A2A] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 animate-pulse">
            PORTFOLIO PANIC
          </h1>
          <p className="text-xl text-gray-300">Master the markets before time runs out!</p>
          
          {isAuthenticated && username && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
              <User size={14} />
              <span>Playing as {username}</span>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Button 
            className="w-full h-16 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            onClick={() => navigate('/game')}
          >
            Play Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="bg-panel/70 border-panel-light hover:bg-panel-light text-white h-14 rounded-lg shadow transition-all duration-300 hover:shadow-md"
              onClick={() => navigate('/how-to-play')}
            >
              <Info className="mr-2 h-4 w-4 text-blue-400" />
              How to Play
            </Button>
            <Button 
              variant="outline"
              className="bg-panel/70 border-panel-light hover:bg-panel-light text-white h-14 rounded-lg shadow transition-all duration-300 hover:shadow-md"
              onClick={() => navigate('/leaderboard')}
            >
              <Medal className="mr-2 h-4 w-4 text-emerald-400" />
              Leaderboard
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline"
              className={`bg-panel/70 border-panel-light hover:bg-panel-light text-white h-14 rounded-lg shadow transition-all duration-300 hover:shadow-md ${!isAuthenticated ? 'opacity-50' : ''}`}
              onClick={() => navigate('/achievements')}
              disabled={!isAuthenticated}
            >
              <Trophy className="mr-2 h-4 w-4 text-amber-400" />
              Achievements
              {!isAuthenticated && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1 rounded-full">
                  Sign In
                </span>
              )}
            </Button>
            
            {isAuthenticated ? (
              <Button 
                variant="outline"
                className="bg-red-900/30 border-red-800/50 hover:bg-red-900/50 text-white h-14 rounded-lg shadow transition-all duration-300 hover:shadow-md"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4 text-red-400" />
                Sign Out
              </Button>
            ) : (
              <Button 
                variant="outline"
                className="bg-blue-900/30 border-blue-700/50 hover:bg-blue-900/50 text-white h-14 rounded-lg shadow transition-all duration-300 hover:shadow-md"
                onClick={() => navigate('/auth')}
              >
                <LogIn className="mr-2 h-4 w-4 text-blue-400" />
                Sign In
              </Button>
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
