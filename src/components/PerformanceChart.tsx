import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Area } from 'recharts';
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

  // Calculate time domain
  const timeValues = formattedData.map(item => item.timeInSeconds);
  const minTime = Math.min(...timeValues);
  const maxTime = Math.max(...timeValues);
  const timeRange = maxTime - minTime;

  // Generate meaningful tick values
  const generateTicks = () => {
    const tickCount = 5;
    const interval = Math.floor(timeRange / (tickCount - 1));
    return Array.from({ length: tickCount }, (_, i) => minTime + i * interval);
  };

  const customTicks = generateTicks();

  // Required chart config
  const config = {
    portfolio: {
      label: 'Portfolio Value',
      color: formattedData[formattedData.length - 1]?.value >= formattedData[0]?.value 
        ? '#10B981' 
        : '#EF4444',
    },
  };

  return (
    <div className="h-full w-full portfolio-chart" style={{ height }}>
      <ChartContainer className="h-full" config={config}>
        <LineChart
          data={formattedData}
          margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
        >
          <CartesianGrid vertical={false} stroke="#2A303C" strokeDasharray="3 3" />
          <XAxis 
            dataKey="timeInSeconds"
            type="number"
            domain={[minTime, maxTime]}
            ticks={customTicks}
            tickFormatter={value => `${Math.abs(value)}s`}
            tick={{ fill: '#8E9196' }}
            tickLine={{ stroke: '#8E9196' }}
            axisLine={{ stroke: '#2A303C' }}
            label={{ 
              value: 'Time (seconds)', 
              position: 'insideBottomRight',
              offset: -5,
              fill: '#8E9196',
              fontSize: 12
            }}
          />
          <YAxis 
            domain={['dataMin', 'dataMax']}
            tickFormatter={(value) => formatCurrency(value).replace('$', '')}
            tick={{ fill: '#8E9196' }}
            tickLine={{ stroke: '#8E9196' }}
            axisLine={{ stroke: '#2A303C' }}
            width={60}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          <defs>
            <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
              <stop 
                offset="5%" 
                stopColor={config.portfolio.color} 
                stopOpacity={0.3} 
              />
              <stop 
                offset="95%" 
                stopColor={config.portfolio.color} 
                stopOpacity={0} 
              />
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
            stroke={config.portfolio.color}
            strokeWidth={2}
            dot={false}
            activeDot={{ 
              r: 4, 
              stroke: config.portfolio.color, 
              strokeWidth: 2, 
              fill: "#1A1F2C" 
            }}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
};

export default PerformanceChart;
