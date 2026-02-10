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
  { key: "name", label: "Campaign Name" },
  { key: "spend", label: "Spend" },
  { key: "impressions", label: "Impressions" },
  { key: "clicks", label: "Clicks" },
  { key: "orders", label: "Orders" },
  { key: "sales", label: "Sales" },
  { key: "conversion", label: "Conversion" },
  { key: "roas", label: "ROAS" },
  { key: "ctr", label: "CTR" },
  { key: "acos", label: "ACOS" },
];

export default function ReportCampaigns() {
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const base = typeof window !== "undefined" ? window.location.origin : "";
    fetch(`${base}/api/amazon/ads/campaigns`)
      .then((r) => r.json())
      .then(setRes)
      .catch(() => setRes({ source: "sample" }))
      .finally(() => setLoading(false));
  }, []);

  const source = res?.source ?? "sample";

  if (loading) {
    return (
      <div className="grid" style={{ gap: 20 }}>
        <TabBar tabs={tabs} active="Campaigns" />
        <div className="card"><div className="card-inner"><p className="reports-loading">Loading…</p></div></div>
      </div>
    );
  }

  if (source !== "api") {
    return (
      <div className="grid" style={{ gap: 20 }}>
        <TabBar tabs={tabs} active="Campaigns" />
        <ReportsConnectMessage
          title="Campaign data unavailable"
          description="Connect the Amazon Advertising API to view live campaign performance, spend, and ROAS here."
        />
        <div className="card">
          <div className="card-inner">
            <div className="filter-row">
              <input className="input" placeholder="Campaign Name" />
              <input className="input" placeholder="Spend USD" />
              <button className="button">Contains</button>
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
      <TabBar tabs={tabs} active="Campaigns" />
      <p className="reports-api-badge" aria-hidden>Live data from Amazon Advertising</p>
      <div className="card">
        <div className="card-inner">
          <div className="filter-row">
            <input className="input" placeholder="Campaign Name" />
            <input className="input" placeholder="Spend USD" />
            <button className="button">Contains</button>
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
