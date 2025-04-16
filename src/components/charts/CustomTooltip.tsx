
import { formatCurrency } from '../../utils/marketLogic';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: { timestamp?: number | string; timeInSeconds?: number } }>;
  valuePrefix?: string;
  labelFormatter?: (label: any) => string;
}

const CustomTooltip = ({ active, payload, valuePrefix, labelFormatter }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip bg-panel border border-highlight p-2 rounded-md shadow-lg">
        <p className="text-sm font-semibold tooltip-value">
          {valuePrefix || ''}{formatCurrency(payload[0].value)}
        </p>
        {labelFormatter && payload[0].payload.timeInSeconds !== undefined && (
          <p className="text-xs text-gray-400 tooltip-time">
            {labelFormatter(payload[0].payload.timeInSeconds)}
          </p>
        )}
        {!labelFormatter && payload[0].payload.timestamp && (
          <p className="text-xs text-gray-400 tooltip-time">
            {new Date(Number(payload[0].payload.timestamp)).toLocaleTimeString()}
          </p>
        )}
      </div>
    );
  }
  return null;
};

export default CustomTooltip;
