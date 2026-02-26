"use client";

import { useEffect, useState,useCallback } from "react";
import TabBar from "../TabBar";
import DataTable from "../DataTable";
import {useGraph} from "../../hooks/useGraph";


import { ChartContainer } from "../ui/chart"
import {Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts"


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
  const {data} = useGraph({
    "measures": [
      "AdsCampaignReports.spend",
      "AdsCampaignReports.sales",
      "AdsCampaignReports.impressions",
      "AdsCampaignReports.acos",
      "AdsCampaignReports.roas",
    ],
    "dimensions": [
      "AdsCampaignReports.report_date"
    ],
    "timeDimensions": [
      {
        "dimension": "AdsCampaignReports.report_date",
        "granularity": "day"
      }
    ]
  },(data)=>data.map(item=>{
    const date = new Date(item['AdsCampaignReports.report_date']);
    return {
      date: date.toLocaleDateString(),
      spend: item['AdsCampaignReports.spend'],
      sales: item['AdsCampaignReports.sales'],
      impressions: item['AdsCampaignReports.impressions'],
      roas: item['AdsCampaignReports.roas'],
      acos: item['AdsCampaignReports.acos'],
    }
  }))
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
      <div className={"tw:grid tw:grid-cols-2 tw:gap-2"}>
        <div className="card">
          <div className="card-inner">
            <h3 className="text-lg font-semibold mb-4">Sales vs Spend</h3>
            <div style={{ width: '100%', height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                >
                  <CartesianGrid strokeDasharray="0 0" vertical={false} stroke="#f0f0f0" />
                  <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#666', fontSize: 12 }}
                  />
                  <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#666', fontSize: 12 }}
                  />
                  <Tooltip
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #ddd' }}
                  />
                  <Legend iconType="circle" />
                  <Line
                      type="monotone"
                      dataKey="spend"
                      name="Spend"
                      stroke="#2563eb"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                  />
                  <Line
                      type="monotone"
                      dataKey="sales"
                      name="Sales"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                  />
                  {/*  <Line*/}
                  {/*    type="monotone"*/}
                  {/*    dataKey="impressions"*/}
                  {/*    name="Impressions"*/}
                  {/*    stroke="#ffd978"*/}
                  {/*    strokeWidth={2}*/}
                  {/*    dot={{ r: 4 }}*/}
                  {/*    activeDot={{ r: 6 }}*/}
                  {/*/>*/}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-inner">
            <h3 className="text-lg font-semibold mb-4">Acos VS ROAS</h3>
            <div style={{ width: '100%', height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                >
                  <CartesianGrid strokeDasharray="0 0" vertical={false} stroke="#f0f0f0" />
                  <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#666', fontSize: 12 }}
                  />
                  <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#666', fontSize: 12 }}
                  />
                  <Tooltip
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #ddd' }}
                  />
                  <Legend iconType="circle" />
                  <Line
                      type="monotone"
                      dataKey="roas"
                      name="Roas"
                      stroke="#2563eb"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                  />
                  <Line
                      type="monotone"
                      dataKey="acos"
                      name="Acos"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                  />
                  {/*  <Line*/}
                  {/*    type="monotone"*/}
                  {/*    dataKey="impressions"*/}
                  {/*    name="Impressions"*/}
                  {/*    stroke="#ffd978"*/}
                  {/*    strokeWidth={2}*/}
                  {/*    dot={{ r: 4 }}*/}
                  {/*    activeDot={{ r: 6 }}*/}
                  {/*/>*/}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
