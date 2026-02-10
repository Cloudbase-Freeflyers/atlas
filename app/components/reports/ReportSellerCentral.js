"use client";

import { useEffect, useState } from "react";
import TabBar from "../TabBar";
import AreaChart from "../AreaChart";
import LineChart from "../LineChart";
import DataTable from "../DataTable";
import ReportsConnectMessage from "../ReportsConnectMessage";
import { placeholderChartSeries } from "../../lib/sampleData";

const tabs = [
  { label: "Sales distribution", href: "/reports/seller-central/sales-distribution" },
  { label: "P&L distribution", href: "/reports/seller-central" },
  { label: "Units", href: "/reports/seller-central/units" },
  { label: "Sessions", href: "/reports/seller-central/sessions" },
  { label: "PPC", href: "/reports/seller-central/ppc" },
];

const columns = [
  { key: "product", label: "Product" },
  { key: "orders", label: "Orders" },
  { key: "units", label: "Units" },
  { key: "sales", label: "Sales" },
  { key: "profits", label: "Profits" },
  { key: "ads", label: "Ads" },
  { key: "acos", label: "ACOS" },
  { key: "tacos", label: "TACOS" },
  { key: "sessions", label: "Sessions" },
  { key: "conversion", label: "Conversion" },
];

export default function ReportSellerCentral() {
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const base = typeof window !== "undefined" ? window.location.origin : "";
    fetch(`${base}/api/amazon/seller/overview`)
      .then((r) => r.json())
      .then(setRes)
      .catch(() => setRes({ source: "sample" }))
      .finally(() => setLoading(false));
  }, []);

  const source = res?.source ?? "sample";

  if (loading) {
    return (
      <div className="grid" style={{ gap: 20 }}>
        <TabBar tabs={tabs} active="P&L distribution" />
        <div className="card"><div className="card-inner"><p className="reports-loading">Loading…</p></div></div>
      </div>
    );
  }

  if (source !== "api") {
    return (
      <div className="grid" style={{ gap: 20 }}>
        <TabBar tabs={tabs} active="P&L distribution" />
        <ReportsConnectMessage
          title="Seller Central data unavailable"
          description="Connect the Amazon Seller Central (SP-API) credentials to see live P&L, units, and product performance here."
        />
        <AreaChart title="P&L Distribution" series={placeholderChartSeries} />
        <LineChart title="Units: Organic vs PPC" series={placeholderChartSeries} />
        <div className="card">
          <div className="card-inner">
            <div className="filter-row">
              <span className="toggle">
                <span className="toggle-pill active"><span /></span>
                Child ASINS
              </span>
              <input className="input" placeholder="Instant search" />
              <button className="button">Columns</button>
              <button className="button primary">Download</button>
            </div>
            <DataTable columns={columns} rows={[]} />
          </div>
        </div>
      </div>
    );
  }

  const data = res.data ?? {};
  const pAndlSeries = data.pAndlSeries ?? [];
  const organicSeries = data.organicSeries ?? [];
  const rows = data.rows ?? [];

  return (
    <div className="grid" style={{ gap: 20 }}>
      <TabBar tabs={tabs} active="P&L distribution" />
      <p className="reports-api-badge" aria-hidden>Live data from Amazon Seller Central</p>
      {pAndlSeries.length > 0 && <AreaChart title="P&L Distribution" series={pAndlSeries} />}
      {organicSeries.length > 0 && <LineChart title="Units: Organic vs PPC" series={organicSeries} />}
      <div className="card">
        <div className="card-inner">
          <div className="filter-row">
            <span className="toggle">
              <span className="toggle-pill active"><span /></span>
              Child ASINS
            </span>
            <input className="input" placeholder="Instant search" />
            <button className="button">Columns</button>
            <button className="button primary">Download</button>
          </div>
          <DataTable columns={columns} rows={rows} />
        </div>
      </div>
    </div>
  );
}
