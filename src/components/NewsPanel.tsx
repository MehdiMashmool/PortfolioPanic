import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { getNewsSentimentClass } from '../utils/newsGenerator';
import { ScrollArea } from './ui/scroll-area';
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Info,
  ChevronDown,
  ChevronUp,
  Zap,
  BarChart2
} from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';

interface NewsPanelProps {
  onAssetClick?: (id: string, name: string) => void;
  showLimit?: number;
}

const NewsPanel: React.FC<NewsPanelProps> = ({ onAssetClick, showLimit = 0 }) => {
  const { state } = useGame();
  const { news } = state;
  const [expanded, setExpanded] = useState(false);
  
  const sortedNews = [...news].sort((a, b) => b.timestamp - a.timestamp);
  
  // If showLimit is greater than 0, limit the displayed news items
  const visibleNews = showLimit > 0 && !expanded 
    ? sortedNews.slice(0, showLimit)
    : sortedNews;
  
  const getImpactIndicator = (magnitude: number, sentiment: 'positive' | 'negative' | 'neutral') => {
    if (magnitude >= 0.7) {
      if (sentiment === 'positive') {
        return <TrendingUp size={16} className="text-profit animate-pulse" />;
      } else if (sentiment === 'negative') {
        return <TrendingDown size={16} className="text-loss animate-pulse" />;
      } else {
        return <AlertTriangle size={16} className="text-warning animate-pulse" />;
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

  if (sortedNews.length === 0) {
    return (
      <div className="text-center py-4 text-neutral">
        No market news yet.
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-grow pr-2">
        <div className="space-y-2">
          {visibleNews.map((item) => {
            const date = new Date(item.timestamp);
            const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            const sentimentClass = getNewsSentimentClass(item.sentiment);
            const isHighImpact = item.magnitude >= 0.7;
            const isMediumImpact = item.magnitude >= 0.4 && item.magnitude < 0.7;
            
            return (
              <div 
                key={item.id}
                className={`p-2 border-l-4 ${sentimentClass} bg-gradient-to-br ${
                  isHighImpact ? 'from-dark/90 to-dark/70 shadow-md' : 'from-dark/80 to-dark/40'
                } rounded-r-md animate-fade-in group hover:shadow-lg transition-all duration-300 ${
                  isHighImpact ? 'scale-[1.01]' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-2">
                    {getImpactIndicator(item.magnitude, item.sentiment)}
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className={`font-semibold ${isHighImpact ? 'text-md' : 'text-sm'} mb-1 ${
                          isHighImpact ? (
                            item.sentiment === 'positive' ? 'text-green-300' : 
                            item.sentiment === 'negative' ? 'text-red-300' : 'text-blue-300'
                          ) : ''
                        }`}>
                          {isHighImpact && <Zap size={14} className="inline mr-1 animate-pulse" />}
                          {item.title}
                        </h4>
                      </div>
                      <p className="text-xs text-neutral leading-tight">{item.content}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-neutral whitespace-nowrap">{timeString}</span>
                    {isHighImpact && (
                      <span className="text-[10px] font-bold bg-blue-900/40 text-blue-300 px-1.5 py-0.5 rounded-sm mt-1">
                        CRITICAL
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Impact meter */}
                <div className="mt-1.5 flex items-center gap-1">
                  <span className="text-[10px] text-neutral">Impact:</span>
                  <div className="flex-grow">
                    <Progress
                      value={item.magnitude * 100}
                      className={`h-1.5 ${
                        item.sentiment === 'positive' ? 'bg-green-900/40' : 
                        item.sentiment === 'negative' ? 'bg-red-900/40' : 'bg-blue-900/40'
                      }`}
                    />
                  </div>
                </div>
                
                {item.impactedAssets.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {item.impactedAssets.map((assetId) => {
                      const asset = state.assets.find(a => a.id === assetId);
                      if (!asset) return null;
                      
                      return (
                        <Badge
                          key={assetId}
                          className={`text-xs px-1.5 py-0.5 rounded cursor-pointer transition-all hover:scale-110 ${
                            asset.color === 'stock' ? 'bg-blue-900/50 text-blue-300 hover:bg-blue-900' :
                            asset.color === 'commodity' ? 'bg-amber-900/50 text-amber-300 hover:bg-amber-900' :
                            asset.color === 'crypto' ? 'bg-purple-900/50 text-purple-300 hover:bg-purple-900' :
                            'bg-gray-900/50 text-gray-300 hover:bg-gray-900'
                          }`}
                          onClick={() => onAssetClick && onAssetClick(assetId, asset.name)}
                        >
                          {asset.ticker}
                        </Badge>
                      );
                    })}
                  </div>
                )}

                <div className="mt-1 text-[10px] text-neutral-400 hidden group-hover:block">
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
      
      {/* Show More/Less button if there are more news items than the limit */}
      {showLimit > 0 && sortedNews.length > showLimit && (
        <Button 
          variant="ghost"
          size="sm"
          className="w-full mt-1 text-neutral hover:bg-white/5 rounded-none border-t border-white/5"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <><ChevronUp size={12} className="mr-1" /> Show Less</>
          ) : (
            <><ChevronDown size={12} className="mr-1" /> Show More ({sortedNews.length - showLimit})</>
          )}
        </Button>
      )}
    </div>
  );
};

export default NewsPanel;
