
import { EventDensity } from '../types/game';

// Define event density configuration for each round
export const getRoundEventDensity = (round: number): EventDensity => {
  if (round <= 3) {
    // Early game - Simple, predictable events
    return {
      minEvents: 1,
      maxEvents: 2,
      minTimeBetween: 20000, // 20 seconds
      maxTimeBetween: 30000, // 30 seconds
      chanceOfChainedEvent: 0,
      chanceOfDelayedEvent: 0,
      chanceOfHighImpactEvent: 0.05
    };
  } else if (round <= 6) {
    // Mid game - More events, some complexity
    return {
      minEvents: 2,
      maxEvents: 4,
      minTimeBetween: 10000, // 10 seconds
      maxTimeBetween: 20000, // 20 seconds
      chanceOfChainedEvent: 0.2,
      chanceOfDelayedEvent: 0.1,
      chanceOfHighImpactEvent: 0.15
    };
  } else if (round <= 8) {
    // Late game - High frequency, unpredictable
    return {
      minEvents: 3,
      maxEvents: 5,
      minTimeBetween: 5000, // 5 seconds
      maxTimeBetween: 15000, // 15 seconds
      chanceOfChainedEvent: 0.3,
      chanceOfDelayedEvent: 0.25,
      chanceOfHighImpactEvent: 0.25
    };
  } else {
    // End game - Chaotic, high pressure
    return {
      minEvents: 4,
      maxEvents: 7,
      minTimeBetween: 3000, // 3 seconds
      maxTimeBetween: 8000, // 8 seconds
      chanceOfChainedEvent: 0.4,
      chanceOfDelayedEvent: 0.3,
      chanceOfHighImpactEvent: 0.35
    };
  }
};

// Function to calculate how many news events should occur in a round
export const calculateRoundEventCount = (density: EventDensity): number => {
  return Math.floor(Math.random() * (density.maxEvents - density.minEvents + 1)) + density.minEvents;
};

// Function to schedule when events should happen in a round
export const scheduleRoundEvents = (count: number, roundDuration: number, density: EventDensity): number[] => {
  const eventTimings: number[] = [];
  let availableTime = roundDuration * 1000; // Convert to milliseconds
  
  // Reserve some time at the start and end
  const startBuffer = 2000; // 2 seconds buffer at start
  const endBuffer = 3000; // 3 seconds buffer at end
  availableTime -= (startBuffer + endBuffer);
  
  // For chaotic late rounds, add cliffhanger event at the very end
  if (density.chanceOfHighImpactEvent > 0.3 && Math.random() < 0.5) {
    eventTimings.push(roundDuration * 1000 - endBuffer + 500); // 0.5s before end
    count--;
  }
  
  // Distribute remaining events
  const timeSegment = availableTime / (count + 1); // +1 to create space between events
  
  for (let i = 0; i < count; i++) {
    let baseTime = startBuffer + (i + 1) * timeSegment;
    
    // Add randomness to timing (more in later rounds)
    const variability = timeSegment * 0.5 * Math.min(density.chanceOfHighImpactEvent * 2, 1);
    const randomOffset = (Math.random() * 2 - 1) * variability; // Between -variability and +variability
    baseTime += randomOffset;
    
    // Ensure event is within round bounds
    baseTime = Math.min(Math.max(baseTime, startBuffer), roundDuration * 1000 - endBuffer);
    
    eventTimings.push(baseTime);
  }
  
  // Sort by time
  return eventTimings.sort((a, b) => a - b);
};

// Function to decide if an event should be part of a multi-phase chain
export const shouldBeChainedEvent = (density: EventDensity): boolean => {
  return Math.random() < density.chanceOfChainedEvent;
};

// Function to decide if an event should have a delayed effect
export const shouldBeDelayedEvent = (density: EventDensity): boolean => {
  return Math.random() < density.chanceOfDelayedEvent;
};

// Function to decide if an event should be high impact
export const shouldBeHighImpactEvent = (density: EventDensity): boolean => {
  return Math.random() < density.chanceOfHighImpactEvent;
};
