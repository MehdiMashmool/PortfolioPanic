
import React from 'react';
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine, Area, TooltipProps } from 'recharts';
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

const CustomTooltip = ({ active, payload, valuePrefix }: TooltipProps<number, string> & { valuePrefix?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-panel border border-highlight p-2 rounded-md text-xs shadow-md">
        <p className="font-medium">{valuePrefix || ''}{formatCurrency(payload[0].value)}</p>
        {payload[0].payload && payload[0].payload.timestamp && (
          <p className="text-xs text-gray-400">
            {typeof payload[0].payload.timestamp === 'number' 
              ? new Date(payload[0].payload.timestamp).toLocaleTimeString() 
              : payload[0].payload.timestamp}
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

  // Use the reference value if provided, otherwise use the first value in the data
  const startValue = referenceValue !== undefined ? referenceValue : data[0].value;
  const isPositive = data[data.length - 1].value >= startValue;
  
  // Get color based on asset type and price trend if assetType is provided
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
  
  // Create an enhanced domain to amplify visual changes
  const valueRange = maxValue - minValue || maxValue * 0.1; // Prevent divide by zero
  
  // Use more aggressive padding for small variations to enhance visual differences
  const smallVariation = valueRange < 0.05 * maxValue;
  
  // Apply more aggressive visual amplification
  const paddingFactor = amplifyVisuals 
    ? (smallVariation ? 0.8 : 0.4)     // More padding when amplification is enabled
    : (smallVariation ? 0.5 : 0.25);   // Original padding factors
  
  const padding = valueRange * paddingFactor;
  const enhancedMin = Math.max(0, minValue - padding);
  const enhancedMax = maxValue + padding * 1.2; // Extra padding on top for visual appeal
  
  // Gradient for area fill
  const gradientId = `gradient-${Math.random().toString(36).substring(2, 9)}`;
  
  // Configuration for sparklines
  const sparklineConfig = {
    lineWidth: 1.5,        // Line thickness
    showArea: true,        // Fill area under the line
    showPoints: false,     // Don't show individual data points
    showAxes: false,       // No axes
    showGrid: false,       // No grid lines
  };
  
  return (
    <div className={cn("h-[30px] w-full sparkline-chart", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={lineColor} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={lineColor} stopOpacity={0}/>
            </linearGradient>
          </defs>
          
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
              fill={areaColor || `url(#${gradientId})`} 
              animationDuration={500}
            />
          )}
          <Line
            type="monotone"
            dataKey="value"
            stroke={lineColor}
            strokeWidth={sparklineConfig.lineWidth}
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
