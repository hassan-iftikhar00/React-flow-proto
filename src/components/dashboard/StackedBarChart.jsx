import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import "./StackedBarChart.css";

/**
 * Stacked Bar Chart Component
 * Used for Active Calls Real-Time, Transcription API Usage
 */
export default function StackedBarChart({
  data,
  categories,
  colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"],
  height = 250,
  horizontal = false,
}) {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum, entry) => sum + entry.value, 0);
      return (
        <div className="stacked-bar-tooltip">
          <p className="tooltip-label">{label}</p>
          <div className="tooltip-items">
            {payload.map((entry, index) => (
              <div key={index} className="tooltip-item">
                <span
                  className="tooltip-dot"
                  style={{ backgroundColor: entry.color }}
                ></span>
                <span className="tooltip-name">{entry.name}:</span>
                <span className="tooltip-value">{entry.value}</span>
              </div>
            ))}
            <div className="tooltip-total">
              <span>Total:</span>
              <span>{total}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (horizontal) {
    return (
      <div className="stacked-bar-chart">
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
          >
            <XAxis type="number" stroke="#94a3b8" fontSize={12} />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#94a3b8"
              fontSize={12}
              width={100}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f1f5f9" }} />
            <Legend iconType="circle" />
            {categories.map((category, index) => (
              <Bar
                key={category}
                dataKey={category}
                stackId="a"
                fill={colors[index % colors.length]}
                radius={index === categories.length - 1 ? [0, 4, 4, 0] : 0}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="stacked-bar-chart">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
          <YAxis stroke="#94a3b8" fontSize={12} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f1f5f9" }} />
          <Legend iconType="circle" />
          {categories.map((category, index) => (
            <Bar
              key={category}
              dataKey={category}
              stackId="a"
              fill={colors[index % colors.length]}
              radius={index === categories.length - 1 ? [4, 4, 0, 0] : 0}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
