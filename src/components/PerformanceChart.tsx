
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { formatCurrency } from '../utils/marketLogic';
import { ChartContainer, ChartTooltipContent } from './ui/chart';

interface ChartData {
  round: number;
  value: number;
  timestamp?: number;
}

interface PerformanceChartProps {
  data: ChartData[];
  height?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-panel border border-highlight p-2 rounded-md shadow-lg">
        <p className="text-sm font-medium">{`Round ${label}`}</p>
        <p className="text-sm font-semibold">{formatCurrency(payload[0].value)}</p>
        {payload[0].payload.timestamp && (
          <p className="text-xs text-gray-400">
            {new Date(payload[0].payload.timestamp).toLocaleTimeString()}
          </p>
        )}
      </div>
    );
  }
  return null;
};

const PerformanceChart: React.FC<PerformanceChartProps> = ({ data, height = 250 }) => {
  if (!data || data.length < 2) {
    // Return empty or placeholder chart if no data
    return <div className="h-full w-full bg-panel-light/20 rounded flex items-center justify-center" style={{ height }}>
      <span className="text-sm text-gray-400">Waiting for performance data...</span>
    </div>;
  }

  const startValue = data[0]?.value || 0;
  const currentValue = data[data.length - 1]?.value || 0;
  const isPositive = currentValue >= startValue;
  
  // Format data for display with consistent interval if needed
  const formattedData = data.map(entry => ({
    ...entry,
    formattedValue: formatCurrency(entry.value).replace('$', '')
  }));

  // Calculate domain to enhance the visual amplitude
  const values = data.map(item => item.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  
  // Create a narrower domain to amplify visual changes - enhance amplitude for better visibility
  const valueRange = maxValue - minValue || maxValue * 0.1; // Prevent divide by zero
  
  // Use more aggressive padding for small variations to amplify visual changes
  const smallVariation = valueRange < 0.05 * maxValue;
  const paddingFactor = smallVariation ? 0.75 : 0.35; // Increased padding factors
  const padding = valueRange * paddingFactor;
  
  // Set enhanced min/max with extra padding
  const enhancedMin = Math.max(0, minValue - padding * 1.5); // More padding at bottom
  const enhancedMax = maxValue + padding * 2; // More padding at top
  
  const config = {
    portfolio: {
      label: 'Portfolio Value',
      color: isPositive ? '#10B981' : '#EF4444',
    },
  };

  // Determine ticks for Y axis (between 4-7 ticks based on range)
  const calculateYAxisTicks = () => {
    const range = enhancedMax - enhancedMin;
    const tickCount = range > 10000 ? 6 : 5; // More ticks for larger ranges
    const tickInterval = range / tickCount;
    
    // Round to a nice number
    let niceInterval = Math.pow(10, Math.floor(Math.log10(tickInterval)));
    if (tickInterval / niceInterval >= 5) niceInterval *= 5;
    else if (tickInterval / niceInterval >= 2) niceInterval *= 2;
    
    const ticks = [];
    let tick = Math.ceil(enhancedMin / niceInterval) * niceInterval;
    while (tick <= enhancedMax) {
      ticks.push(tick);
      tick += niceInterval;
    }
    
    return ticks;
  };
  
  const yAxisTicks = calculateYAxisTicks();
  
  return (
    <div className="h-full w-full" style={{ height }}>
      <ChartContainer className="h-full" config={config}>
        <LineChart
          data={formattedData}
          margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
        >
          <CartesianGrid vertical={false} stroke="#2A303C" strokeDasharray="3 3" />
          <XAxis 
            dataKey="round"
            tick={{ fill: '#8E9196' }}
            tickLine={{ stroke: '#8E9196' }}
            axisLine={{ stroke: '#2A303C' }}
            label={{ 
              value: 'Round', 
              position: 'insideBottomRight',
              offset: -5,
              fill: '#8E9196',
              fontSize: 12
            }}
          />
          <YAxis 
            domain={[enhancedMin, enhancedMax]}
            ticks={yAxisTicks}
            tickFormatter={(value) => formatCurrency(value).replace('$', '')}
            tick={{ fill: '#8E9196' }}
            tickLine={{ stroke: '#8E9196' }}
            axisLine={{ stroke: '#2A303C' }}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Starting reference line */}
          <ReferenceLine
            y={startValue}
            stroke="#6B7280"
            strokeWidth={1}
            strokeDasharray="3 3"
            label={{
              value: `Start: ${formatCurrency(startValue)}`,
              position: 'left',
              fill: '#8E9196',
              fontSize: 12
            }}
          />
          
          <Line
            name="portfolio"
            type="monotone"
            dataKey="value"
            stroke={isPositive ? '#10B981' : '#EF4444'}
            strokeWidth={2}
            dot={{ fill: '#1A1F2C', stroke: isPositive ? '#10B981' : '#EF4444', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: isPositive ? '#10B981' : '#EF4444' }}
            animationDuration={800}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
};

export default PerformanceChart;
