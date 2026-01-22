import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

/**
 * TemplateGroupBarChart Component
 * Displays call distribution across template groups
 *
 * @param {Object} props
 * @param {Object} props.data - Object with template group names as keys and counts as values
 * @param {number} props.height - Chart height in pixels
 */
export default function TemplateGroupBarChart({ data = {}, height = 300 }) {
  // Transform object to array for Recharts
  const chartData = Object.entries(data)
    .map(([name, count]) => ({
      name,
      count,
    }))
    .sort((a, b) => b.count - a.count); // Sort by count descending

  // Color palette for bars
  const colors = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
    "#ec4899",
  ];

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3>Template Group Distribution</h3>
        <p className="chart-subtitle">
          {chartData.length} template groups
          {chartData.length > 0 &&
            ` • Top: ${chartData[0].name} (${chartData[0].count} calls)`}
        </p>
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="name"
            stroke="#6b7280"
            angle={-45}
            textAnchor="end"
            height={80}
            style={{ fontSize: "12px" }}
          />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: "12px" }}
            label={{
              value: "Call Count",
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
            formatter={(value) => [value, "Calls"]}
          />
          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
