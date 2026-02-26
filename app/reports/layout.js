// Force server to run data-fetching (Amazon API) on every request, not at build time
export const dynamic = "force-dynamic";

import AmazonApiStatus from "../components/AmazonApiStatus";
import TopBar from "../components/TopBar";

export default function ReportsLayout({ children }) {
  return (
    <>
      <div className="app-shell">

        <main className="app-content">
            <TopBar />
          {/*<AmazonApiStatus />*/}
          <div className="container">{children}</div>
        </main>
      </div>
    </>
  );
}
