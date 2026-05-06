import { formatValue } from "@/lib/formatters.js";
import AIMetricBenchmark from "@/components/ai/AIMetricBenchmark";

export default function MetricStrip({ metrics }) {
  return (
    <div className="kpi-strip">
      {metrics.map((metric) => (
        <div key={metric.label} className="kpi">
          <span>{metric.label}</span>
          <strong className={metric.value === "—" ? "reports-placeholder" : undefined}>
            <AIMetricBenchmark metric={metric.label} value={metric.value}>
              {formatValue(metric.value, metric.formatter)}
            </AIMetricBenchmark>
          </strong>
        </div>
      ))}
    </div>
  );
}
