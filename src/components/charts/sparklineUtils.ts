
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

export const getLineColor = (
  startValue: number,
  currentValue: number,
  defaultColor: string = "#10B981"
) => {
  const isPositive = currentValue >= startValue;
  return isPositive ? '#10B981' : '#EF4444';
};

export const getAreaColor = (lineColor: string) => `${lineColor}20`;
