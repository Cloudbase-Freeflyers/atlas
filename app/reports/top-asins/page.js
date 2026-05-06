import ReportTopAsins from "../../components/reports/ReportTopAsins";
import { getTopAsinsData } from "../../lib/cubeReports";

export default async function TopAsinsPage({ searchParams }) {
  const { companyId, startDate, endDate } = await searchParams;

  const initialData = await getTopAsinsData(companyId, startDate, endDate);

  return <ReportTopAsins initialData={initialData} />;
}
