
import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { getNewsSentimentClass } from '../utils/newsGenerator';
import { ScrollArea } from './ui/scroll-area';
import { ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';

const NewsPanel = () => {
  const { state } = useGame();
  const { news } = state;
  const [expanded, setExpanded] = useState(false);
  
  // Sort news by timestamp descending (newest first)
  const sortedNews = [...news].sort((a, b) => b.timestamp - a.timestamp);
  
  const visibleNews = expanded ? sortedNews : sortedNews.slice(0, 3);
  
  // Function to get impact indicator based on magnitude
  const getImpactIndicator = (magnitude: number) => {
    if (magnitude >= 0.7) {
      return <AlertTriangle size={14} className="text-error animate-pulse" />;
    } else if (magnitude >= 0.4) {
      return <AlertTriangle size={14} className="text-warning" />;
    }
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
            
            return (
              <div 
                key={item.id}
                className={`p-3 border-l-4 ${sentimentClass} bg-gradient-to-br from-dark/80 to-dark/40 rounded-r-md animate-fade-in`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-2">
                    <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                    {getImpactIndicator(item.magnitude)}
                  </div>
                  <span className="text-xs text-neutral">{timeString}</span>
                </div>
                <p className="text-xs text-neutral">{item.content}</p>
                {item.impactedAssets.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {item.impactedAssets.map((assetId) => {
                      const asset = state.assets.find(a => a.id === assetId);
                      if (!asset) return null;
                      
                      return (
                        <span 
                          key={assetId}
                          className={`text-xs px-1.5 py-0.5 rounded ${
                            asset.color === 'stock' ? 'bg-blue-900/50 text-blue-300' :
                            asset.color === 'gold' ? 'bg-amber-900/50 text-amber-300' :
                            asset.color === 'oil' ? 'bg-gray-900/50 text-gray-300' :
                            'bg-purple-900/50 text-purple-300'
                          }`}
                        >
                          {asset.ticker}
                        </span>
                      );
                    })}
                  </div>
                )}
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
