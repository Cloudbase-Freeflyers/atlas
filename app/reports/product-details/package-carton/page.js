"use client";
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
  { key: "length", label: "Length" },
  { key: "width", label: "Width" },
  { key: "height", label: "Height" },
  { key: "weight", label: "Weight" },
  { key: "carton", label: "Carton qty" },
];

export default function PackageCartonPage() {
  return (
    <div className="grid" style={{ gap: 20 }}>
      <TabBar tabs={tabs} active="Package & carton" />
      <ReportsConnectMessage
        title="Package & carton data unavailable"
        description="Connect the Amazon Seller Central (SP-API) to see live package and carton dimensions here."
      />
      <div className="card">
        <div className="card-inner">
          <DataTable columns={columns} rows={[]} />
        </div>
      </div>
    </div>
  );
}
