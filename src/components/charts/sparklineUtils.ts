
export const calculateChartDomains = (
  data: Array<{ value: number, timeInSeconds?: number }>,
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

export const formatTimeLabel = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m${remainingSeconds ? ` ${remainingSeconds}s` : ''}`;
};

export const interpolateData = (
  baseData: Array<{ value: number; timestamp?: number }>, 
  targetLength: number
) => {
  if (baseData.length >= targetLength) return baseData;

  const interpolatedData: Array<{ value: number; timestamp?: number }> = [];
  const lengthMultiplier = (baseData.length - 1) / (targetLength - 1);

  for (let i = 0; i < targetLength; i++) {
    const index = Math.floor(i * lengthMultiplier);
    const nextIndex = Math.min(index + 1, baseData.length - 1);
    
    const currentValue = baseData[index].value;
    const nextValue = baseData[nextIndex].value;
    const interpolationFactor = (i * lengthMultiplier) - index;
    
    const interpolatedValue = currentValue + (nextValue - currentValue) * interpolationFactor;
    
    interpolatedData.push({
      value: interpolatedValue,
      timestamp: baseData[index].timestamp
    });
  }

  return interpolatedData;
};
