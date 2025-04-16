
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area } from 'recharts';
import { formatCurrency } from '../utils/marketLogic';
import { ChartContainer, ChartTooltipContent } from './ui/chart';
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
  
  // Format data with consistent time in seconds starting from 0
  const startTime = data[0]?.timestamp || Date.now();
  const formattedData = data.map(entry => ({
    ...entry,
    timeInSeconds: Math.floor((entry.timestamp - startTime) / 1000)
  }));

  // Calculate display domains
  const values = data.map(item => item.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  
  const valueRange = maxValue - minValue || maxValue * 0.1;
  const smallVariation = valueRange < 0.05 * maxValue;
  const paddingFactor = smallVariation ? 0.75 : 0.35;
  const padding = valueRange * paddingFactor;
  
  const enhancedMin = Math.max(0, minValue - padding * 1.5);
  const enhancedMax = maxValue + padding * 2;

  // Find min and max time for domain
  const timeValues = formattedData.map(item => item.timeInSeconds);
  const minTime = 0; // Always start at 0 seconds
  const maxTime = Math.max(...timeValues);

  const config = {
    portfolio: {
      label: 'Portfolio Value',
      color: isPositive ? '#10B981' : '#EF4444',
    },
  };

  const calculateYAxisTicks = () => {
    const range = enhancedMax - enhancedMin;
    const tickCount = range > 10000 ? 6 : 5;
    const tickInterval = range / tickCount;
    
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
    <div className="h-full w-full portfolio-chart" style={{ height }}>
      <ChartContainer className="h-full" config={config}>
        <LineChart
          data={formattedData}
          margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
        >
          <CartesianGrid vertical={false} stroke="#2A303C" strokeDasharray="3 3" className="grid" />
          <XAxis 
            dataKey="timeInSeconds"
            tick={{ fill: '#8E9196' }}
            tickLine={{ stroke: '#8E9196' }}
            axisLine={{ stroke: '#2A303C' }}
            domain={[minTime, maxTime]}
            allowDecimals={false}
            tickFormatter={(value) => `${value}s`}
            label={{ 
              value: 'Time (seconds)', 
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
          
          <defs>
            <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={isPositive ? '#10B981' : '#EF4444'} stopOpacity={0.3} />
              <stop offset="95%" stopColor={isPositive ? '#10B981' : '#EF4444'} stopOpacity={0} />
            </linearGradient>
          </defs>
          
          <Area
            type="linear"
            dataKey="value"
            stroke="none"
            fill="url(#portfolioGradient)"
            fillOpacity={0.1}
          />
          
          <Line
            type="linear"
            dataKey="value"
            stroke={isPositive ? '#10B981' : '#EF4444'}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, stroke: isPositive ? '#10B981' : '#EF4444', strokeWidth: 2, fill: "#1A1F2C" }}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
};

export default PerformanceChart;
