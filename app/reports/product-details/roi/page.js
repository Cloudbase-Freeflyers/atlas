import TabBar from "../../../components/TabBar";
import LineChart from "../../../components/LineChart";
import ReportsConnectMessage from "../../../components/ReportsConnectMessage";
import { placeholderChartSeries } from "../../../lib/sampleData";

const tabs = [
  { label: "Product details", href: "/reports/product-details" },
  { label: "Inventory value", href: "/reports/product-details/inventory-value" },
  { label: "ROI", href: "/reports/product-details/roi" },
  { label: "Package & carton", href: "/reports/product-details/package-carton" },
  { label: "Custom COGS", href: "/reports/product-details/custom-cogs" },
  { label: "Bulk operations", href: "/reports/product-details/bulk-operations" },
];

export default function RoiPage() {
  return (
    <div className="grid" style={{ gap: 20 }}>
      <TabBar tabs={tabs} active="ROI" />
      <ReportsConnectMessage
        title="ROI data unavailable"
        description="Connect the Amazon Seller Central (SP-API) to see live ROI and margin trend data here."
      />
      <LineChart title="ROI & Margin trend" series={placeholderChartSeries} />
    </div>
  );
}
