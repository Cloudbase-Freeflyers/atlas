// Force server to run data-fetching (Amazon API) on every request, not at build time
export const dynamic = "force-dynamic";

import AmazonApiStatus from "../components/AmazonApiStatus";
import TopBar from "../components/TopBar";
import { getServerCompanies, getAmazonStatus, requireServerAuth } from "../lib/serverApi";

export default async function ReportsLayout({ children }) {
  await requireServerAuth();
  const [companies, amazonStatus] = await Promise.all([
    getServerCompanies(),
    getAmazonStatus()
  ]);

  return (
    <>
      <div className="app-shell">
        <main className="app-content tw:min-w-0">
          <TopBar initialCompanies={companies} />
          <AmazonApiStatus initialStatus={amazonStatus} />
          <div className="container tw:min-w-0 tw:w-full tw:max-w-full">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
