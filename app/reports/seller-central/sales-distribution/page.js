import ReportSalesDistribution from "../../../components/reports/ReportSalesDistribution";
import { getSellerCentralData } from "../../../lib/cubeReports";

export default async function SalesDistributionPage({ searchParams }) {
  const { companyId, startDate, endDate } = await searchParams;
  
  const initialData = await getSellerCentralData(companyId, startDate, endDate);

  return <ReportSalesDistribution initialData={initialData} />;
}
