
import React from 'react';
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, Area } from 'recharts';
import { cn } from "@/lib/utils";
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
  }

  const { enhancedMin, enhancedMax } = calculateChartDomains(data, amplifyVisuals);

  // Convert any string timestamps to numbers first
  const timeMin = typeof data[0]?.timestamp === 'number' 
    ? data[0].timestamp as number 
    : Date.now() - 60000; // Default to 1 minute ago
    
  const timeMax = typeof data[data.length - 1]?.timestamp === 'number' 
    ? data[data.length - 1].timestamp as number 
    : Date.now();
  
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
