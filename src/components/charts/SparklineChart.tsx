
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area } from 'recharts';
import { cn } from "@/lib/utils";
import { formatCurrency } from '../../utils/marketLogic';
import CustomTooltip from './CustomTooltip';
import { calculateChartDomains } from './sparklineUtils';
import { getAssetChartColors } from '../../utils/chartUtils';

interface SparklineChartProps {
  data: Array<{ value: number; timestamp?: number | string }>;
  color?: string;
  className?: string;
  height?: number;
  showTooltip?: boolean;
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
  const currentValue = data[data.length - 1].value;
  const isPositive = currentValue >= startValue;
  
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

  const { enhancedMin, enhancedMax } = calculateChartDomains(data, amplifyVisuals);

  // Convert timestamps to seconds from start
  const startTime = Number(data[0]?.timestamp) || Date.now();
  const formattedData = data.map(entry => ({
    ...entry,
    timeInSeconds: Math.floor((Number(entry.timestamp) - startTime) / 1000)
  }));

  // Find min and max time for domain
  const timeValues = formattedData.map(item => item.timeInSeconds);
  const minTime = 0; // Always start at 0 seconds
  const maxTime = Math.max(...timeValues);

  return (
    <div className={cn("h-[30px] w-full", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart 
          data={formattedData}
          margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
        >
          <CartesianGrid vertical={false} stroke="#2A303C" strokeDasharray="3 3" />
          <XAxis 
            dataKey="timeInSeconds"
            type="number"
            domain={[minTime, maxTime]}
            tick={{ fill: '#8E9196' }}
            tickLine={{ stroke: '#8E9196' }}
            axisLine={{ stroke: '#2A303C' }}
            tickFormatter={(value) => `${value}s`}
            allowDecimals={false}
          />
          <YAxis 
            domain={[enhancedMin, enhancedMax]}
            hide={true}
          />
          {showTooltip && (
            <Tooltip 
              content={<CustomTooltip valuePrefix={valuePrefix} />}
              cursor={{ stroke: '#4B5563', strokeWidth: 1 }}
            />
          )}
          {areaFill && (
            <>
              <defs>
                <linearGradient id={`sparklineGradient-${assetType}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={lineColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="linear"
                dataKey="value"
                stroke="none"
                fill={`url(#sparklineGradient-${assetType})`}
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
