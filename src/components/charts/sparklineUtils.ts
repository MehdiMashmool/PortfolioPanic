
export const calculateChartDomains = (
  data: Array<{ value: number }>,
  amplifyVisuals: boolean = true
) => {
  const values = data.map(item => item.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  
  const valueRange = maxValue - minValue || maxValue * 0.1;
  const smallVariation = valueRange < 0.05 * maxValue;
  const paddingFactor = amplifyVisuals 
    ? (smallVariation ? 0.75 : 0.35)
    : (smallVariation ? 0.5 : 0.25);
  
  const padding = valueRange * paddingFactor;
  
  return {
    enhancedMin: Math.max(0, minValue - padding * 1.5),
    enhancedMax: maxValue + padding * 2
  };
};

export const calculateTimeAxis = (
  data: Array<{ timestamp?: number }>,
  defaultInterval: number = 1000
) => {
  if (!data.length) return { minTime: 0, maxTime: 60, interval: defaultInterval };

  const timestamps = data
    .map(item => item.timestamp || 0)
    .filter(timestamp => timestamp > 0);

  if (timestamps.length < 2) {
    return { minTime: 0, maxTime: 60, interval: defaultInterval };
  }

  const minTime = Math.min(...timestamps);
  const maxTime = Math.max(...timestamps);
  const timeRange = maxTime - minTime;

  // Calculate a reasonable interval based on the time range
  let interval = Math.max(Math.floor(timeRange / 5), defaultInterval);
  interval = Math.ceil(interval / defaultInterval) * defaultInterval;

  return {
    minTime,
    maxTime,
    interval
  };
};

export const formatTimeLabel = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m${remainingSeconds ? ` ${remainingSeconds}s` : ''}`;
};
