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
  { key: "rule", label: "Rule" },
  { key: "skus", label: "SKUs" },
  { key: "threshold", label: "Threshold" },
  { key: "recipients", label: "Recipients" },
  { key: "status", label: "Status" },
];

export default function EmailReminderPage() {
  return (
    <div className="grid" style={{ gap: 20 }}>
      <TabBar tabs={tabs} active="Email reminder" />
      <ReportsConnectMessage
        title="Email reminder rules unavailable"
        description="Connect the Amazon Seller Central (SP-API) and inventory APIs to configure and view restock email reminders here."
      />
      <div className="card">
        <div className="card-inner">
          <DataTable columns={columns} rows={[]} />
        </div>
      </div>
    </div>
  );
}
