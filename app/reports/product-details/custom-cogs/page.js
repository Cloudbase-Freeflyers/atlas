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
  { key: "sku", label: "SKU" },
  { key: "material", label: "Material cost" },
  { key: "labor", label: "Labor cost" },
  { key: "overhead", label: "Overhead" },
  { key: "total", label: "Total COGS" },
];

export default function CustomCogsPage() {
  return (
    <div className="grid" style={{ gap: 20 }}>
      <TabBar tabs={tabs} active="Custom COGS" />
      <ReportsConnectMessage
        title="Custom COGS unavailable"
        description="Connect the Amazon Seller Central (SP-API) to view and edit custom COGS data here."
      />
      <div className="card">
        <div className="card-inner">
          <DataTable columns={columns} rows={[]} />
        </div>
      </div>
    </div>
  );
}
