// Force server to run data-fetching (Amazon API) on every request, not at build time
export const dynamic = "force-dynamic";

import AmazonApiStatus from "../components/AmazonApiStatus";
import AppTopBar from "../components/shell/AppTopBar";
import { getServerCompanies, getAmazonStatus, requireServerAuth } from "../lib/serverApi";

export default async function ReportsLayout({ children }) {
  await requireServerAuth();
  const [companies, amazonStatus] = await Promise.all([
    getServerCompanies(),
    getAmazonStatus()
  ]);

  return (
    <div className="tw:flex tw:flex-col tw:min-h-screen tw:bg-zinc-950">
      <AppTopBar initialCompanies={companies} />
      <AmazonApiStatus initialStatus={amazonStatus} />
      <div className="tw:flex-1 tw:min-w-0 tw:w-full tw:p-5 tw:max-w-full">
        {children}
      </div>
    </div>
  );
}
