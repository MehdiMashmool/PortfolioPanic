
import { useState, useEffect } from 'react';
import { generateMarketNews } from '../utils/newsGenerator';
import { GameState } from '../types/game';
import { toast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { shouldBeChainedEvent, shouldBeHighImpactEvent } from '../utils/difficultyManager';

export const useNewsManager = (
  state: GameState,
  dispatch: React.Dispatch<any>,
  eventSchedule: number[]
) => {
  const [recentNewsIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!state.isPaused && !state.isGameOver) {
      const elapsedTime = 60 - state.timeRemaining;
      const elapsedMs = elapsedTime * 1000;
      
      eventSchedule.forEach((timing, index) => {
        if (Math.abs(elapsedMs - timing) < 100) {
          const density = state.eventDensity;
          
          let newsItem = generateMarketNews(
            state.assets, 
            state.round, 
            shouldBeHighImpactEvent(density)
          );
          
          if (shouldBeChainedEvent(density)) {
            const chainId = uuidv4();
            newsItem = {
              ...newsItem,
              chainId,
              chainSequence: 1
            };
            
            const followUpDelay = Math.floor(Math.random() * 10000) + 5000;
            setTimeout(() => {
              if (!state.isPaused && !state.isGameOver) {
                const followUpNews = generateMarketNews(state.assets, state.round, true);
                dispatch({ 
                  type: 'ADD_NEWS', 
                  payload: {
                    ...followUpNews,
                    chainId,
                    chainSequence: 2,
                    title: `UPDATE: ${followUpNews.title}`,
                    impactedAssets: newsItem.impactedAssets,
                    magnitude: newsItem.magnitude * 1.5
                  }
                });
              }
            }, followUpDelay);
          }
          
          dispatch({ type: 'ADD_NEWS', payload: newsItem });
          
          if (newsItem.magnitude > 0.7) {
            toast({
              title: "Breaking News!",
              description: newsItem.title,
              duration: 4000,
              variant: "destructive"
            });
          }
          
          setTimeout(() => {
            dispatch({ type: 'EXPIRE_NEWS', payload: newsItem.id });
          }, 15000);
        }
      });
    }
  }, [state.timeRemaining, state.isPaused, state.isGameOver, eventSchedule, state.assets, state.round, state.eventDensity]);
};
