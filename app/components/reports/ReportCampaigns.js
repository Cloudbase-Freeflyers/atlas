"use client";

import { useEffect, useState,useCallback } from "react";
import TabBar from "../TabBar";
import DataTable from "../DataTable";
import {useGraph} from "../../hooks/useGraph";
import LineChart from "../LineChart.js";
import {useData} from "@/hooks/useData.js";



const tabs = [
  { label: "Overall KPIs", href: "/reports/overall-kpis" },
  { label: "Ads Overview", href: "/reports/ads-overview" },
  { label: "Seller Central Overview", href: "/reports/seller-central" },
  { label: "Keywords And Search Terms", href: "/reports/keywords" },
  { label: "Campaigns", href: "/reports/campaigns" },
];

const columns = [
  { key: "name", label: "Campaign Name" },
  { key: "spend", label: "Spend",formatter: "currency" },
  { key: "impressions", label: "Impressions",formatter: 'compact' },
  { key: "clicks", label: "Clicks",formatter: 'compact' },
  { key: "orders", label: "Orders",formatter: 'compact' },
  { key: "sales", label: "Sales",formatter: "currency" },
  { key: "conversion", label: "Conversion",formatter: 'compact' },
  { key: "roas", label: "ROAS", formatter: "percent" },
  { key: "ctr", label: "CTR",formatter: "percent" },
  { key: "acos", label: "ACOS",formatter: "percent" },
];


export default function ReportCampaigns({ initialData }) {
  const {data:campaigns,isLoading} = useData({
    "dimensions": [
      "AdsCampaignReports.campaign_name",
      "AdsCampaignReports.campaign_id",
    ],
    "measures": [
      "AdsCampaignReports.clicks",
      "AdsCampaignReports.cost",
      "AdsCampaignReports.impressions",
      "AdsCampaignReports.cost",
      "AdsCampaignReports.sales14d",
      "AdsCampaignReports.purchases14d",
      "AdsCampaignReports.roas",
      "AdsCampaignReports.ctr",
      "AdsCampaignReports.cpc",
      "AdsCampaignReports.acos",
    ]
  },(data)=>data.map(item=>({
    name: item['AdsCampaignReports.campaign_name'],
    id: item['AdsCampaignReports.campaign_id'],
    clicks: item['AdsCampaignReports.clicks'],
    impressions: item['AdsCampaignReports.impressions'],
    spend: item['AdsCampaignReports.cost'],
    sales: item['AdsCampaignReports.sales14d'],
    orders: item['AdsCampaignReports.purchases14d'],
    roas: item['AdsCampaignReports.roas'],
    ctr: item['AdsCampaignReports.ctr'],
    acos: item['AdsCampaignReports.acos'],
  })),"campaigns",null,true,{ initialData: initialData?.campaigns })
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
  }),"adsGraphs","AdsCampaignReports.report_date", true, { initialData: initialData?.graphData })


  if (isLoading) {
    return (
      <div className="grid" style={{ gap: 20 }}>
        <TabBar tabs={tabs} active="Campaigns" />
        <div className="card"><div className="card-inner"><p className="reports-loading">Loading…</p></div></div>
      </div>
    );
  }
  return (
    <div className="grid" style={{ gap: 20 }}>
      <TabBar tabs={tabs} active="Campaigns" />
      <div className="card">
        <div className="card-inner">
          <div className="filter-row">
            <input className="input" placeholder="Campaign Name" />
            <input className="input" placeholder="Spend USD" />
            <button className="button">Contains</button>
          </div>
          <DataTable columns={columns} rows={campaigns} />
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
