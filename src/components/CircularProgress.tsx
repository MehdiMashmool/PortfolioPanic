import React from "react";

type Props = {
  percentage: number;
  size?: number;
  strokeWidth?: number;
};

const CircularProgress: React.FC<Props> = ({
  percentage,
  size = 120,
  strokeWidth = 10,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg width={size} height={size}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#1f2937"
        strokeWidth={strokeWidth}
        fill="transparent"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#f59e0b"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="transparent"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        fontSize="20"
        fill="#f59e0b"
        fontWeight="bold"
      >
        {`${percentage.toFixed(1)}%`}
      </text>
    </svg>
  );
};

export default CircularProgress;
