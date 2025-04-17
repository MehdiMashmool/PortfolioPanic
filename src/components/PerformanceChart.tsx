
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area } from 'recharts';
import { formatCurrency } from '../utils/marketLogic';
import { ChartContainer } from './ui/chart';
import CustomTooltip from './charts/CustomTooltip';

interface ChartData {
  round: number;
  value: number;
  timestamp?: number;
}

interface PerformanceChartProps {
  data: ChartData[];
  height?: number;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ data, height = 300 }) => {
  if (!data || data.length < 2) {
    return <div className="h-full w-full bg-panel-light/20 rounded flex items-center justify-center" style={{ height }}>
      <span className="text-sm text-gray-400">Waiting for performance data...</span>
    </div>;
  }

  const startValue = data[0]?.value || 0;
  const currentValue = data[data.length - 1]?.value || 0;
  const isPositive = currentValue >= startValue;
  
  // Process timestamps to ensure proper time display
  const startTimestamp = data[0]?.timestamp || Date.now();
  
  // Process the data to calculate relative time in seconds from the start
  const formattedData = data.map(entry => {
    const timestamp = entry.timestamp || Date.now();
    const elapsedSeconds = Math.floor((timestamp - startTimestamp) / 1000);
    
    return {
      ...entry,
      timeInSeconds: elapsedSeconds
    };
  });

  // Calculate meaningful time domain
  const timeValues = formattedData.map(item => item.timeInSeconds);
  const minTime = Math.min(...timeValues);
  const maxTime = Math.max(...timeValues);
  
  // Calculate value domain with padding
  const values = formattedData.map(item => item.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  
  // Add padding to the value domain (10% padding)
  const valuePadding = (maxValue - minValue) * 0.1;
  const minDomain = Math.max(0, minValue - valuePadding);
  const maxDomain = maxValue + valuePadding;

  // Generate meaningful tick values for time axis
  const generateTimeTicks = () => {
    const tickCount = 5;
    const interval = Math.ceil((maxTime - minTime) / (tickCount - 1));
    return Array.from({ length: tickCount }, (_, i) => minTime + i * interval);
  };

  const timeTicks = generateTimeTicks();

  return (
    <div className="h-full w-full portfolio-chart">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={formattedData}
          margin={{ top: 10, right: 20, left: 20, bottom: 30 }}
        >
          <defs>
            <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
              <stop 
                offset="5%" 
                stopColor={isPositive ? '#10B981' : '#EF4444'} 
                stopOpacity={0.4} 
              />
              <stop 
                offset="95%" 
                stopColor={isPositive ? '#10B981' : '#EF4444'} 
                stopOpacity={0} 
              />
            </linearGradient>
          </defs>
        
          <CartesianGrid vertical={false} stroke="#2A303C" strokeDasharray="3 3" />
          
          <XAxis 
            dataKey="timeInSeconds"
            type="number"
            domain={[minTime, maxTime]}
            ticks={timeTicks}
            tickFormatter={value => `-${Math.abs(maxTime - value)}s`}
            tick={{ fill: '#8E9196' }}
            tickLine={{ stroke: '#8E9196' }}
            axisLine={{ stroke: '#2A303C' }}
          />
          
          <YAxis 
            domain={[minDomain, maxDomain]}
            tickFormatter={(value) => formatCurrency(value).replace('$', '')}
            tick={{ fill: '#8E9196' }}
            tickLine={{ stroke: '#8E9196' }}
            axisLine={{ stroke: '#2A303C' }}
            width={60}
          />
          
          <ReferenceLine 
            y={startValue} 
            stroke="rgba(255,255,255,0.3)" 
            strokeDasharray="3 3" 
            label={{ 
              value: formatCurrency(startValue), 
              position: 'left',
              fill: 'rgba(255,255,255,0.5)',
              fontSize: 10
            }}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          <Line
            type="monotone"
            dataKey="value"
            stroke={isPositive ? '#10B981' : '#EF4444'}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ 
              r: 5, 
              stroke: isPositive ? '#10B981' : '#EF4444', 
              strokeWidth: 2, 
              fill: "#1A1F2C" 
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="none"
            fill="url(#portfolioGradient)"
            fillOpacity={0.2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceChart;
