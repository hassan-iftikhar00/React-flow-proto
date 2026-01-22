import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/**
 * CallVolumeChart Component
 * Displays call volume over time using area chart
 *
 * @param {Object} props
 * @param {Array} props.data - Array of {time, calls} objects
 * @param {number} props.height - Chart height in pixels
 */
export default function CallVolumeChart({ data = [], height = 300 }) {
  const chartData = data.map((item) => ({
    time: item.time || item.hour || item.date,
    calls: item.calls || item.callCount || 0,
  }));

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3>Call Volume</h3>
        <p className="chart-subtitle">Real-time call volume trends</p>
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="time" stroke="#6b7280" style={{ fontSize: "12px" }} />
          <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          />
          <Area
            type="monotone"
            dataKey="calls"
            stroke="#3b82f6"
            fillOpacity={1}
            fill="url(#colorCalls)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
