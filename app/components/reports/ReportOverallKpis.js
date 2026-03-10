"use client";

import {useEffect, useMemo, useState} from "react";
import TabBar from "../TabBar";
import MetricStrip from "../MetricStrip";
import LineChart from "../LineChart";
import GaugeChart from "../GaugeChart";
import ReportsConnectMessage from "../ReportsConnectMessage";
import { kpiMetricLabels, placeholderChartSeries } from "../../lib/sampleData";
import {useGraph} from "@/hooks/useGraph.js";
import {useData} from "@/hooks/useData.js";

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
    const {data} = useData({
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
    }),"overadskpigraph","AdsCampaignReports.report_date")

    const {data:salesKpis,isLoading:isLoadingSaleKpis} = useData({
        "measures": [
            "SellerOrderReports.sale",
            "SellerOrderReports.unique_order_count"
        ],
    },(data)=>data.map(item=>([
        {
            label: "Total Orders",
            value: item['SellerOrderReports.unique_order_count'],
            formatter:"compact"
        },
        { label: "Total Sales ($)", value: item['SellerOrderReports.sale'],formatter:"currency" },
    ])),"saleoverallkips","SellerOrderReports.purchase_date")
    const {data:adsKpis,isLoading:isLoadingAdsKips} = useData({
        "measures": [
            "AdsCampaignReports.spend",
            "AdsCampaignReports.purchases14d",
            "AdsCampaignReports.acos",
            "AdsCampaignReports.roas"
        ]
    },(data)=>data.map(item=>([
        {
            label: "Amount Spent ($)",
            value: item['AdsCampaignReports.spend'],
            formatter:"currency",
        },
        { label: "Total Ad Orders", value: item['AdsCampaignReports.purchases14d'],formatter:"compact" },
        { label: "Total ROAS", value: item['AdsCampaignReports.acos'],formatter: "percent" },
        { label: "Total ACOS", value: item['AdsCampaignReports.roas'],formatter:"percent" },
    ])),"adsoverallkips","AdsCampaignReports.report_date")

  const isLoading=useMemo(()=>isLoadingAdsKips||isLoadingSaleKpis,[isLoadingAdsKips,isLoadingSaleKpis])
    const kpis= useMemo(()=>{
        const kips=[]
        if (salesKpis&&salesKpis.length>0){
            kips.push(...salesKpis[0])
        }
        if(adsKpis&&adsKpis.length>0){
            kips.push(...adsKpis[0])
        }
        return kips
    },[adsKpis,salesKpis])

  if (isLoading) {
    return (
      <div className="grid" style={{ gap: 20 }}>
        <TabBar tabs={tabs} active="Overall KPIs" />
        <div className="card"><div className="card-inner"><p className="reports-loading">Loading…</p></div></div>
      </div>
    );
  }


  const showSpendData = true //!sellerOnly && res?.data?.series?.length > 0;

  return (
    <div className="grid" style={{ gap: 20 }}>
      <TabBar tabs={tabs} active="Overall KPIs" />
      <p className="reports-api-badge" aria-hidden>Live data from Amazon</p>
      {kpis.length>0 && (
        <div className="card">
          <div className="card-inner">
            <MetricStrip metrics={kpis} />
          </div>
        </div>
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
