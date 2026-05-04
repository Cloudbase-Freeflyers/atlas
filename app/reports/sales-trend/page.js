import ReportSalesTrend from "../../components/reports/ReportSalesTrend";
import { getSalesTrendPageData } from "../../lib/cubeReports";

export default async function SalesTrendPage({ searchParams }) {
  const { companyId, startDate, endDate, asin } = await searchParams;
  const initialData = await getSalesTrendPageData(
    companyId,
    startDate,
    endDate,
    asin || null
  );

  return (
    <ReportSalesTrend initialData={initialData} initialAsin={asin || ""} />
  );
}
