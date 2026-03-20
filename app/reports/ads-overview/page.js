import ReportAdsOverview from "../../components/reports/ReportAdsOverview";
import { getAdsOverviewData } from "../../lib/cubeReports";

export default async function AdsOverviewPage({ searchParams }) {
  const { companyId, startDate, endDate } = await searchParams;
  
  const initialData = await getAdsOverviewData(companyId, startDate, endDate);

  return <ReportAdsOverview initialData={initialData} />;
}
