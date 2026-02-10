import TabBar from "../../../components/TabBar";
import LineChart from "../../../components/LineChart";
import ReportsConnectMessage from "../../../components/ReportsConnectMessage";
import { placeholderChartSeries } from "../../../lib/sampleData";

const tabs = [
  { label: "Sales distribution", href: "/reports/seller-central/sales-distribution" },
  { label: "P&L distribution", href: "/reports/seller-central" },
  { label: "Units", href: "/reports/seller-central/units" },
  { label: "Sessions", href: "/reports/seller-central/sessions" },
  { label: "PPC", href: "/reports/seller-central/ppc" },
];

export default function PPCPage() {
  return (
    <div className="grid" style={{ gap: 20 }}>
      <TabBar tabs={tabs} active="PPC" />
      <ReportsConnectMessage
        title="PPC data unavailable"
        description="Connect the Amazon Seller Central and Advertising APIs to see live PPC spend and sales data here."
      />
      <LineChart title="PPC Spend vs Sales" series={placeholderChartSeries} />
    </div>
  );
}
