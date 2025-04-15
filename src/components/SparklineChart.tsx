import React from 'react';
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine, Area, CartesianGrid } from 'recharts';
import { cn } from "@/lib/utils";
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
        <p className="text-sm font-semibold tooltip-value">
          {valuePrefix || ''}{formatCurrency(payload[0].value)}
        </p>
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
  // Don't render if there's no data
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
  
  // Calculate domain with enhanced visual amplitude
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

  // Calculate time domain for X-axis
  const timeMin = Number(data[0]?.timestamp) || Date.now();
  const timeMax = Number(data[data.length - 1]?.timestamp) || Date.now();
  
  return (
    <div className={cn("h-[30px] w-full", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart 
          data={data} 
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        >
          <YAxis 
            domain={[enhancedMin, enhancedMax]}
            hide={true}
          />
          <XAxis 
            dataKey="timestamp"
            type="number"
            domain={[timeMin, timeMax]}
            hide={true}
          />
          {showTooltip && (
            <Tooltip 
              content={<CustomTooltip valuePrefix={valuePrefix} />}
              cursor={{ stroke: '#4B5563', strokeWidth: 1 }}
            />
          )}
          {areaFill && (
            <Area
              type="monotone"
              dataKey="value"
              stroke="none"
              fill={areaColor}
              fillOpacity={0.2}
            />
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
