import TabBar from "../../../components/TabBar";
import DataTable from "../../../components/DataTable";
import ReportsConnectMessage from "../../../components/ReportsConnectMessage";

const tabs = [
  { label: "Product details", href: "/reports/product-details" },
  { label: "Inventory value", href: "/reports/product-details/inventory-value" },
  { label: "ROI", href: "/reports/product-details/roi" },
  { label: "Package & carton", href: "/reports/product-details/package-carton" },
  { label: "Custom COGS", href: "/reports/product-details/custom-cogs" },
  { label: "Bulk operations", href: "/reports/product-details/bulk-operations" },
];

const columns = [
  { key: "task", label: "Task" },
  { key: "scope", label: "Scope" },
  { key: "status", label: "Status" },
  { key: "updated", label: "Last updated" },
];

export default function BulkOperationsPage() {
  return (
    <div className="grid" style={{ gap: 20 }}>
      <TabBar tabs={tabs} active="Bulk operations" />
      <ReportsConnectMessage
        title="Bulk operations unavailable"
        description="Connect the Amazon Seller Central (SP-API) to run and monitor bulk operations here."
      />
      <div className="card">
        <div className="card-inner">
          <DataTable columns={columns} rows={[]} />
        </div>
      </div>
    </div>
  );
}
