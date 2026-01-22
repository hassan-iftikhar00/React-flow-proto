import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import "./HorizontalBarChart.css";

/**
 * Horizontal Bar Chart Component
 * Used for insurance breakdowns, DNIS utilization, etc.
 */
export default function HorizontalBarChart({
  data,
  dataKey = "value",
  nameKey = "name",
  unit = "",
  threshold = null,
  showPercentage = false,
  height = 250,
}) {
  const getBarColor = (value) => {
    if (threshold && value > threshold) {
      return "#ef4444"; // red if above threshold
    }
    return "#3b82f6"; // default blue
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="horizontal-bar-tooltip">
          <p className="tooltip-label">{data[nameKey]}</p>
          <p className="tooltip-value">
            {data[dataKey]}
            {unit}
            {showPercentage &&
              data.percentage &&
              ` (${data.percentage.toFixed(1)}%)`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="horizontal-bar-chart">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
        >
          <XAxis type="number" stroke="#94a3b8" fontSize={12} />
          <YAxis
            type="category"
            dataKey={nameKey}
            stroke="#94a3b8"
            fontSize={12}
            width={120}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f1f5f9" }} />
          <Bar dataKey={dataKey} radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry[dataKey])} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
