import DashboardCard from "../components/DashboardCard";
import { dashboardCards } from "../lib/sampleData";

export default function ReportsPage() {
  return (
    <>
      <section className="reports-hero">
        <div className="container">
          <div className="reports-hero-grid">
            <div className="reports-hero-copy">
              <div className="badge">API-ready for Amazon Seller Central + Advertising</div>
              <h1>Commerce control tower</h1>
              <p>
                Track profitability, ads performance, and inventory health in one shared workspace.
                Each card opens a focused module with tables and charts tuned to that signal.
              </p>
            </div>
            <div className="reports-panel">
              <div className="section-title">Shareable workspace</div>
              <p>
                Links preserve account context and can be shared across teams.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="reports-section">
        <div className="container">
          <div className="section-title">Internal pages</div>
          <div className="grid grid-auto">
            {dashboardCards.map((card) => (
              <DashboardCard key={card.href} {...card} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
