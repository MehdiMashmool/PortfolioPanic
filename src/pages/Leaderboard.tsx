import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Medal, Award, ArrowLeft, Crown, Info, Loader2, LogIn } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

type LeaderboardEntry = {
  username: string;
  portfolio_value: number;
  achieved_at: string;
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // Always fetch public leaderboard data
        const { data: highScores, error: scoresError } = await supabase
          .from('high_scores')
          .select('user_id, portfolio_value, achieved_at')
          .order('portfolio_value', { ascending: false })
          .limit(100);

        if (scoresError) {
          setError('Failed to fetch high scores');
          console.error('Error fetching high scores:', scoresError);
          return;
        }

        // If we have no high scores, return empty array
        if (!highScores || highScores.length === 0) {
          setLeaderboard([]);
          setLoading(false);
          return;
        }

        // Get user profiles in a separate query
        const userIds = highScores.map(score => score.user_id);
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', userIds);

        if (profilesError) {
          setError('Failed to fetch user profiles');
          console.error('Error fetching profiles:', profilesError);
          return;
        }

        // Create a map of user IDs to usernames
        const usernameMap = new Map();
        profiles?.forEach(profile => {
          usernameMap.set(profile.id, profile.username);
        });

        // Combine high scores with usernames
        const formattedData = highScores.map(entry => ({
          username: usernameMap.get(entry.user_id) || 'Anonymous Player',
          portfolio_value: entry.portfolio_value,
          achieved_at: new Date(entry.achieved_at).toLocaleDateString(),
        }));

        setLeaderboard(formattedData);
        
        // Only try to find user's rank if they're authenticated
        if (isAuthenticated) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const userIndex = formattedData.findIndex(
              (entry) => entry.username === user.user_metadata?.username
            );
            if (userIndex !== -1) {
              setUserRank(userIndex + 1);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        setError('Unexpected error loading leaderboard');
        toast({
          title: "Error loading leaderboard",
          description: "Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [isAuthenticated]);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="h-6 w-6 text-amber-400" />;
      case 1:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 2:
        return <Award className="h-6 w-6 text-amber-700" />;
      default:
        return null;
    }
  };
  
  const getRowBg = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-amber-950/30 border-amber-500/40';
      case 1:
        return 'bg-gray-800/30 border-gray-400/40';
      case 2:
        return 'bg-amber-900/20 border-amber-700/40';
      default:
        return 'bg-card/80';
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center py-12 flex flex-col items-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
          <p className="text-neutral">Loading leaderboard...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12 flex flex-col items-center">
          <Info className="h-8 w-8 text-red-400 mb-4" />
          <h3 className="text-lg font-medium mb-1">Error loading leaderboard</h3>
          <p className="text-neutral mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div className="text-center py-12 flex flex-col items-center">
          <LogIn className="h-8 w-8 text-primary mb-4" />
          <h3 className="text-lg font-medium mb-2">Sign in to compete!</h3>
          <p className="text-neutral mb-6">Join the leaderboard and track your progress</p>
          <Button onClick={() => navigate('/auth')} className="mb-4">
            Sign In / Sign Up
          </Button>
          <p className="text-sm text-muted-foreground">
            View only mode - sign in to save your scores
          </p>
          {leaderboard.length > 0 && (
            <div className="w-full mt-8">
              <h4 className="text-lg font-medium mb-4">Current Rankings</h4>
              <div className="space-y-3">
                {leaderboard.map((entry, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-4 rounded-lg ${getRowBg(index)} border hover:bg-card/90 transition-colors`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="w-8 text-lg font-bold text-muted-foreground flex items-center justify-center">
                        {getRankIcon(index) || `#${index + 1}`}
                      </span>
                      <span className="font-medium">{entry.username}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-primary">
                        {formatCurrency(entry.portfolio_value)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {entry.achieved_at}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <>
        {userRank !== null && (
          <div className="mb-6 p-3 bg-primary/20 border border-primary/30 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/40 rounded-full h-8 w-8 flex items-center justify-center">
                <span className="font-bold">#{userRank}</span>
              </div>
              <span className="font-medium">Your Ranking</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-primary/50 hover:bg-primary/20"
              onClick={() => navigate('/game')}
            >
              Improve Rank
            </Button>
          </div>
        )}

        <div className="space-y-3">
          {leaderboard.map((entry, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-4 rounded-lg ${getRowBg(index)} border hover:bg-card/90 transition-colors`}
            >
              <div className="flex items-center gap-4">
                <span className="w-8 text-lg font-bold text-muted-foreground flex items-center justify-center">
                  {getRankIcon(index) || `#${index + 1}`}
                </span>
                <span className="font-medium">{entry.username}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-bold text-primary">
                  {formatCurrency(entry.portfolio_value)}
                </span>
                <span className="text-sm text-muted-foreground">
                  {entry.achieved_at}
                </span>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B1222] to-[#0F1A2A] p-4 sm:p-8">
      <Card className="mx-auto max-w-4xl bg-panel border-highlight">
        <CardHeader className="border-b border-highlight">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/')}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <Trophy className="h-6 w-6 text-amber-400" />
              Global Leaderboard
            </CardTitle>
            <div className="w-8"></div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
};

export default Leaderboard;
