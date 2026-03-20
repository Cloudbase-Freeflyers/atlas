import ReportCampaigns from "../../components/reports/ReportCampaigns";
import { getCampaignsData } from "../../lib/cubeReports";

export default async function CampaignsPage({ searchParams }) {
  const { companyId, startDate, endDate } = await searchParams;
  
  const initialData = await getCampaignsData(companyId, startDate, endDate);

  return <ReportCampaigns initialData={initialData} />;
}
