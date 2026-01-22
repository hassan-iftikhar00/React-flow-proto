import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import "./MetricCard.css";

/**
 * MetricCard Component
 * Displays a single metric with icon, value, trend, and optional alert
 *
 * @param {Object} props
 * @param {string} props.title - Metric title
 * @param {string|number} props.value - Current value
 * @param {string} props.unit - Unit of measurement (%, calls, etc.)
 * @param {number} props.trend - Trend percentage (positive or negative)
 * @param {ReactNode} props.icon - Icon component
 * @param {string} props.color - Color theme (blue, green, red, yellow, purple)
 * @param {Object} props.alert - Alert object { severity, message }
 */
export default function MetricCard({
  title,
  value,
  unit = "",
  trend = null,
  icon: Icon,
  color = "blue",
  alert = null,
}) {
  const getTrendIcon = () => {
    if (trend === null || trend === 0) return <Minus size={16} />;
    return trend > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />;
  };

  const getTrendClass = () => {
    if (trend === null || trend === 0) return "trend-neutral";
    return trend > 0 ? "trend-up" : "trend-down";
  };

  return (
    <div className={`metric-card metric-card-${color}`}>
      <div className="metric-header">
        <div className="metric-icon-wrapper">{Icon && <Icon size={24} />}</div>
        <div className="metric-title">{title}</div>
      </div>

      <div className="metric-value">
        <span className="value-number">{value}</span>
        {unit && <span className="value-unit">{unit}</span>}
      </div>

      {trend !== null && (
        <div className={`metric-trend ${getTrendClass()}`}>
          {getTrendIcon()}
          <span>{Math.abs(trend).toFixed(1)}%</span>
          <span className="trend-label">vs last period</span>
        </div>
      )}

      {alert && (
        <div className={`metric-alert metric-alert-${alert.severity}`}>
          {alert.message}
        </div>
      )}
    </div>
  );
}
