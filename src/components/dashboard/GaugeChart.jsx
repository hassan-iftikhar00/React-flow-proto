import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import "./GaugeChart.css";

/**
 * Gauge Chart Component
 * Displays percentage with color-coded thresholds
 */
export default function GaugeChart({
  value,
  label,
  thresholds = { green: 95, yellow: 90 },
  reverse = false, // For metrics where lower is better (e.g., drop rate)
}) {
  const percentage = Math.min(100, Math.max(0, value));

  // Determine color based on thresholds
  const getColor = () => {
    if (reverse) {
      // For drop rate, error rate, etc. - lower is better
      if (percentage < thresholds.yellow) return "#10b981"; // green
      if (percentage < thresholds.green) return "#f59e0b"; // yellow
      return "#ef4444"; // red
    } else {
      // For success rate, connection rate, etc. - higher is better
      if (percentage >= thresholds.green) return "#10b981"; // green
      if (percentage >= thresholds.yellow) return "#f59e0b"; // yellow
      return "#ef4444"; // red
    }
  };

  const color = getColor();

  // Create semi-circle gauge data
  const data = [
    { name: "value", value: percentage },
    { name: "empty", value: 100 - percentage },
  ];

  return (
    <div className="gauge-chart">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="70%"
            startAngle={180}
            endAngle={0}
            innerRadius={60}
            outerRadius={80}
            paddingAngle={0}
            dataKey="value"
          >
            <Cell fill={color} />
            <Cell fill="#e5e7eb" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="gauge-value">
        <span className="gauge-percentage">{percentage.toFixed(1)}%</span>
        {label && <span className="gauge-label">{label}</span>}
      </div>
    </div>
  );
}
