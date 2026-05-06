import ReportInventoryForecast from "../../components/reports/ReportInventoryForecast";
import ReportsConnectMessage from "../../components/ReportsConnectMessage";
import { getInventoryForecastPageData } from "../../lib/cubeReports";


export default async function InventoryForecastPage({ searchParams }) {
  const { companyId, startDate, endDate } = await searchParams;
  const initialData = await getInventoryForecastPageData(
    companyId,
    startDate,
    endDate
  );

  return (
    <div className="grid" style={{ gap: 20 }}>
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
