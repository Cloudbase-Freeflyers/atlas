import {formatValue} from "@/lib/formatters.js";

export default function MetricGrid({ items }) {
  return (
    <div className="metric-grid">
      {items.map((item) => (
        <div key={item.label} className="metric">
          <h4>{item.label}</h4>
          <p className={item.value === "—" ? "reports-placeholder" : undefined}>{formatValue(item.value,item.formatter)}</p>
        </div>
      ))}
    </div>
  );
}
