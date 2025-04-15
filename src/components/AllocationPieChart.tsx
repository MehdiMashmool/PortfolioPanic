
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatPercentage } from '../utils/marketLogic';

interface AllocationData {
  name: string;
  value: number;
  color: string;
}

interface AllocationPieChartProps {
  data: AllocationData[];
  className?: string;
}

const AllocationPieChart: React.FC<AllocationPieChartProps> = ({ data, className }) => {
  if (!data || data.length === 0) {
    return <div className={`h-[100px] ${className}`}>No allocation data</div>;
  }

  // Calculate a summary string
  const summaryText = data.length > 1 
    ? `${data.length} assets` 
    : data[0].name;
  
  const percentText = data.length > 1 
    ? "100%" 
    : "100%";

  return (
    <div className={`h-[100px] ${className} flex items-center justify-center relative`}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={25}
            outerRadius={40}
            paddingAngle={2}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
            stroke="#0F172A"
            strokeWidth={1}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => formatPercentage(value)}
            labelFormatter={(index: number) => data[index].name}
            contentStyle={{ 
              backgroundColor: '#1E293B', 
              borderColor: '#334155', 
              borderRadius: '0.375rem',
              color: '#fff' 
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        <div className="text-xs font-medium text-gray-300">{percentText}</div>
        <div className="text-xs text-gray-400">of portfolio</div>
      </div>
    </div>
  );
};

export default AllocationPieChart;
