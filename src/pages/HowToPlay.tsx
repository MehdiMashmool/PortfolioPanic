
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, Clock, DollarSign, TrendingUp, Flag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HowToPlay = () => {
  const navigate = useNavigate();

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
          <h1 className="text-4xl font-bold">How to Play</h1>
          <p className="text-neutral">Learn the rules of Portfolio Panic</p>
        </div>

        <Card className="bg-panel border-panel-light p-6">
          <div className="space-y-2">
            <div className="flex items-center text-accent mb-4">
              <Clock className="h-6 w-6 mr-2" />
              <h2 className="text-xl font-semibold">Game Overview</h2>
            </div>
            <p className="text-neutral">
              Portfolio Panic is a fast-paced financial simulation game where you need to build the most valuable
              portfolio before time runs out. You'll buy and sell various assets, react to market news, and make
              strategic decisions to maximize your returns.
            </p>
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-panel border-panel-light p-6">
            <div className="space-y-4">
              <div className="flex items-center text-info">
                <Clock className="h-5 w-5 mr-2" />
                <h3 className="font-semibold">Timed Rounds</h3>
              </div>
              <p className="text-neutral">
                The game consists of 10 timed rounds. Each round gives you limited time to make
                investment decisions. When the timer runs out, the market shifts and new opportunities appear.
              </p>
            </div>
          </Card>

          <Card className="bg-panel border-panel-light p-6">
            <div className="space-y-4">
              <div className="flex items-center text-success">
                <DollarSign className="h-5 w-5 mr-2" />
                <h3 className="font-semibold">Buying & Selling</h3>
              </div>
              <p className="text-neutral">
                Click on any asset to open the trading dialog. You can buy assets when prices are low and
                sell when they rise. Each transaction has an immediate effect on your portfolio.
              </p>
            </div>
          </Card>

          <Card className="bg-panel border-panel-light p-6">
            <div className="space-y-4">
              <div className="flex items-center text-warning">
                <TrendingUp className="h-5 w-5 mr-2" />
                <h3 className="font-semibold">Market Events</h3>
              </div>
              <p className="text-neutral">
                Watch for market news that can affect asset prices. React quickly to sudden market
                changes to protect your portfolio or capitalize on new opportunities.
              </p>
            </div>
          </Card>

          <Card className="bg-panel border-panel-light p-6">
            <div className="space-y-4">
              <div className="flex items-center text-info">
                <Flag className="h-5 w-5 mr-2" />
                <h3 className="font-semibold">Winning the Game</h3>
              </div>
              <p className="text-neutral">
                The goal is to achieve the highest portfolio value by the end of round 10. Diversifying your
                investments and timing the market correctly will help maximize your returns.
              </p>
            </div>
          </Card>
        </div>

        <Card className="bg-gradient-to-r from-accent/20 to-accent/5 border-accent/20 p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-accent/20 p-2 rounded">
              <TrendingUp className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Pro Tip</h3>
              <p className="text-neutral">
                Keep an eye on the market volatility indicator. High volatility means bigger potential gains but also bigger risks!
              </p>
            </div>
          </div>
        </Card>

        <div className="flex justify-center pt-8">
          <Button 
            className="bg-accent hover:bg-accent/90"
            onClick={() => navigate('/game')}
          >
            Start Playing
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HowToPlay;
