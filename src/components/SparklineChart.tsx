
import React from 'react';
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, Area, CartesianGrid } from 'recharts';
import { cn } from "@/lib/utils";
import { formatCurrency } from '../utils/marketLogic';
import { getAssetChartColors } from '../utils/chartUtils';
import ChartTooltip from './charts/CustomTooltip';

interface SparklineChartProps {
  data: Array<{ value: number; timestamp?: number | string }>;
  color?: string;
  className?: string;
  height?: number;
  showTooltip?: boolean;
  showAxes?: boolean;
  valuePrefix?: string;
  areaFill?: boolean;
  referenceValue?: number;
  amplifyVisuals?: boolean;
  assetType?: string;
}

const SparklineChart: React.FC<SparklineChartProps> = ({ 
  data,
  color = "#10B981", 
  className,
  height = 30,
  showTooltip = false,
  showAxes = false,
  valuePrefix = '',
  areaFill = false,
  referenceValue,
  amplifyVisuals = true,
  assetType
}) => {
  if (!data || data.length === 0) {
    return <div className={cn("h-[30px] w-full", className)} />;
  }

  const startValue = referenceValue !== undefined ? referenceValue : data[0].value;
  const isPositive = data[data.length - 1].value >= startValue;
  
  let lineColor = color;
  let areaColor = "";
  
  if (assetType) {
    const prices = data.map(d => d.value);
    const colors = getAssetChartColors(assetType, prices);
    lineColor = colors.line;
    areaColor = colors.area;
  } else {
    lineColor = isPositive ? '#10B981' : '#EF4444';
    areaColor = isPositive ? `${lineColor}20` : `${lineColor}20`;
  }
  
  const values = data.map(item => item.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  
  const valueRange = maxValue - minValue || maxValue * 0.1;
  const smallVariation = valueRange < 0.05 * maxValue;
  const paddingFactor = amplifyVisuals 
    ? (smallVariation ? 0.75 : 0.35)
    : (smallVariation ? 0.5 : 0.25);
  
  const padding = valueRange * paddingFactor;
  const enhancedMin = Math.max(0, minValue - padding * 1.5);
  const enhancedMax = maxValue + padding * 2;

  // Format data with proper timestamps
  const formattedData = data.map((entry, index) => {
    const timestamp = typeof entry.timestamp === 'string' 
      ? parseInt(entry.timestamp, 10) 
      : (entry.timestamp || Date.now() - (data.length - index) * 1000);
    
    return {
      ...entry,
      timestamp,
      timeInSeconds: Math.floor((Date.now() - timestamp) / 1000)
    };
  });

  // Calculate time domain
  const timeValues = formattedData.map(item => item.timeInSeconds);
  const minTime = Math.min(...timeValues);
  const maxTime = Math.max(...timeValues);
  const timeRange = maxTime - minTime;

  // Generate tick values that make sense
  const generateTicks = () => {
    const tickCount = 3;
    const interval = Math.floor(timeRange / (tickCount - 1));
    return Array.from({ length: tickCount }, (_, i) => minTime + i * interval);
  };

  const customTicks = generateTicks();

  return (
    <div className={cn("h-[30px] w-full", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart 
          data={formattedData}
          margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
        >
          {showAxes && (
            <CartesianGrid vertical={false} stroke="#2A303C" strokeDasharray="3 3" />
          )}
          <XAxis 
            dataKey="timeInSeconds"
            type="number"
            domain={[minTime, maxTime]}
            ticks={customTicks}
            tickFormatter={value => `${Math.abs(value)}s`}
            tick={{ fill: '#8E9196', fontSize: 10 }}
            tickLine={{ stroke: '#8E9196' }}
            axisLine={{ stroke: '#2A303C' }}
            allowDataOverflow={false}
            interval="preserveStartEnd"
          />
          <YAxis 
            domain={[enhancedMin, enhancedMax]}
            hide={true}
          />
          {showTooltip && (
            <Tooltip 
              content={<ChartTooltip valuePrefix={valuePrefix} />}
              cursor={{ stroke: '#4B5563', strokeWidth: 1 }}
            />
          )}
          {areaFill && (
            <>
              <defs>
                <linearGradient id={`sparklineGradient-${assetType || 'default'}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={lineColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="linear"
                dataKey="value"
                stroke="none"
                fill={`url(#sparklineGradient-${assetType || 'default'})`}
                fillOpacity={0.2}
              />
            </>
          )}
          <Line
            type="linear"
            dataKey="value"
            stroke={lineColor}
            strokeWidth={2}
            dot={false}
            activeDot={showTooltip ? { r: 4, stroke: lineColor, strokeWidth: 2, fill: "#1A1F2C" } : false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SparklineChart;
