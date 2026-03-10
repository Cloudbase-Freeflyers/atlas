"use client";

import { useEffect, useState } from "react";
import TabBar from "../../../components/TabBar";
import LineChart from "../../../components/LineChart";
import DataTable from "../../../components/DataTable";
import ReportsConnectMessage from "../../../components/ReportsConnectMessage";
import { placeholderChartSeries } from "../../../lib/sampleData";
import {useData} from "@/hooks/useData.js";

const tabs = [
  { label: "Sales distribution", href: "/reports/seller-central/sales-distribution" },
  { label: "P&L distribution", href: "/reports/seller-central" },
  { label: "Units", href: "/reports/seller-central/units" },
  { label: "Sessions", href: "/reports/seller-central/sessions" },
  { label: "PPC", href: "/reports/seller-central/ppc" },
];

const columns = [
  { key: "product", label: "Product" },
  { key: "organic", label: "Organic Units" },
  { key: "ppc", label: "PPC Units" },
  { key: "total", label: "Total Units" },
];

export default function UnitsPage() {
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(true);

    const {data:graphData,isLoading} = useData({
        "dimensions": [
            "PnlDistribution.report_date",
            "PnlDistribution.company_id"
        ],
        "measures": [
            "PnlDistribution.adUnits",
            "PnlDistribution.organicUnits",
            "PnlDistribution.totalUnits"
        ],"order": {
            "PnlDistribution.report_date": "asc"
        },
    },(data)=>data.map(item=>({
        date: new Date(item['PnlDistribution.report_date']).toLocaleDateString(),
        adUnits:item['PnlDistribution.adUnits'],
        organicUnits:item['PnlDistribution.organicUnits'],
        totalUnits:item['PnlDistribution.totalUnits'],
    })),"sellercenteroverview","PnlDistribution.report_date")

  useEffect(() => {
    const base = typeof window !== "undefined" ? window.location.origin : "";
    fetch(`${base}/api/amazon/seller/units`)
      .then((r) => r.json())
      .then(setRes)
      .catch(() => setRes({ source: "sample" }))
      .finally(() => setLoading(false));
  }, []);

  const source = res?.source ?? "sample";

  if (loading) {
    return (
      <div className="grid" style={{ gap: 20 }}>
        <TabBar tabs={tabs} active="Units" />
        <div className="card"><div className="card-inner"><p className="reports-loading">Loading…</p></div></div>
      </div>
    );
  }

  const data = res.data ?? {};
  const series = data.series ?? [];
  const rows = data.rows ?? [];

  return (
    <div className="grid" style={{ gap: 20 }}>
      <TabBar tabs={tabs} active="Units" />
      <p className="reports-api-badge" aria-hidden>Live data from Amazon Seller Central</p>
      {/*{series.length > 0 && <LineChart title="Units (last 30 days)" series={series} />}*/}
        <LineChart title="Units: Organic vs PPC" xKey={'date'} data={graphData} config={{
            organicUnits:{
                key:'organicUnits',
                label: "Organic Units",
                color: "#98f06c",
            },
            adUnits:{
                key:'adUnits',
                label: "Ad Units",
                color: "#f0e96c",
            },
        }} />
      <div className="card">
        <div className="card-inner">
          <DataTable columns={columns} rows={rows} />
        </div>
      </div>
    </div>
  );
}
