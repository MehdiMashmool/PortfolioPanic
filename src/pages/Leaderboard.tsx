
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Medal, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data, error } = await supabase
          .from('high_scores')
          .select('portfolio_value, achieved_at, profiles:user_id(username)')
          .order('portfolio_value', { ascending: false })
          .limit(100);

        if (error) throw error;

        const formattedData = data.map((entry: any) => ({
          username: entry.profiles?.username || 'Unknown Player',
          portfolio_value: entry.portfolio_value,
          achieved_at: new Date(entry.achieved_at).toLocaleDateString(),
        }));

        setLeaderboard(formattedData);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-6 w-6 text-amber-400" />;
      case 1:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 2:
        return <Award className="h-6 w-6 text-amber-700" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 p-4 sm:p-8">
      <Card className="mx-auto max-w-4xl">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            Global Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading leaderboard...</div>
          ) : (
            <div className="space-y-4">
              {leaderboard.map((entry, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg bg-card hover:bg-card/80 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 text-lg font-bold text-muted-foreground">
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Leaderboard;
