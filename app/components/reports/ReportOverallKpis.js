"use client";

import { useEffect, useState } from "react";
import TabBar from "../TabBar";
import MetricStrip from "../MetricStrip";
import LineChart from "../LineChart";
import GaugeChart from "../GaugeChart";
import ReportsConnectMessage from "../ReportsConnectMessage";
import { kpiMetricLabels, placeholderChartSeries } from "../../lib/sampleData";
import {useGraph} from "@/hooks/useGraph.js";

const tabs = [
  { label: "Overall KPIs", href: "/reports/overall-kpis" },
  { label: "Ads Overview", href: "/reports/ads-overview" },
  { label: "Seller Central Overview", href: "/reports/seller-central" },
  { label: "Keywords And Search Terms", href: "/reports/keywords" },
  { label: "Campaigns", href: "/reports/campaigns" },
];

export default function ReportOverallKpis() {
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(true);
    const {data} = useGraph({
        "measures": [
            "AdsCampaignReports.spend",
            "AdsCampaignReports.sales",
            "AdsCampaignReports.acos",
            "AdsCampaignReports.roas",
            "AdsCampaignReports.ctr",
            "AdsCampaignReports.cpc",
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
            ctr: item['AdsCampaignReports.ctr'],
            cpc: item['AdsCampaignReports.cpc'],
            roas: item['AdsCampaignReports.roas'],
            acos: item['AdsCampaignReports.acos'],
        }
    }))

  useEffect(() => {
    const base = typeof window !== "undefined" ? window.location.origin : "";
    fetch(`${base}/api/amazon/seller/kpis`)
      .then((r) => r.json())
      .then(setRes)
      .catch(() => setRes({ source: "sample" }))
      .finally(() => setLoading(false));
  }, []);

  const source = res?.source ?? "sample";
  const sellerOnly = res?.data?.sellerOnly === true;
  const metrics = source === "api" && res?.data?.metrics?.length ? res.data.metrics : null;

  if (loading) {
    return (
      <div className="grid" style={{ gap: 20 }}>
        <TabBar tabs={tabs} active="Overall KPIs" />
        <div className="card"><div className="card-inner"><p className="reports-loading">Loading…</p></div></div>
      </div>
    );
  }

  const placeholderMetrics = kpiMetricLabels.map((label) => ({ label, value: "—" }));

  if (source !== "api") {
    return (
      <div className="grid" style={{ gap: 20 }}>
        <TabBar tabs={tabs} active="Overall KPIs" />
        <ReportsConnectMessage
          title="Live data unavailable"
          description="Connect the Amazon Seller Central (SP-API) and, for spend metrics, the Advertising API to see KPIs here."
        />
        <div className="card">
          <div className="card-inner">
            <MetricStrip metrics={placeholderMetrics} />
          </div>
        </div>
        <div className="grid grid-2">
          <GaugeChart title="Total Spend" value={0} max={1} empty />
          <LineChart title="Spend vs Sales" series={placeholderChartSeries} />
        </div>
      </div>
    );
  }

  const showSpendData = true //!sellerOnly && res?.data?.series?.length > 0;

  return (
    <div className="grid" style={{ gap: 20 }}>
      <TabBar tabs={tabs} active="Overall KPIs" />
      <p className="reports-api-badge" aria-hidden>Live data from Amazon</p>
      {metrics && (
        <div className="card">
          <div className="card-inner">
            <MetricStrip metrics={metrics} />
          </div>
        </div>
      )}
      {sellerOnly && (
        <ReportsConnectMessage
          title="Spend data unavailable"
          description="Connect the Amazon Advertising API to see Total Spend and Spend vs Sales. Seller Central does not provide advertising spend."
        />
      )}
      <div className="grid grid-2">
        {showSpendData ? (
          <GaugeChart title="Total Spend" value={300} fill={'#ac6cf0'} max={500} />
        ) : (
          <GaugeChart title="Total Spend" value={0} max={1} empty />
        )}
        {showSpendData ? (
            <LineChart
                data={data}
                title={"Sales vs Spend"}
                xKey={'date'}
                config={
                    {
                        sales:{
                            key:'sales',
                            name: "Sales",
                            color: "#ac6cf0",
                        },
                        spend:{
                            key:'spend',
                            name: "Spend",
                            color: "#6caaf0",
                        }}
                }
            />
        ) : (
          <LineChart title="Spend vs Sales" series={placeholderChartSeries} />
        )}
      </div>
    </div>
  );
}
