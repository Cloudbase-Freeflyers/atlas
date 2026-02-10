export default function GaugeChart({ title, value, max, empty }) {
  const noValue = empty || (max != null && Number(max) === 0) || (value != null && value === "") || value == null;
  const percent = noValue ? 0 : Math.min(Number(value) / (Number(max) || 1), 1);
  const radius = 110;
  const stroke = 18;
  const circumference = Math.PI * radius;
  const offset = circumference * (1 - percent);

  return (
    <div className="card">
      <div className="chart-frame" style={{ paddingBottom: 8 }}>
        <div className="chart-title">
          <strong>{title}</strong>
        </div>
        <svg width="100%" height="200" viewBox="0 0 260 160">
          <g transform="translate(130,130)">
            <path
              d={`M ${-radius} 0 A ${radius} ${radius} 0 0 1 ${radius} 0`}
              fill="none"
              stroke="var(--c-border)"
              strokeWidth={stroke}
              strokeLinecap="round"
            />
            <path
              d={`M ${-radius} 0 A ${radius} ${radius} 0 0 1 ${radius} 0`}
              fill="none"
              stroke="var(--c-primary)"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={offset}
            />
            <text
              x="0"
              y="10"
              textAnchor="middle"
              fontSize="22"
              fontWeight="700"
              fill={noValue ? "var(--c-ink-muted)" : "var(--c-ink)"}
              className={noValue ? "reports-placeholder" : undefined}
            >
              {noValue ? "—" : Number(value).toLocaleString("en-US")}
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}
