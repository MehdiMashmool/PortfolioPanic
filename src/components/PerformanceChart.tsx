
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
  
  // Create a narrower domain to amplify visual changes
  const valueRange = maxValue - minValue || maxValue * 0.1; // Prevent divide by zero
  // Use more padding for small variations (common early in game)
  const paddingFactor = valueRange < 0.01 * maxValue ? 0.2 : 0.15; 
  const padding = valueRange * paddingFactor;
  const enhancedMin = Math.max(0, minValue - padding);
  const enhancedMax = maxValue + padding;
  
  const config = {
    portfolio: {
      label: 'Portfolio Value',
      color: isPositive ? '#10B981' : '#EF4444',
    },
  };
  
  return (
    <div className="h-full w-full" style={{ height }}>
      <ChartContainer className="h-full" config={config}>
        <LineChart
          data={formattedData}
          margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
        >
          <CartesianGrid vertical={false} stroke="#2A303C" strokeDasharray="3 3" />
          <XAxis 
            dataKey="round"
            tick={{ fill: '#8E9196' }}
            tickLine={{ stroke: '#8E9196' }}
            axisLine={{ stroke: '#2A303C' }}
          />
          <YAxis 
            domain={[enhancedMin, enhancedMax]}
            tickFormatter={(value) => formatCurrency(value).replace('$', '')}
            tick={{ fill: '#8E9196' }}
            tickLine={{ stroke: '#8E9196' }}
            axisLine={{ stroke: '#2A303C' }}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} />
          {/* Optional starting reference line */}
          <Line
            name="reference"
            type="monotone"
            dataKey={() => startValue}
            stroke="#6B7280"
            strokeWidth={1}
            strokeDasharray="3 3"
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />
          <Line
            name="portfolio"
            type="monotone"
            dataKey="value"
            stroke={isPositive ? '#10B981' : '#EF4444'}
            strokeWidth={2}
            dot={{ fill: '#1A1F2C', stroke: isPositive ? '#10B981' : '#EF4444', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: isPositive ? '#10B981' : '#EF4444' }}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
};

export default PerformanceChart;
