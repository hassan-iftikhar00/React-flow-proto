import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from "recharts";

/**
 * DropRateChart Component
 * Displays drop rate over time with 10% threshold indicator
 *
 * @param {Object} props
 * @param {Array} props.data - Array of {time, dropRate} objects
 * @param {number} props.threshold - Alert threshold percentage (default: 10)
 * @param {number} props.height - Chart height in pixels
 */
export default function DropRateChart({
  data = [],
  threshold = 10,
  height = 300,
}) {
  const chartData = data.map((item) => ({
    time: item.time || item.hour || item.date,
    dropRate: item.dropRate || 0,
    threshold,
  }));

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3>Drop Rate Analysis</h3>
        <p className="chart-subtitle">
          Target: Below {threshold}%
          {chartData.length > 0 &&
            chartData[chartData.length - 1].dropRate > threshold && (
              <span className="alert-badge">⚠ Above Threshold</span>
            )}
        </p>
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorDropRate" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="time" stroke="#6b7280" style={{ fontSize: "12px" }} />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: "12px" }}
            domain={[0, "dataMax + 5"]}
            label={{
              value: "Drop Rate (%)",
              angle: -90,
              position: "insideLeft",
              style: { fontSize: "12px" },
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
            formatter={(value) => [`${value.toFixed(1)}%`, "Drop Rate"]}
          />
          <ReferenceLine
            y={threshold}
            stroke="#f59e0b"
            strokeDasharray="5 5"
            strokeWidth={2}
            label={{
              value: `${threshold}% Threshold`,
              position: "right",
              fill: "#f59e0b",
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey="dropRate"
            stroke="#ef4444"
            fillOpacity={1}
            fill="url(#colorDropRate)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
