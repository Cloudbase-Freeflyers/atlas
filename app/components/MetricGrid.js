import { formatValue } from "@/lib/formatters.js";
import AIMetricBenchmark from "@/components/ai/AIMetricBenchmark";

export default function MetricGrid({ items }) {
  return (
    <div className="metric-grid">
      {items.map((item) => (
        <div key={item.label} className="metric">
          <h4>{item.label}</h4>
          <p className={item.value === "—" ? "reports-placeholder" : undefined}>
            <AIMetricBenchmark metric={item.label} value={item.value}>
              {formatValue(item.value, item.formatter)}
            </AIMetricBenchmark>
          </p>
        </div>
      ))}
    </div>
  );
}
