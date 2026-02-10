import TabBar from "../../../components/TabBar";
import DataTable from "../../../components/DataTable";
import ReportsConnectMessage from "../../../components/ReportsConnectMessage";

const tabs = [
  { label: "Forecast", href: "/reports/inventory-forecast" },
  { label: "Unit sales trend", href: "/reports/inventory-forecast/unit-sales-trend" },
  { label: "Customize forecast", href: "/reports/inventory-forecast/customize-forecast" },
  { label: "Restock profiles", href: "/reports/inventory-forecast/restock-profiles" },
  { label: "Email reminder", href: "/reports/inventory-forecast/email-reminder" },
];

const columns = [
  { key: "sku", label: "SKU" },
  { key: "seasonality", label: "Seasonality" },
  { key: "safety", label: "Safety stock" },
  { key: "lead", label: "Lead time" },
  { key: "override", label: "Forecast override" },
];

export default function CustomizeForecastPage() {
  return (
    <div className="grid" style={{ gap: 20 }}>
      <TabBar tabs={tabs} active="Customize forecast" />
      <ReportsConnectMessage
        title="Customize forecast unavailable"
        description="Connect the Amazon Seller Central (SP-API) and inventory APIs to see live forecast settings here."
      />
      <div className="card">
        <div className="card-inner">
          <DataTable columns={columns} rows={[]} />
        </div>
      </div>
    </div>
  );
}
