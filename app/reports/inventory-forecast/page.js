import TabBar from "../../components/TabBar";
import ReportInventoryForecast from "../../components/reports/ReportInventoryForecast";
import ReportsConnectMessage from "../../components/ReportsConnectMessage";
import { getInventoryForecastPageData } from "../../lib/cubeReports";

const tabs = [
  { label: "Forecast", href: "/reports/inventory-forecast" },
  { label: "Unit sales trend", href: "/reports/inventory-forecast/unit-sales-trend" },
  { label: "Customize forecast", href: "/reports/inventory-forecast/customize-forecast" },
  { label: "Restock profiles", href: "/reports/inventory-forecast/restock-profiles" },
  { label: "Email reminder", href: "/reports/inventory-forecast/email-reminder" },
];

export default async function InventoryForecastPage({ searchParams }) {
  const { companyId, startDate, endDate } = await searchParams;
  const initialData = await getInventoryForecastPageData(
    companyId,
    startDate,
    endDate
  );

  return (
    <div className="grid" style={{ gap: 20 }}>
      <TabBar tabs={tabs} active="Forecast" />
      {!initialData && companyId && startDate && endDate && (
        <ReportsConnectMessage
          title="Forecast data unavailable"
          description="Connect Seller Central inventory and sales data in Cube (SellerInventoryReports + ProductStats) to populate this grid."
        />
      )}
      <ReportInventoryForecast initialData={initialData} />
    </div>
  );
}
