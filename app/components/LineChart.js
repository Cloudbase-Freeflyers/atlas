import { makePath, normalizeSeries, generateYAxisLabels, generateXAxisLabels } from "../lib/chartUtils";

export default function LineChart({ title, series, height = 240, xLabels = null }) {
  const width = 640;
  const padding = { top: 20, right: 20, bottom: 40, left: 60 };
  const normalized = normalizeSeries(series, width, height, padding);

  // Get min/max from first series (they should all be normalized to same scale)
  const { min, max } = normalized[0] || { min: 0, max: 100 };
  const yLabels = generateYAxisLabels(min, max, 5);
  const xAxisLabels = generateXAxisLabels(series[0]?.data.length || 0, xLabels);

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  return (
    <div className="card">
      <div className="chart-frame">
        <div className="chart-title">
          <strong>{title}</strong>
          <div className="legend">
            {series.map((item) => (
              <span key={item.name} style={{ "--legend-color": item.color }}>
                {item.name}
              </span>
            ))}
          </div>
        </div>
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="auto">
          <defs>
            <linearGradient id="chartBg" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0d0d0d" />
              <stop offset="100%" stopColor="#0a0a0a" />
            </linearGradient>
          </defs>

          {/* Background */}
          <rect x="0" y="0" width={width} height={height} fill="url(#chartBg)" rx="8" />

          {/* Gridlines */}
          <g className="gridlines">
            {yLabels.map((label, i) => {
              const y = padding.top + (chartHeight / (yLabels.length - 1)) * i;
              return (
                <line
                  key={`grid-y-${i}`}
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeWidth="1"
                />
              );
            })}
          </g>

          {/* Y-axis labels */}
          <g className="y-axis">
            {yLabels.map((label, i) => {
              const y = padding.top + (chartHeight / (yLabels.length - 1)) * i;
              return (
                <text
                  key={`y-label-${i}`}
                  x={padding.left - 10}
                  y={y}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fill="#808080"
                  fontSize="11"
                  fontWeight="500"
                >
                  {label.label}
                </text>
              );
            })}
          </g>

          {/* X-axis labels */}
          <g className="x-axis">
            {xAxisLabels.map((label, i) => {
              const x = padding.left + (chartWidth / (xAxisLabels.length - 1)) * i;
              return (
                <text
                  key={`x-label-${i}`}
                  x={x}
                  y={height - padding.bottom + 20}
                  textAnchor="middle"
                  fill="#808080"
                  fontSize="11"
                  fontWeight="500"
                >
                  {label}
                </text>
              );
            })}
          </g>

          {/* Axes */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={height - padding.bottom}
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth="2"
          />
          <line
            x1={padding.left}
            y1={height - padding.bottom}
            x2={width - padding.right}
            y2={height - padding.bottom}
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth="2"
          />

          {/* Data lines */}
          {normalized.map((item) => (
            <path
              key={item.name}
              d={makePath(item.points)}
              fill="none"
              stroke={item.color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {/* Data points */}
          {normalized.map((item) => (
            <g key={`${item.name}-points`}>
              {item.points.map((point, i) => (
                <circle
                  key={i}
                  cx={point.x}
                  cy={point.y}
                  r="3"
                  fill={item.color}
                  stroke="#0a0a0a"
                  strokeWidth="1.5"
                />
              ))}
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
