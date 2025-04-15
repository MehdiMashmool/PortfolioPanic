
import React from 'react';
import { useGame } from '../contexts/GameContext';
import { getNewsSentimentClass } from '../utils/newsGenerator';
import { ScrollArea } from './ui/scroll-area';

const NewsPanel = () => {
  const { state } = useGame();
  const { news } = state;
  
  // Sort news by timestamp descending (newest first)
  const sortedNews = [...news].sort((a, b) => b.timestamp - a.timestamp);
  
  if (sortedNews.length === 0) {
    return (
      <div className="text-center py-4 text-neutral">
        No market news yet.
      </div>
    );
  }
  
  return (
    <ScrollArea className="h-64">
      <div className="space-y-3">
        {sortedNews.slice(0, 10).map((item) => {
          // Format timestamp
          const date = new Date(item.timestamp);
          const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          
          // Get sentiment class for border color
          const sentimentClass = getNewsSentimentClass(item.sentiment);
          
          return (
            <div 
              key={item.id}
              className={`p-3 border-l-4 ${sentimentClass} bg-dark/40 rounded-r-md`}
            >
              <div className="flex justify-between items-start">
                <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                <span className="text-xs text-neutral">{timeString}</span>
              </div>
              <p className="text-xs text-neutral">{item.content}</p>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};

export default NewsPanel;
