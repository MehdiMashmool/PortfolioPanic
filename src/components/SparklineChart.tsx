
import React from 'react';
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, TooltipProps } from 'recharts';
import { cn } from '@/lib/utils';
import { formatCurrency } from '../utils/marketLogic';

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
}

const CustomTooltip = ({ active, payload, valuePrefix }: TooltipProps<number, string> & { valuePrefix?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-panel border border-highlight p-2 rounded-md text-xs shadow-md">
        <p className="font-medium">{valuePrefix || ''}{payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

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
}) => {
  if (!data || data.length === 0) {
    return <div className={cn("h-[30px] w-full", className)} />;
  }

  // Use the reference value if provided, otherwise use the first value in the data
  const startValue = referenceValue !== undefined ? referenceValue : data[0].value;
  const isPositive = data[data.length - 1].value >= startValue;
  const lineColor = isPositive ? color : "#EF4444";
  
  // Calculate domain to enhance the visual amplitude
  const values = data.map(item => item.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  
  // Create an enhanced domain to amplify visual changes
  const valueRange = maxValue - minValue || maxValue * 0.1; // Prevent divide by zero
  const paddingFactor = valueRange < 0.01 * maxValue ? 0.5 : 0.25; // More padding for small variations
  const padding = valueRange * paddingFactor;
  const enhancedMin = Math.max(0, minValue - padding);
  const enhancedMax = maxValue + padding;

  return (
    <div className={cn("h-[30px] w-full", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          {showAxes && (
            <>
              <XAxis 
                dataKey="timestamp" 
                tick={false} 
                axisLine={false} 
                tickLine={false}
              />
              <YAxis 
                hide={!showAxes}
                domain={[enhancedMin, enhancedMax]}
                tick={false}
                axisLine={false}
                tickLine={false}
              />
            </>
          )}
          {!showAxes && (
            <YAxis 
              domain={[enhancedMin, enhancedMax]}
              hide={true}
            />
          )}
          {showTooltip && (
            <Tooltip 
              content={<CustomTooltip valuePrefix={valuePrefix} />} 
              cursor={{ stroke: '#4B5563', strokeWidth: 1, strokeDasharray: '3 3' }}
            />
          )}
          {referenceValue !== undefined && (
            <Line
              type="monotone"
              dataKey={() => referenceValue}
              stroke="#6B7280"
              strokeWidth={1}
              strokeDasharray="3 3"
              dot={false}
              isAnimationActive={false}
            />
          )}
          <Line
            type="monotone"
            dataKey="value"
            stroke={lineColor}
            strokeWidth={1.5}
            dot={false}
            activeDot={showTooltip ? { r: 4, stroke: lineColor, strokeWidth: 1, fill: "#1A1F2C" } : false}
            isAnimationActive={true}
            connectNulls={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SparklineChart;
