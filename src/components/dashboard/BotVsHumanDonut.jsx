import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

/**
 * BotVsHumanDonut Component
 * Displays bot vs human handler distribution
 *
 * @param {Object} props
 * @param {Object} props.data - {bot: number, human: number}
 * @param {number} props.height - Chart height in pixels
 */
export default function BotVsHumanDonut({
  data = { bot: 0, human: 0 },
  height = 300,
}) {
  const chartData = [
    { name: "Bot Handled", value: data.bot, color: "#3b82f6" },
    { name: "Human Handled", value: data.human, color: "#10b981" },
  ];

  const total = data.bot + data.human;
  const botPercentage = total > 0 ? ((data.bot / total) * 100).toFixed(1) : 0;
  const humanPercentage =
    total > 0 ? ((data.human / total) * 100).toFixed(1) : 0;

  const renderLabel = (entry) => {
    const percentage = total > 0 ? ((entry.value / total) * 100).toFixed(0) : 0;
    return `${percentage}%`;
  };

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3>Bot vs Human Handler</h3>
        <p className="chart-subtitle">Call distribution by handler type</p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <ResponsiveContainer width="60%" height={height}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
              label={renderLabel}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div style={{ flex: 1 }}>
          <div className="donut-stats">
            <div className="stat-item">
              <div
                className="stat-color"
                style={{ background: "#3b82f6" }}
              ></div>
              <div>
                <div className="stat-label">Bot Handled</div>
                <div className="stat-value">{data.bot.toLocaleString()}</div>
                <div className="stat-percentage">{botPercentage}%</div>
              </div>
            </div>
            <div className="stat-item">
              <div
                className="stat-color"
                style={{ background: "#10b981" }}
              ></div>
              <div>
                <div className="stat-label">Human Handled</div>
                <div className="stat-value">{data.human.toLocaleString()}</div>
                <div className="stat-percentage">{humanPercentage}%</div>
              </div>
            </div>
            <div className="stat-total">
              <div className="stat-label">Total Calls</div>
              <div className="stat-value">{total.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
