import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

/**
 * Simple Donut Chart Component
 * Generic donut for percentages
 */
export default function SimpleDonut({
  data = [],
  colors = ["#3b82f6", "#e5e7eb"],
  height = 180,
}) {
  if (!data || data.length === 0) {
    return (
      <div
        style={{
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#94a3b8",
        }}
      >
        No data
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={75}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
