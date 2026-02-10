"use client";

import { useEffect, useState } from "react";
import TabBar from "../TabBar";
import DataTable from "../DataTable";
import LineChart from "../LineChart";
import ReportsConnectMessage from "../ReportsConnectMessage";
import { placeholderChartSeries } from "../../lib/sampleData";

const tabs = [
  { label: "Overall KPIs", href: "/reports/overall-kpis" },
  { label: "Ads Overview", href: "/reports/ads-overview" },
  { label: "Seller Central Overview", href: "/reports/seller-central" },
  { label: "Keywords And Search Terms", href: "/reports/keywords" },
  { label: "Campaigns", href: "/reports/campaigns" },
];

const columns = [
  { key: "term", label: "Target Term" },
  { key: "match", label: "Match Type" },
  { key: "spend", label: "Spend" },
  { key: "clicks", label: "Clicks" },
  { key: "orders", label: "Orders" },
  { key: "sales", label: "Sales" },
  { key: "conversion", label: "Conversion" },
  { key: "roas", label: "ROAS" },
  { key: "ctr", label: "CTR" },
];

export default function ReportKeywords() {
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const base = typeof window !== "undefined" ? window.location.origin : "";
    fetch(`${base}/api/amazon/ads/keywords`)
      .then((r) => r.json())
      .then(setRes)
      .catch(() => setRes({ source: "sample" }))
      .finally(() => setLoading(false));
  }, []);

  const source = res?.source ?? "sample";

  if (loading) {
    return (
      <div className="grid" style={{ gap: 20 }}>
        <TabBar tabs={tabs} active="Keywords And Search Terms" />
        <div className="card"><div className="card-inner"><p className="reports-loading">Loading…</p></div></div>
      </div>
    );
  }

  if (source !== "api") {
    return (
      <div className="grid" style={{ gap: 20 }}>
        <TabBar tabs={tabs} active="Keywords And Search Terms" />
        <ReportsConnectMessage
          title="Keywords data unavailable"
          description="Connect the Amazon Advertising API to see live keyword and search term performance here."
        />
        <div className="card">
          <div className="card-inner">
            <div className="filter-row">
              <input className="input" placeholder="Campaign Name" />
              <input className="input" placeholder="Spend USD" />
              <input className="input" placeholder="Sales USD" />
              <input className="input" placeholder="Clicks" />
            </div>
            <DataTable columns={columns} rows={[]} />
          </div>
        </div>
        <div className="grid grid-2">
          <LineChart title="Sales | Spend | Impressions" series={placeholderChartSeries} />
          <LineChart title="ACOS vs ROAS" series={placeholderChartSeries} />
        </div>
      </div>
    );
  }

  const rows = res.data.rows ?? [];

  return (
    <div className="grid" style={{ gap: 20 }}>
      <TabBar tabs={tabs} active="Keywords And Search Terms" />
      <p className="reports-api-badge" aria-hidden>Live data from Amazon Advertising</p>
      <div className="card">
        <div className="card-inner">
          <div className="filter-row">
            <input className="input" placeholder="Campaign Name" />
            <input className="input" placeholder="Spend USD" />
            <input className="input" placeholder="Sales USD" />
            <input className="input" placeholder="Clicks" />
          </div>
          <DataTable columns={columns} rows={rows} />
        </div>
      </div>
      {(res.data.series?.length > 0) && (
        <div className="grid grid-2">
          <LineChart title="Sales | Spend | Impressions" series={res.data.series} />
          <LineChart title="ACOS vs ROAS" series={res.data.series} />
        </div>
      )}
    </div>
  );
}
