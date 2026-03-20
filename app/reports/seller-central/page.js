import ReportSellerCentral from "../../components/reports/ReportSellerCentral";
import { getSellerCentralData } from "../../lib/cubeReports";

export default async function SellerCentralPage({ searchParams }) {
  const { companyId, startDate, endDate } = await searchParams;
  
  const initialData = await getSellerCentralData(companyId, startDate, endDate);

  return <ReportSellerCentral initialData={initialData} />;
}
