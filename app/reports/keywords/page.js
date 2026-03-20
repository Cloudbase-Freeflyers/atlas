import ReportKeywords from "../../components/reports/ReportKeywords";
import { getKeywordsData } from "../../lib/cubeReports";

export default async function KeywordsPage({ searchParams }) {
  const { companyId, startDate, endDate } = await searchParams;
  
  const initialData = await getKeywordsData(companyId, startDate, endDate);

  return <ReportKeywords initialData={initialData} />;
}
