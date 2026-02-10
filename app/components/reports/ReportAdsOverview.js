"use client";

import { useEffect, useState } from "react";
import TabBar from "../TabBar";
import MetricGrid from "../MetricGrid";
import LineChart from "../LineChart";
import AreaChart from "../AreaChart";
import ReportsConnectMessage from "../ReportsConnectMessage";
import { placeholderAdsMetrics, placeholderChartSeries } from "../../lib/sampleData";

const tabs = [
  { label: "Overall KPIs", href: "/reports/overall-kpis" },
  { label: "Ads Overview", href: "/reports/ads-overview" },
  { label: "Seller Central Overview", href: "/reports/seller-central" },
  { label: "Keywords And Search Terms", href: "/reports/keywords" },
  { label: "Campaigns", href: "/reports/campaigns" },
];

export default function ReportAdsOverview() {
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const base = typeof window !== "undefined" ? window.location.origin : "";
    fetch(`${base}/api/amazon/ads/overview`)
      .then((r) => r.json())
      .then(setRes)
      .catch(() => setRes({ source: "sample" }))
      .finally(() => setLoading(false));
  }, []);

  const source = res?.source ?? "sample";

  if (loading) {
    return (
      <div className="grid" style={{ gap: 20 }}>
        <TabBar tabs={tabs} active="Ads Overview" />
        <div className="card"><div className="card-inner"><p className="reports-loading">Loading…</p></div></div>
      </div>
    );
  }

  if (source !== "api") {
    return (
      <div className="grid" style={{ gap: 20 }}>
        <TabBar tabs={tabs} active="Ads Overview" />
        <ReportsConnectMessage
          title="Advertising data unavailable"
          description="Connect the Amazon Advertising API in your environment to see live metrics and charts here."
        />
        <div className="card">
          <div className="card-inner">
            <MetricGrid items={placeholderAdsMetrics} />
          </div>
        </div>
        <div className="grid grid-2">
          <LineChart title="CTR vs CPC" series={placeholderChartSeries} />
          <LineChart title="Sales vs Spend" series={placeholderChartSeries} />
        </div>
        <div className="grid grid-2">
          <LineChart title="ACOS vs ROAS" series={placeholderChartSeries} />
          <AreaChart title="Sales (Last 30 Days)" series={placeholderChartSeries} />
        </div>
      </div>
    );
  }

  const metrics = res.data.metrics ?? [];
  const series = res.data.series ?? [];

  return (
    <div className="grid" style={{ gap: 20 }}>
      <TabBar tabs={tabs} active="Ads Overview" />
      <p className="reports-api-badge" aria-hidden>Live data from Amazon Advertising</p>
      {metrics.length > 0 && (
        <div className="card">
          <div className="card-inner">
            <MetricGrid items={metrics} />
          </div>
        </div>
      )}
      <div className="grid grid-2">
        {series.length > 0 && <LineChart title="CTR vs CPC" series={series} />}
        {series.length > 0 && <LineChart title="Sales vs Spend" series={series} />}
      </div>
      <div className="grid grid-2">
        {series.length > 0 && <LineChart title="ACOS vs ROAS" series={series} />}
        {series.length > 0 && <AreaChart title="Sales (Last 30 Days)" series={series} />}
      </div>
    </div>
  );
}
