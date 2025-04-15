
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

  return (
    <div className={`h-[100px] ${className}`}>
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
    </div>
  );
};

export default AllocationPieChart;
