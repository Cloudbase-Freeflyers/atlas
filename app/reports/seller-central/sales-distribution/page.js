"use client";

import { useEffect, useState } from "react";
import TabBar from "../../../components/TabBar";
import AreaChart from "../../../components/AreaChart";
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
  { key: "product", label: "Product" },
  { key: "sales", label: "Sales" },
  { key: "orders", label: "Orders" },
  { key: "units", label: "Units" },
  { key: "margin", label: "Margin" },
  { key: "refunds", label: "Refunds" },
];

export default function SalesDistributionPage() {
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const base = typeof window !== "undefined" ? window.location.origin : "";
    fetch(`${base}/api/amazon/seller/sales-distribution`)
      .then((r) => r.json())
      .then(setRes)
      .catch(() => setRes({ source: "sample" }))
      .finally(() => setLoading(false));
  }, []);

  const source = res?.source ?? "sample";

  if (loading) {
    return (
      <div className="grid" style={{ gap: 20 }}>
        <TabBar tabs={tabs} active="Sales distribution" />
        <div className="card"><div className="card-inner"><p className="reports-loading">Loading…</p></div></div>
      </div>
    );
  }

  if (source !== "api") {
    return (
      <div className="grid" style={{ gap: 20 }}>
        <TabBar tabs={tabs} active="Sales distribution" />
        <ReportsConnectMessage
          title="Sales distribution data unavailable"
          description="Connect the Amazon Seller Central (SP-API) to see live sales distribution data for this report."
        />
        <AreaChart title="Sales distribution" series={placeholderChartSeries} />
        <div className="card">
          <div className="card-inner">
            <DataTable columns={columns} rows={[]} />
          </div>
        </div>
      </div>
    );
  }

  const data = res.data ?? {};
  const series = data.series ?? [];
  const rows = data.rows ?? [];

  return (
    <div className="grid" style={{ gap: 20 }}>
      <TabBar tabs={tabs} active="Sales distribution" />
      <p className="reports-api-badge" aria-hidden>Live data from Amazon Seller Central</p>
      {series.length > 0 && <AreaChart title="Sales distribution" series={series} />}
      <div className="card">
        <div className="card-inner">
          <DataTable columns={columns} rows={rows} />
        </div>
      </div>
    </div>
  );
}
