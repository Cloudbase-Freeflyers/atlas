"use client";

import { useEffect, useState } from "react";
import TabBar from "../TabBar";
import MetricGrid from "../MetricGrid";
import LineChart from "../LineChart";
import AreaChart from "../AreaChart";
import ReportsConnectMessage from "../ReportsConnectMessage";
import { placeholderAdsMetrics, placeholderChartSeries } from "../../lib/sampleData";
import {useGraph} from "@/hooks/useGraph.js";
import {useData} from "@/hooks/useData.js";

const tabs = [
  { label: "Overall KPIs", href: "/reports/overall-kpis" },
  { label: "Ads Overview", href: "/reports/ads-overview" },
  { label: "Seller Central Overview", href: "/reports/seller-central" },
  { label: "Keywords And Search Terms", href: "/reports/keywords" },
  { label: "Campaigns", href: "/reports/campaigns" },
];

export default function ReportAdsOverview() {
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
    }),"adsoverviewbydate","AdsCampaignReports.report_date")

    const {data:metrics,isLoading} = useData({
        "measures": [
            "AdsCampaignReports.spend",
            "AdsCampaignReports.sales",
            "AdsCampaignReports.purchases14d",
            "AdsCampaignReports.impressions",
            "AdsCampaignReports.clicks",
            "AdsCampaignReports.acos",
            "AdsCampaignReports.roas",
            "AdsCampaignReports.ctr",
            "AdsCampaignReports.cpc",
        ]
    },(data)=>data.map(item=>{
        return [
            {
                label: "Total Ad Sales",
                value:item['AdsCampaignReports.sales'],
                formatter:"currency"
            }, {
                label: "Amount Spent",
                value:item['AdsCampaignReports.spend'],
                formatter:"currency"
            }, {
                label: "Total Ad Orders",
                value:item['AdsCampaignReports.purchases14d'],
                formatter:"compact"
            },{
                label: "ACOS",
                value:item['AdsCampaignReports.acos'],
                formatter:"percent"
            }, {
                label:"ROAS",
                value:item['AdsCampaignReports.roas'],
                formatter:"percent"
            },{
                label: "Impressions",
                value:item['AdsCampaignReports.impressions'],
                formatter:"compact"
            },{
                label: "Clicks",
                value:item['AdsCampaignReports.clicks'],
                formatter:"compact"
            },{
                label: "CPC",value:item['AdsCampaignReports.cpc'],
                formatter:"percent"
            },{
                label: "CTR",value:item['AdsCampaignReports.ctr'],formatter:"percent"
            },{label: "Conversion Rate",value:'-',formatter:(v)=>v
            }
        ]
    }),"adsoverview","AdsCampaignReports.report_date")


    if (isLoading) {
    return (
      <div className="grid" style={{ gap: 20 }}>
        <TabBar tabs={tabs} active="Ads Overview" />
        <div className="card"><div className="card-inner"><p className="reports-loading">Loading…</p></div></div>
      </div>
    );
  }
    console.log(metrics);
  return (
    <div className="grid" style={{ gap: 20 }}>
      <TabBar tabs={tabs} active="Ads Overview" />
      <p className="reports-api-badge" aria-hidden>Live data from Amazon Advertising</p>
      {metrics&&metrics.length > 0 && (
        <div className="card">
          <div className="card-inner">
            <MetricGrid items={metrics[0]} />
          </div>
        </div>
      )}
        <div className={"tw:grid tw:grid-cols-2 tw:gap-2"}>
            <LineChart
                data={data}
                title={"CTR vs CPC"}
                xKey={'date'}
                config={{
                    cpc:{
                        key:'cpc',
                        name: "cpc",
                        color: "#f0b76c",
                    },
                    ctr:{
                        key:'ctr',
                        name: "CTR",
                        color: "#6c82f0",
                    }
                }}
            />
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
        </div>
      <div className="grid grid-2">
          <LineChart
              data={data}
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
        {/*{series.length > 0 && <AreaChart title="Sales (Last 30 Days)" series={series} />}*/}
      </div>
    </div>
  );
}
