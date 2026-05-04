"use client";

import TabBar from "../TabBar";
import MetricGrid from "../MetricGrid";
import LineChart from "../LineChart";
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

export default function ReportAdsOverview({ initialData }) {
  const { data } = useData(
    {
      measures: [...ADS_DAILY_GRAPH_MEASURES],
      dimensions: ["AdsCampaignReports.report_date"],
    },
    (rows) => rows.map(mapAdsCampaignDailyGraphRow),
    "adsoverviewbydate",
    "AdsCampaignReports.report_date",
    true,
    { initialData: initialData?.graphData }
  );

  const { data: metrics, isLoading } = useData(
    {
      measures: [
        "AdsCampaignReports.spend",
        "AdsCampaignReports.sales",
        "AdsCampaignReports.purchases14d",
        "AdsCampaignReports.impressions",
        "AdsCampaignReports.clicks",
        "AdsCampaignReports.acos",
        "AdsCampaignReports.roas",
        "AdsCampaignReports.ctr",
        "AdsCampaignReports.cpc",
      ],
    },
    (rows) =>
      rows.map((item) => [
        {
          label: "Total Ad Sales",
          value: item["AdsCampaignReports.sales"],
          formatter: "currency",
        },
        {
          label: "Amount Spent",
          value: item["AdsCampaignReports.spend"],
          formatter: "currency",
        },
        {
          label: "Total Ad Orders",
          value: item["AdsCampaignReports.purchases14d"],
          formatter: "compact",
        },
        {
          label: "ACOS",
          value: item["AdsCampaignReports.acos"],
          formatter: "percent",
        },
        {
          label: "ROAS",
          value: item["AdsCampaignReports.roas"],
          formatter: "percent",
        },
        {
          label: "Impressions",
          value: item["AdsCampaignReports.impressions"],
          formatter: "compact",
        },
        {
          label: "Clicks",
          value: item["AdsCampaignReports.clicks"],
          formatter: "compact",
        },
        {
          label: "CPC",
          value: item["AdsCampaignReports.cpc"],
          formatter: "currency",
        },
        {
          label: "CTR",
          value: item["AdsCampaignReports.ctr"],
          formatter: "percent",
        },
        { label: "Conversion Rate", value: "-", formatter: "default" },
      ]),
    "adsoverview",
    "AdsCampaignReports.report_date",
    true,
    { initialData: initialData?.metrics ? [initialData.metrics] : undefined }
  );

  if (isLoading) {
    return (
      <div className="grid" style={{ gap: 20 }}>
        <TabBar tabs={tabs} active="Ads Overview" />
        <div className="card">
          <div className="card-inner">
            <p className="reports-loading">Loading…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid" style={{ gap: 20 }}>
      <TabBar tabs={tabs} active="Ads Overview" />
      <p className="reports-api-badge" aria-hidden>
        Live data from Amazon Advertising
      </p>
      {metrics && metrics.length > 0 && (
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
          xKey={"date"}
          config={{
            cpc: {
              key: "cpc",
              name: "CPC",
              color: "#f0b76c",
              formatter: "currency",
            },
            ctr: {
              key: "ctr",
              name: "CTR",
              color: "#6c82f0",
              formatter: "percent",
            },
          }}
        />
        <LineChart
          data={data}
          title={"Spend vs ad sales"}
          xKey={"date"}
          config={{
            spend: {
              key: "spend",
              name: "Spend",
              color: "#6caaf0",
              formatter: "currency",
            },
            adSales: {
              key: "sales",
              name: "Ad sales",
              color: "#ac6cf0",
              formatter: "currency",
            },
          }}
        />
      </div>
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
      <div className="grid grid-2">
        <LineChart
          data={data}
          title={"ACOS vs ROAS"}
          xKey={"date"}
          config={{
            acos: {
              key: "acos",
              name: "ACOS",
              color: "#f07c6c",
              formatter: "percent",
            },
            roas: {
              key: "roas",
              name: "ROAS",
              color: "#f0e96c",
              formatter: "percent",
            },
          }}
        />
      </div>
    </div>
  );
}
