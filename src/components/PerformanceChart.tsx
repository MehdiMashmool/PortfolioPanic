
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../utils/marketLogic';

interface ChartData {
  round: number;
  value: number;
}

interface PerformanceChartProps {
  data: ChartData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-panel border border-highlight p-2 rounded-md">
        <p className="text-sm">{`Round ${label}`}</p>
        <p className="text-sm font-semibold">{`Value: ${formatCurrency(payload[0].value)}`}</p>
      </div>
    );
  }
  return null;
};

const PerformanceChart: React.FC<PerformanceChartProps> = ({ data }) => {
  const startValue = data[0]?.value || 0;
  const currentValue = data[data.length - 1]?.value || 0;
  const isPositive = currentValue >= startValue;
  
  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <CartesianGrid vertical={false} stroke="#2A303C" />
          <XAxis 
            dataKey="round"
            tick={{ fill: '#8E9196' }}
            tickLine={{ stroke: '#8E9196' }}
          />
          <YAxis 
            tickFormatter={(value) => formatCurrency(value).replace('$', '')}
            tick={{ fill: '#8E9196' }}
            tickLine={{ stroke: '#8E9196' }}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={isPositive ? '#10B981' : '#EF4444'}
            strokeWidth={2}
            dot={{ fill: '#1A1F2C', stroke: isPositive ? '#10B981' : '#EF4444', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceChart;
