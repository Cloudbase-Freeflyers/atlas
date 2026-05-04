"use client";

import { useMemo } from "react";
import TabBar from "../TabBar";
import MetricStrip from "../MetricStrip";
import LineChart from "../LineChart";
import GaugeChart from "../GaugeChart";
import { placeholderChartSeries } from "../../lib/sampleData";
import { useData } from "@/hooks/useData.js";
import {
  ADS_DAILY_GRAPH_MEASURES,
  mapAdsCampaignDailyGraphRow,
} from "@/lib/mapAdsDailyGraphRow.js";

const tabs = [
  { label: "Overall KPIs", href: "/reports/overall-kpis" },
  { label: "Ads Overview", href: "/reports/ads-overview" },
  { label: "Seller Central Overview", href: "/reports/seller-central" },
  { label: "Keywords And Search Terms", href: "/reports/keywords" },
  { label: "Campaigns", href: "/reports/campaigns" },
  { label: "Insights", href: "/reports/callouts" },
];

export default function ReportOverallKpis({ initialData }) {
    const {data} = useData({
        "measures": [...ADS_DAILY_GRAPH_MEASURES],
        "dimensions": [
            "AdsCampaignReports.report_date"
        ],
        "timeDimensions": [
            {
                "dimension": "AdsCampaignReports.report_date",
                "granularity": "day"
            }
        ]
    },(rows)=>rows.map(mapAdsCampaignDailyGraphRow),"overadskpigraph","AdsCampaignReports.report_date", true, { initialData: initialData?.graphData })

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
    ])),"saleoverallkips","SellerOrderReports.purchase_date", true, { 
        initialData: initialData?.kpis ? [initialData.kpis.filter(k => k.label.includes("Total Orders") || k.label.includes("Total Sales"))] : undefined 
    })
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
        { label: "Total ACOS", value: item['AdsCampaignReports.acos'],formatter: "percent" },
        { label: "Total ROAS", value: item['AdsCampaignReports.roas'],formatter:"percent" },
    ])),"adsoverallkips","AdsCampaignReports.report_date", true, {
        initialData: initialData?.kpis ? [initialData.kpis.filter(k => k.label.includes("Amount Spent") || k.label.includes("Total Ad Orders") || k.label.includes("ROAS") || k.label.includes("ACOS"))] : undefined
    })

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

    const spendAmount = useMemo(() => {
        const m = kpis.find((k) => k.label === "Amount Spent ($)");
        return typeof m?.value === "number" && !Number.isNaN(m.value) ? m.value : 0;
    }, [kpis]);

    const spendGaugeMax = useMemo(
        () => Math.max(100, spendAmount * 1.25, 500),
        [spendAmount]
    );

  if (isLoading) {
    return (
      <div className="grid" style={{ gap: 20 }}>
        <TabBar tabs={tabs} active="Overall KPIs" />
        <div className="card"><div className="card-inner"><p className="reports-loading">Loading…</p></div></div>
      </div>
    );
  }


  const showSpendData = true;

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
          <GaugeChart
            title="Total Spend"
            value={spendAmount}
            fill="#ac6cf0"
            max={spendGaugeMax}
          />
        ) : (
          <GaugeChart title="Total Spend" value={0} max={1} empty />
        )}
        {showSpendData ? (
            <LineChart
                data={data}
                title={"Spend vs ad sales"}
                xKey={'date'}
                config={
                    {
                        spend:{
                            key:'spend',
                            name: "Spend",
                            color: "#6caaf0",
                            formatter: "currency",
                        },
                        adSales:{
                            key:'sales',
                            name: "Ad sales",
                            color: "#ac6cf0",
                            formatter: "currency",
                        }}
                }
            />
        ) : (
          <LineChart title="Spend vs Sales" series={placeholderChartSeries} />
        )}
      </div>
      {showSpendData ? (
        <div className={"tw:grid tw:grid-cols-2 tw:gap-2"}>
          <LineChart
            data={data}
            title={"Impressions & clicks"}
            xKey={"date"}
            config={{
              impressions: {
                key: "impressions",
                name: "Impressions",
                color: "#5ad8e6",
                formatter: "compact",
              },
              clicks: {
                key: "clicks",
                name: "Clicks",
                color: "#e8b65a",
                formatter: "compact",
              },
            }}
          />
          <LineChart
            data={data}
            title={"Spend & ad orders"}
            xKey={"date"}
            config={{
              spend: {
                key: "spend",
                name: "Spend",
                color: "#6caaf0",
                formatter: "currency",
              },
              orders: {
                key: "purchases14d",
                name: "Ad orders (14d)",
                color: "#9ecf7a",
                formatter: "compact",
              },
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
