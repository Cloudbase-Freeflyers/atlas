"use client";
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
  { key: "profile", label: "Profile" },
  { key: "skus", label: "SKUs" },
  { key: "target", label: "Target cover" },
  { key: "frequency", label: "Review cadence" },
  { key: "next", label: "Next restock" },
];

export default function RestockProfilesPage() {
  return (
    <div className="grid" style={{ gap: 20 }}>
      <TabBar tabs={tabs} active="Restock profiles" />
      <ReportsConnectMessage
        title="Restock profiles unavailable"
        description="Connect the Amazon Seller Central (SP-API) and inventory APIs to see and manage restock profiles here."
      />
      <div className="card">
        <div className="card-inner">
          <DataTable columns={columns} rows={[]} />
        </div>
      </div>
    </div>
  );
}
