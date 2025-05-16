import { cn } from "@/lib/utils";
import React, { useId, useMemo } from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { getAssetChartColors } from "../../utils/chartUtils";

interface AssetAreaChartProps {
  data: Array<{ value: number; timestamp?: number | string }>;
  color?: string;
  className?: string;
  height?: number;
  showTooltip?: boolean;
  showAxes?: boolean;
  valuePrefix?: string;
  areaFill?: boolean;
  referenceValue?: number;
  amplifyVisuals?: boolean;
  assetType?: string;
}

const AssetAreaChart: React.FC<AssetAreaChartProps> = ({
  data,
  color = "#10B981",
  className,
  referenceValue,
  assetType,
}) => {
  const chartId = useId();
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const baseTimestamp = data[0].timestamp
      ? Number(data[0].timestamp)
      : Date.now();

    return data.map((entry, index) => {
      const timestamp = entry.timestamp
        ? Number(entry.timestamp)
        : baseTimestamp + index * 1000;

      return {
        ...entry,
        timestamp,
        timeInSeconds: Math.floor((timestamp - baseTimestamp) / 1000),
      };
    });
  }, [data]);

  if (!chartData || chartData.length === 0) {
    return <div className={cn("h-[40px] w-full", className)} />;
  }

  const startValue =
    referenceValue !== undefined ? referenceValue : chartData[0].value;
  const currentValue = chartData[chartData.length - 1].value;
  const isPositive = currentValue >= startValue;

  let lineColor = color;
  let areaColor = "";

  if (assetType) {
    const prices = chartData.map((d) => d.value);
    const colors = getAssetChartColors(assetType, prices);
    lineColor = colors.line;
    areaColor = colors.area;
  } else {
    lineColor = isPositive ? "#10B981" : "#EF4444";
    areaColor = isPositive ? `${lineColor}20` : `${lineColor}20`;
  }

  return (
    <div className={cn("h-[40px] w-full", className)}>
      <ResponsiveContainer width="100%" height={70}>
        <AreaChart
          height={70}
          data={data}
          syncId={chartId}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient
              id={`sparklineGradient-${chartId}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={lineColor} stopOpacity={0.2} />
              <stop offset="50%" stopColor={lineColor} stopOpacity={0.05} />
              <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke="none"
            fill={`url(#sparklineGradient-${chartId})`}
            fillOpacity={1}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={lineColor}
            fill={"transparent"}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AssetAreaChart;
