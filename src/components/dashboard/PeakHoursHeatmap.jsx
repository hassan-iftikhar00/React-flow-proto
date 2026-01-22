import "./PeakHoursHeatmap.css";

/**
 * PeakHoursHeatmap Component
 * Displays 24-hour call volume heatmap
 *
 * @param {Object} props
 * @param {Array} props.data - Array of {hour, callCount} objects (24 items)
 */
export default function PeakHoursHeatmap({ data = [] }) {
  // Ensure we have 24 hours of data
  const fullData = Array.from({ length: 24 }, (_, i) => {
    const existing = data.find((d) => d.hour === i);
    return existing || { hour: i, callCount: 0 };
  });

  // Find max call count for color scaling
  const maxCalls = Math.max(...fullData.map((d) => d.callCount), 1);

  // Get color intensity based on call volume
  const getIntensity = (callCount) => {
    if (callCount === 0) return "intensity-0";
    const percentage = (callCount / maxCalls) * 100;
    if (percentage < 20) return "intensity-1";
    if (percentage < 40) return "intensity-2";
    if (percentage < 60) return "intensity-3";
    if (percentage < 80) return "intensity-4";
    return "intensity-5";
  };

  // Format hour for display (12-hour format)
  const formatHour = (hour) => {
    if (hour === 0) return "12 AM";
    if (hour === 12) return "12 PM";
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
  };

  // Get time period label
  const getTimePeriod = (hour) => {
    if (hour >= 0 && hour < 6) return "Night";
    if (hour >= 6 && hour < 12) return "Morning";
    if (hour >= 12 && hour < 18) return "Afternoon";
    return "Evening";
  };

  // Group hours by time period
  const periods = [
    { name: "Night", hours: fullData.filter((d) => d.hour >= 0 && d.hour < 6) },
    {
      name: "Morning",
      hours: fullData.filter((d) => d.hour >= 6 && d.hour < 12),
    },
    {
      name: "Afternoon",
      hours: fullData.filter((d) => d.hour >= 12 && d.hour < 18),
    },
    {
      name: "Evening",
      hours: fullData.filter((d) => d.hour >= 18 && d.hour < 24),
    },
  ];

  // Find peak hour
  const peakHour = fullData.reduce(
    (max, curr) => (curr.callCount > max.callCount ? curr : max),
    fullData[0],
  );

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3>Peak Hours Heatmap</h3>
        <p className="chart-subtitle">
          Peak Hour: {formatHour(peakHour.hour)} ({peakHour.callCount} calls)
        </p>
      </div>

      <div className="heatmap-grid">
        {periods.map((period) => (
          <div key={period.name} className="heatmap-period">
            <div className="period-label">{period.name}</div>
            <div className="period-hours">
              {period.hours.map((item) => (
                <div
                  key={item.hour}
                  className={`heatmap-cell ${getIntensity(item.callCount)}`}
                  title={`${formatHour(item.hour)}: ${item.callCount} calls`}
                >
                  <div className="cell-hour">{item.hour}:00</div>
                  <div className="cell-count">{item.callCount}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="heatmap-legend">
        <span className="legend-label">Call Volume:</span>
        <div className="legend-scale">
          <div className="legend-item intensity-0">None</div>
          <div className="legend-item intensity-1">Low</div>
          <div className="legend-item intensity-2">Medium</div>
          <div className="legend-item intensity-3">High</div>
          <div className="legend-item intensity-4">Very High</div>
          <div className="legend-item intensity-5">Peak</div>
        </div>
      </div>
    </div>
  );
}
