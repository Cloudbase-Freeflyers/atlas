"use client";

import { useEffect, useState } from "react";
import TabBar from "../TabBar";
import DataTable from "../DataTable";
import LineChart from "../LineChart";
import ReportsConnectMessage from "../ReportsConnectMessage";
import { placeholderChartSeries } from "../../lib/sampleData";
import {useGraph} from "../../hooks/useGraph.js";
import {useData} from "@/hooks/useData.js";

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
  { key: "spend", label: "Spend",formatter: "currency" },
  { key: "clicks", label: "Clicks",formatter: 'compact' },
  { key: "orders", label: "Orders",formatter: 'compact' },
  { key: "sales", label: "Sales",formatter: "currency" },
  { key: "conversion", label: "Conversion",formatter: 'compact' },
  { key: "roas", label: "ROAS",formatter: "percent" },
  { key: "ctr", label: "CTR",formatter: "percent" },
];

export default function ReportKeywords() {
  const {data:keywords,isLoading} = useData({
    "dimensions": [
      "AdsKeywordReports.keyword_id",
      "AdsKeywordReports.keyword_text",
      "AdsKeywordReports.match_type"
    ],
    "measures": [
      "AdsKeywordReports.clicks",
      "AdsKeywordReports.cost",
      "AdsKeywordReports.purchases14d",
      "AdsKeywordReports.sales14d",
      "AdsKeywordReports.roas",
      "AdsKeywordReports.ctr",
      "AdsKeywordReports.cpc",
      "AdsKeywordReports.acos",
    ]
  },(data)=>data.map(item=>({
    id: item['AdsKeywordReports.keyword_id'],
    term: item['AdsKeywordReports.keyword_text'],
    match: item['AdsKeywordReports.match_type'],
    spend: item['AdsKeywordReports.cost'],
    clicks: item['AdsKeywordReports.clicks'],
    orders: item['AdsKeywordReports.purchases14d'],
    sales: item['AdsKeywordReports.sales14d'],
    // conversion: "0%",
    roas: item['AdsKeywordReports.roas'],
    ctr: item['AdsKeywordReports.ctr'],
  })),"keywrds","AdsKeywordReports.report_date")
  const {data:graphData} = useData({
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
  }),"adsGraphs","AdsCampaignReports.report_date")

  if (isLoading) {
    return (
      <div className="grid" style={{ gap: 20 }}>
        <TabBar tabs={tabs} active="Keywords And Search Terms" />
        <div className="card"><div className="card-inner"><p className="reports-loading">Loading…</p></div></div>
      </div>
    );
  }

  return (
    <div className="grid" style={{ gap: 20 }}>
      <TabBar tabs={tabs} active="Keywords And Search Terms" />
      <div className="card">
        <div className="card-inner">
          <div className="filter-row">
            <input className="input" placeholder="Campaign Name" />
            <input className="input" placeholder="Spend USD" />
            <input className="input" placeholder="Sales USD" />
            <input className="input" placeholder="Clicks" />
          </div>
          <DataTable columns={columns} rows={keywords} />
        </div>
      </div>
      <div className={"tw:grid tw:grid-cols-2 tw:gap-2"}>
        <LineChart
            data={graphData}
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
        <LineChart
            data={graphData}
            title={"Acos vs Roas"}
            xKey={'date'}
            config={{
              acos:{
                key:'acos',
                name: "Acos",
                color: "#f07c6c",
              },
              roas:{
                key:'roas',
                name: "Roas",
                color: "#f0e96c",
              }
            }}
        />
      </div>
    </div>
  );
}
