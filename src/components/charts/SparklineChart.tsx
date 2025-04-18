import React, { useMemo } from 'react';
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, Area, CartesianGrid } from 'recharts';
import { cn } from "@/lib/utils";
import { formatCurrency } from '../../utils/marketLogic';
import { getAssetChartColors } from '../../utils/chartUtils';
import { calculateChartDomains, formatTimeLabel } from './sparklineUtils';
import ChartTooltip from './CustomTooltip';

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
  height = 40,
  showTooltip = false,
  showAxes = false,
  valuePrefix = '',
  areaFill = true,
  referenceValue,
  amplifyVisuals = true,
  assetType
}) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Ensure timestamps are consistent
    const baseTimestamp = data[0].timestamp ? Number(data[0].timestamp) : Date.now();
    
    return data.map((entry, index) => {
      const timestamp = entry.timestamp 
        ? Number(entry.timestamp) 
        : baseTimestamp + index * 1000;

      return {
        ...entry,
        timestamp,
        timeInSeconds: Math.floor((timestamp - baseTimestamp) / 1000)
      };
    });
  }, [data]);

  if (!chartData || chartData.length === 0) {
    return <div className={cn("h-[40px] w-full", className)} />;
  }

  const startValue = referenceValue !== undefined ? referenceValue : chartData[0].value;
  const currentValue = chartData[chartData.length - 1].value;
  const isPositive = currentValue >= startValue;
  
  let lineColor = color;
  let areaColor = "";
  
  if (assetType) {
    const prices = chartData.map(d => d.value);
    const colors = getAssetChartColors(assetType, prices);
    lineColor = colors.line;
    areaColor = colors.area;
  } else {
    lineColor = isPositive ? '#10B981' : '#EF4444';
    areaColor = isPositive ? `${lineColor}20` : `${lineColor}20`;
  }

  // More amplified domain calculation
  const values = chartData.map(d => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue || maxValue * 0.1;
  
  // Amplify the visuals more to show fluctuations clearly
  const paddingFactor = amplifyVisuals ? 0.3 : 0.1;
  const padding = valueRange * paddingFactor;
  
  const enhancedMin = Math.max(0, minValue - padding * 2);
  const enhancedMax = maxValue + padding * 2;

  const timeValues = chartData.map(item => item.timeInSeconds || 0);
  const minTime = Math.min(...timeValues);
  const maxTime = Math.max(...timeValues);
  
  // Add more ticks for better time representation
  const timeTicks = [minTime, Math.floor((minTime + maxTime) / 3), Math.floor((minTime + maxTime) * 2/3), maxTime];

  return (
    <div className={cn("h-[40px] w-full", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart 
          data={chartData}
          margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
        >
          {showAxes && (
            <CartesianGrid vertical={false} stroke="#2A303C" strokeDasharray="3 3" />
          )}
          <XAxis 
            dataKey="timeInSeconds"
            type="number"
            domain={[minTime, maxTime]}
            ticks={timeTicks}
            tickFormatter={(value) => formatTimeLabel(Number(value))}
            tick={{ fill: '#8E9196', fontSize: 10 }}
            tickLine={{ stroke: '#8E9196' }}
            axisLine={{ stroke: '#2A303C' }}
          />
          <YAxis 
            domain={[enhancedMin, enhancedMax]}
            hide={true}
            tickFormatter={(value) => formatCurrency(value)}
          />
          {showTooltip && (
            <Tooltip 
              content={
                <ChartTooltip 
                  valuePrefix={valuePrefix} 
                  labelFormatter={(label) => formatTimeLabel(Number(label))}
                />
              }
              cursor={{ stroke: '#4B5563', strokeWidth: 1 }}
            />
          )}
          {areaFill && (
            <>
              <defs>
                <linearGradient id={`sparklineGradient-${assetType || 'default'}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={lineColor} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={lineColor} stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke="none"
                fill={`url(#sparklineGradient-${assetType || 'default'})`}
                fillOpacity={0.3} 
              />
            </>
          )}
          <Line
            type="monotone"
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
