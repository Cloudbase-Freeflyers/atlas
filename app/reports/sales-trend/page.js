import AreaChart from "../../components/AreaChart";
import ReportsConnectMessage from "../../components/ReportsConnectMessage";
import { placeholderChartSeries } from "../../lib/sampleData";

const weeks = ["Summary", "Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"];

export default function SalesTrendPage() {
  return (
    <div className="grid" style={{ gap: 20 }}>
      <ReportsConnectMessage
        title="Sales trend data unavailable"
        description="Connect the Amazon Seller Central (SP-API) to see live sales trend data for this report."
      />
      <AreaChart title="Sales trend" series={placeholderChartSeries} />
      <div className="card">
        <div className="card-inner">
          <div className="filter-row">
            <button className="button">Metrics</button>
            <button className="button">Download as CSV</button>
            <button className="button">Download product trend</button>
            <button className="button">Color by best performance</button>
          </div>
          <div className="table-scroll">
            <table className="table heatmap">
              <thead>
                <tr>
                  <th>Metric</th>
                  {weeks.map((w) => (
                    <th key={w}>{w}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={weeks.length + 1} className="reports-placeholder" style={{ textAlign: "center", padding: "24px" }}>
                    —
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
