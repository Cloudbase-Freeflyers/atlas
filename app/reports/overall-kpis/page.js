import ReportOverallKpis from "../../components/reports/ReportOverallKpis";
import { getOverallKpisData } from "../../lib/cubeReports";

export default async function OverallKpisPage({ searchParams }) {
  const { companyId, startDate, endDate } = await searchParams;
  
  const initialData = await getOverallKpisData(companyId, startDate, endDate);

  return <ReportOverallKpis initialData={initialData} />;
}
