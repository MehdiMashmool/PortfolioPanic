
import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { getNewsSentimentClass } from '../utils/newsGenerator';
import { ScrollArea } from './ui/scroll-area';
import { 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Info
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface NewsPanelProps {
  onAssetClick?: (id: string, name: string) => void;
}

const NewsPanel: React.FC<NewsPanelProps> = ({ onAssetClick }) => {
  const { state } = useGame();
  const { news } = state;
  const [expanded, setExpanded] = useState(false);
  
  // Sort news by timestamp descending (newest first)
  const sortedNews = [...news].sort((a, b) => b.timestamp - a.timestamp);
  
  const visibleNews = expanded ? sortedNews : sortedNews.slice(0, 3);
  
  // Function to get impact indicator based on magnitude and sentiment
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

  const getUrgencyText = (magnitude: number) => {
    if (magnitude >= 0.7) return "ACT NOW";
    if (magnitude >= 0.5) return "BREAKING";
    if (magnitude >= 0.3) return "ALERT";
    return null;
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
            // Format timestamp
            const date = new Date(item.timestamp);
            const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            // Get sentiment class for border color
            const sentimentClass = getNewsSentimentClass(item.sentiment);
            const urgencyText = getUrgencyText(item.magnitude);
            
            return (
              <div 
                key={item.id}
                className={`p-3 border-l-4 ${sentimentClass} bg-gradient-to-br from-dark/80 to-dark/40 rounded-r-md animate-fade-in group hover:shadow-lg transition-all duration-300`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-2">
                    {getImpactIndicator(item.magnitude, item.sentiment)}
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                        {urgencyText && (
                          <Badge variant={item.sentiment === 'positive' ? 'success' : item.sentiment === 'negative' ? 'destructive' : 'warning'} 
                            className="text-[10px] h-4 px-1 animate-pulse">
                            {urgencyText}
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
                          onClick={() => onAssetClick && onAssetClick(assetId, asset.name)}
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
