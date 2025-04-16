import React, { useState, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import { getNewsSentimentClass } from '../utils/newsGenerator';
import { ScrollArea } from './ui/scroll-area';
import { 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Info,
  Bell,
  Volume2,
  Zap
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { NewsItem } from '../types/game';
import { toast } from '@/hooks/use-toast';

interface NewsPanelProps {
  onAssetClick?: (id: string, name: string) => void;
}

const NewsPanel: React.FC<NewsPanelProps> = ({ onAssetClick }) => {
  const { state } = useGame();
  const { news } = state;
  const [expanded, setExpanded] = useState(false);
  const [flashNews, setFlashNews] = useState<string | null>(null);
  
  const sortedNews = [...news].sort((a, b) => b.timestamp - a.timestamp);
  
  const visibleNews = expanded ? sortedNews : sortedNews.slice(0, 3);

  // Flash animation for breaking news
  useEffect(() => {
    if (news.length > 0) {
      const latestNews = news[news.length - 1];
      if (latestNews.magnitude >= 0.7) {
        setFlashNews(latestNews.id);
        
        // Play sound for high-impact news
        if (latestNews.magnitude >= 0.8) {
          // You would implement sound effects here
          console.log('Playing breaking news sound');
        }
        
        setTimeout(() => setFlashNews(null), 2000);
      }
    }
  }, [news]);
  
  const getImpactIndicator = (magnitude: number, sentiment: 'positive' | 'negative' | 'neutral', newsId: string) => {
    const isFlashing = flashNews === newsId;
    const flashClass = isFlashing ? 'animate-pulse text-yellow-400' : '';
    
    if (magnitude >= 0.7) {
      if (sentiment === 'positive') {
        return <TrendingUp size={16} className={`text-profit ${flashClass}`} />;
      } else if (sentiment === 'negative') {
        return <TrendingDown size={16} className={`text-loss ${flashClass}`} />;
      } else {
        return <AlertTriangle size={16} className={`text-warning ${flashClass}`} />;
      }
    } else if (magnitude >= 0.4) {
      if (sentiment === 'positive') {
        return <TrendingUp size={16} className="text-profit" />;
      } else if (sentiment === 'negative') {
        return <TrendingDown size={16} className="text-loss" />;
      } else {
        return <AlertTriangle size={16} className="text-warning" />;
      }
    } else {
      return <Info size={16} className="text-neutral" />;
    }
  };

  const getNewsIcon = (news: NewsItem) => {
    // Add special icons for different news types
    if (news.chainId && news.chainSequence && news.chainSequence > 1) {
      return <Bell size={16} className="text-amber-400 mr-1" />;
    } else if (news.magnitude >= 0.8) {
      return <Zap size={16} className="text-red-400 mr-1" />;
    } else if (news.delayedEffect) {
      return <Volume2 size={16} className="text-blue-400 mr-1" />;
    }
    return null;
  };

  const handleNewsClick = (news: NewsItem) => {
    // If it's a high impact news, show detail in toast
    if (news.magnitude >= 0.6) {
      toast({
        title: news.title,
        description: news.content,
        duration: 5000,
      });
    }
  };

  if (sortedNews.length === 0) {
    return (
      <div className="text-center py-4 text-neutral">
        No market news yet.
      </div>
    );
  }
  
  return (
    <div>
      <ScrollArea className={expanded ? "h-96" : "h-64"}>
        <div className="space-y-3">
          {visibleNews.map((item) => {
            const date = new Date(item.timestamp);
            const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            const sentimentClass = getNewsSentimentClass(item.sentiment);
            const isFlashing = flashNews === item.id;
            const newsClass = isFlashing 
              ? `p-3 border-l-4 ${sentimentClass} bg-gradient-to-br from-yellow-900/30 to-dark/40 rounded-r-md animate-fade-in group hover:shadow-lg transition-all duration-300`
              : `p-3 border-l-4 ${sentimentClass} bg-gradient-to-br from-dark/80 to-dark/40 rounded-r-md animate-fade-in group hover:shadow-lg transition-all duration-300`;
            
            return (
              <div 
                key={item.id}
                className={newsClass}
                onClick={() => handleNewsClick(item)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-2">
                    {getImpactIndicator(item.magnitude, item.sentiment, item.id)}
                    <div>
                      <div className="flex items-center gap-2">
                        {getNewsIcon(item)}
                        <h4 className={`font-semibold text-sm mb-1 ${isFlashing ? 'text-yellow-200' : ''}`}>
                          {item.title}
                        </h4>
                        {item.chainSequence && (
                          <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4">
                            Update {item.chainSequence}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-neutral">{item.content}</p>
                    </div>
                  </div>
                  <span className="text-xs text-neutral">{timeString}</span>
                </div>
                
                {item.impactedAssets.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {item.impactedAssets.map((assetId) => {
                      const asset = state.assets.find(a => a.id === assetId);
                      if (!asset) return null;
                      
                      return (
                        <Badge
                          key={assetId}
                          className={`text-xs px-2 py-0.5 rounded cursor-pointer transition-all hover:scale-110 ${
                            asset.color === 'stock' ? 'bg-blue-900/50 text-blue-300 hover:bg-blue-900' :
                            asset.color === 'gold' ? 'bg-amber-900/50 text-amber-300 hover:bg-amber-900' :
                            asset.color === 'oil' ? 'bg-gray-900/50 text-gray-300 hover:bg-gray-900' :
                            'bg-purple-900/50 text-purple-300 hover:bg-purple-900'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAssetClick && onAssetClick(assetId, asset.name);
                          }}
                        >
                          {asset.ticker}
                        </Badge>
                      );
                    })}
                  </div>
                )}

                <div className="mt-2 text-xs text-neutral-400 hidden group-hover:block">
                  <span className="italic">
                    {item.sentiment === 'positive' ? 'Opportunity' : item.sentiment === 'negative' ? 'Risk' : 'Market Update'}: 
                  </span> {' '}
                  <span className="font-medium">
                    {item.sentiment === 'positive' 
                      ? 'Consider buying affected assets' 
                      : item.sentiment === 'negative' 
                        ? 'Consider selling affected assets'
                        : 'Monitor market conditions'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
      
      {sortedNews.length > 3 && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full mt-3 text-neutral"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <><ChevronUp size={14} className="mr-1" /> Show Less</>
          ) : (
            <><ChevronDown size={14} className="mr-1" /> Show More News</>
          )}
        </Button>
      )}
    </div>
  );
};

export default NewsPanel;
