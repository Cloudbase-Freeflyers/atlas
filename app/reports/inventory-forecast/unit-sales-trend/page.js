"use client";
import TabBar from "../../../components/TabBar";
import LineChart from "../../../components/LineChart";
import ReportsConnectMessage from "../../../components/ReportsConnectMessage";

const tabs = [
  { label: "Forecast", href: "/reports/inventory-forecast" },
  { label: "Unit sales trend", href: "/reports/inventory-forecast/unit-sales-trend" },
  { label: "Customize forecast", href: "/reports/inventory-forecast/customize-forecast" },
  { label: "Restock profiles", href: "/reports/inventory-forecast/restock-profiles" },
  { label: "Email reminder", href: "/reports/inventory-forecast/email-reminder" },
];

export default function UnitSalesTrendPage() {
  return (
    <div className="grid" style={{ gap: 20 }}>
      <TabBar tabs={tabs} active="Unit sales trend" />
      <ReportsConnectMessage
        title="Unit sales trend unavailable"
        description="Connect the Amazon Seller Central (SP-API) and inventory APIs to see live unit sales trend data here."
      />
      <LineChart title="Unit sales trend" />
    </div>
  );
}
