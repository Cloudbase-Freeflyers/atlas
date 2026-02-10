export default function MetricStrip({ metrics }) {
  return (
    <div className="kpi-strip">
      {metrics.map((metric) => (
        <div key={metric.label} className="kpi">
          <span>{metric.label}</span>
          <strong className={metric.value === "—" ? "reports-placeholder" : undefined}>{metric.value}</strong>
        </div>
      ))}
    </div>
  );
}
