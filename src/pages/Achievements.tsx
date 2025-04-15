
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, DollarSign, Trophy, Target, Star, TrendingUp, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';

const achievements = [
  {
    id: 1,
    title: 'First Million',
    description: 'Reach a portfolio value of $1,000,000',
    icon: DollarSign,
    progress: 45,
    completed: false,
  },
  {
    id: 2,
    title: 'Market Master',
    description: 'Achieve 50% return in a single game',
    icon: Trophy,
    completed: true,
    completedDate: '2025-04-05',
  },
  {
    id: 3,
    title: 'Diversification Pro',
    description: 'Own at least 6 different asset types simultaneously',
    icon: Target,
    progress: 67,
    completed: false,
  },
  {
    id: 4,
    title: 'Perfect Timing',
    description: 'Buy an asset just before it increases 20% in value',
    icon: Clock,
    completed: true,
    completedDate: '2025-04-08',
  },
  {
    id: 5,
    title: 'Comeback King',
    description: 'Recover from a 30% portfolio loss to end with positive returns',
    icon: Star,
    progress: 0,
    completed: false,
  },
  {
    id: 6,
    title: 'Diamond Hands',
    description: 'Hold an asset through 3 consecutive rounds of negative returns',
    icon: TrendingUp,
    progress: 33,
    completed: false,
  },
];

const Achievements = () => {
  const navigate = useNavigate();
  const completedCount = achievements.filter(a => a.completed).length;

  return (
    <div className="min-h-screen bg-background text-white p-4 md:p-8">
      <Button 
        variant="ghost" 
        className="text-neutral mb-8"
        onClick={() => navigate('/')}
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to Main Menu
      </Button>

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2 mb-12">
          <h1 className="text-4xl font-bold">Achievements</h1>
          <p className="text-neutral">Track your accomplishments</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {achievements.map((achievement) => (
            <Card 
              key={achievement.id}
              className={`bg-panel border-panel-light p-6 ${achievement.completed ? 'border-accent/50' : ''}`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-neutral">
                    <achievement.icon className={`h-6 w-6 mr-3 ${achievement.completed ? 'text-accent' : ''}`} />
                    <div>
                      <h3 className="font-semibold text-white">{achievement.title}</h3>
                      <p className="text-sm text-neutral">{achievement.description}</p>
                    </div>
                  </div>
                  {achievement.completed && (
                    <Trophy className="h-5 w-5 text-accent" />
                  )}
                </div>
                
                {!achievement.completed ? (
                  <Progress value={achievement.progress} className="h-1.5" />
                ) : (
                  <p className="text-sm text-neutral">
                    Completed {achievement.completedDate}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>

        <div className="flex justify-center items-center space-x-2 text-neutral mt-8">
          <Trophy className="h-5 w-5 text-accent" />
          <span>
            {completedCount} of {achievements.length} achievements unlocked
          </span>
        </div>

        <div className="flex justify-center pt-4">
          <Button 
            className="bg-accent hover:bg-accent/90"
            onClick={() => navigate('/game')}
          >
            Play to Earn More
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Achievements;
