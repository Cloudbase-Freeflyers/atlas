import TabBar from "../../components/TabBar";
import DataTable from "../../components/DataTable";
import ReportsConnectMessage from "../../components/ReportsConnectMessage";

const tabs = [
  { label: "Forecast", href: "/reports/inventory-forecast" },
  { label: "Unit sales trend", href: "/reports/inventory-forecast/unit-sales-trend" },
  { label: "Customize forecast", href: "/reports/inventory-forecast/customize-forecast" },
  { label: "Restock profiles", href: "/reports/inventory-forecast/restock-profiles" },
  { label: "Email reminder", href: "/reports/inventory-forecast/email-reminder" },
];

const columns = [
  { key: "product", label: "Product" },
  { key: "parent", label: "Parent" },
  { key: "asin", label: "ASIN" },
  { key: "sku", label: "SKU" },
  { key: "title", label: "Title" },
  { key: "stock", label: "Stock level" },
  { key: "reorder", label: "Days to reorder" },
  { key: "restock", label: "Restock qty" },
  { key: "cost", label: "Restock cost" },
  { key: "fba", label: "FBA stocks" },
  { key: "velocity", label: "Velocity" },
  { key: "supply", label: "Days of supply" },
  { key: "stockout", label: "Stockout date" },
];

export default function InventoryForecastPage() {
  return (
    <div className="grid" style={{ gap: 20 }}>
      <TabBar tabs={tabs} active="Forecast" />
      <ReportsConnectMessage
        title="Forecast data unavailable"
        description="Connect the Amazon Seller Central (SP-API) and inventory APIs to see live forecast and restock data here."
      />
      <div className="card">
        <div className="card-inner">
          <div className="filter-row">
            <input className="input" placeholder="Instant search" />
          </div>
          <DataTable columns={columns} rows={[]} />
        </div>
      </div>
    </div>
  );
}
