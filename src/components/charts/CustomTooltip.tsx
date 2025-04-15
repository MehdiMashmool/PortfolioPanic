
import { formatCurrency } from '../../utils/marketLogic';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: { timestamp?: number | string } }>;
  valuePrefix?: string;
}

const CustomTooltip = ({ active, payload, valuePrefix }: CustomTooltipProps) => {
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

export default CustomTooltip;
