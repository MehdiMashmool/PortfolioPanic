
import React from 'react';
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine, Area } from 'recharts';
import { cn } from '@/lib/utils';
import { formatCurrency } from '../utils/marketLogic';
import { getAssetChartColors } from '../utils/chartUtils';

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

const CustomTooltip = ({ active, payload, label, valuePrefix }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip bg-panel border border-highlight p-2 rounded-md shadow-lg">
        <p className="text-sm font-semibold tooltip-value">{valuePrefix || ''}{formatCurrency(payload[0].value)}</p>
        {payload[0].payload.timestamp && (
          <p className="text-xs text-gray-400 tooltip-time">
            {new Date(payload[0].payload.timestamp).toLocaleTimeString()}
          </p>
        )}
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
    lineColor = isPositive ? color : "#EF4444";
    areaColor = isPositive ? `${lineColor}20` : `${lineColor}20`;
  }
  
  // Calculate domain to enhance the visual amplitude
  const values = data.map(item => item.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  
  const valueRange = maxValue - minValue || maxValue * 0.1;
  const smallVariation = valueRange < 0.05 * maxValue;
  const paddingFactor = amplifyVisuals 
    ? (smallVariation ? 0.8 : 0.4) 
    : (smallVariation ? 0.5 : 0.25);
  
  const padding = valueRange * paddingFactor;
  const enhancedMin = Math.max(0, minValue - padding);
  const enhancedMax = maxValue + padding * 1.2;
  
  return (
    <div className={cn("h-[30px] w-full sparkline-chart", className)}>
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
            <ReferenceLine
              y={referenceValue}
              stroke="#6B7280"
              strokeWidth={1}
              strokeDasharray="3 3"
              ifOverflow="extendDomain"
            />
          )}
          {areaFill && (
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="none" 
              fillOpacity={1} 
              fill={areaColor} 
              animationDuration={500}
            />
          )}
          <Line
            type="monotone"
            dataKey="value"
            stroke={lineColor}
            strokeWidth={2}
            dot={false}
            activeDot={showTooltip ? { r: 4, stroke: lineColor, strokeWidth: 1, fill: "#1A1F2C" } : false}
            isAnimationActive={true}
            connectNulls={true}
            animationDuration={500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SparklineChart;
