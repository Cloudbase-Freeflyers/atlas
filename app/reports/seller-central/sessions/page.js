"use client";

import { useEffect, useState } from "react";
import TabBar from "../../../components/TabBar";
import LineChart from "../../../components/LineChart";
import DataTable from "../../../components/DataTable";
import ReportsConnectMessage from "../../../components/ReportsConnectMessage";
import { placeholderChartSeries } from "../../../lib/sampleData";

const tabs = [
  { label: "Sales distribution", href: "/reports/seller-central/sales-distribution" },
  { label: "P&L distribution", href: "/reports/seller-central" },
  { label: "Units", href: "/reports/seller-central/units" },
  { label: "Sessions", href: "/reports/seller-central/sessions" },
  { label: "PPC", href: "/reports/seller-central/ppc" },
];

const columns = [
  { key: "asin", label: "ASIN" },
  { key: "sessions", label: "Sessions" },
  { key: "pageViews", label: "Page Views" },
  { key: "unitSessionPct", label: "Unit Session %" },
  { key: "unitsOrdered", label: "Units Ordered" },
];

export default function SessionsPage() {
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const base = typeof window !== "undefined" ? window.location.origin : "";
    fetch(`${base}/api/amazon/seller/sessions`)
      .then((r) => r.json())
      .then(setRes)
      .catch(() => setRes({ source: "sample" }))
      .finally(() => setLoading(false));
  }, []);

  const source = res?.source ?? "sample";

  if (loading) {
    return (
      <div className="grid" style={{ gap: 20 }}>
        <TabBar tabs={tabs} active="Sessions" />
        <div className="card"><div className="card-inner"><p className="reports-loading">Loading…</p></div></div>
      </div>
    );
  }

  if (source !== "api") {
    return (
      <div className="grid" style={{ gap: 20 }}>
        <TabBar tabs={tabs} active="Sessions" />
        <ReportsConnectMessage
          title="Sessions data unavailable"
          description="Connect the Amazon Seller Central (SP-API) to see live sessions and unit session data here."
        />
        <LineChart title="Sessions + Unit Session %" series={placeholderChartSeries} />
      </div>
    );
  }

  const data = res.data ?? {};
  const series = data.series ?? [];
  const rows = data.rows ?? [];

  return (
    <div className="grid" style={{ gap: 20 }}>
      <TabBar tabs={tabs} active="Sessions" />
      <p className="reports-api-badge" aria-hidden>Live data from Amazon Seller Central</p>
      {series.length > 0 && <LineChart title="Sessions + Unit Session %" series={series} />}
      {rows.length > 0 && (
        <div className="card">
          <div className="card-inner">
            <DataTable columns={columns} rows={rows} />
          </div>
        </div>
      )}
    </div>
  );
}
