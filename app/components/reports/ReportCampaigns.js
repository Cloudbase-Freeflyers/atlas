"use client";

import { useEffect, useMemo, useState } from "react";

import DataTable from "../DataTable";
import LineChart from "../LineChart.js";
import AIPageBrief from "../ai/AIPageBrief";
import AIRowAction from "../ai/AIRowAction";
import { useData } from "@/hooks/useData.js";
import {
  ADS_DAILY_GRAPH_MEASURES,
  mapAdsCampaignDailyGraphRow,
} from "@/lib/mapAdsDailyGraphRow.js";
import { mapCampaignDailyRow } from "@/lib/mapAdsEntityDaily.js";



const columns = [
  { key: "name", label: "Campaign Name" },
  { key: "adType", label: "Type" },
  { key: "spend", label: "Spend", formatter: "currency" },
  { key: "impressions", label: "Impressions", formatter: "compact" },
  { key: "clicks", label: "Clicks", formatter: "compact" },
  { key: "orders", label: "Orders", formatter: "compact" },
  { key: "sales", label: "Sales", formatter: "currency" },
  { key: "conversion", label: "Conversion", formatter: "compact" },
  { key: "roas", label: "ROAS", formatter: "percent" },
  { key: "ctr", label: "CTR", formatter: "percent" },
  { key: "acos", label: "ACOS", formatter: "percent" },
  { key: "_ai", label: "", render: (row) => <AIRowAction type="campaign" row={row} /> },
];

const campaignDailyPayload = {
  dimensions: [
    "AdsCampaignReports.campaign_id",
    "AdsCampaignReports.campaign_name",
  ],
  measures: [
    "AdsCampaignReports.cost",
    "AdsCampaignReports.clicks",
    "AdsCampaignReports.impressions",
    "AdsCampaignReports.sales14d",
    "AdsCampaignReports.purchases14d",
    "AdsCampaignReports.ctr",
    "AdsCampaignReports.cpc",
    "AdsCampaignReports.acos",
    "AdsCampaignReports.roas",
  ],
  order: { "AdsCampaignReports.report_date": "asc" },
};

export default function ReportCampaigns({ initialData }) {
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);

  const { data: campaigns, isLoading } = useData(
    {
      dimensions: [
        "AdsCampaignReports.campaign_name",
        "AdsCampaignReports.campaign_id",
        "AdsCampaignReports.ad_type",
      ],
      measures: [
        "AdsCampaignReports.clicks",
        "AdsCampaignReports.cost",
        "AdsCampaignReports.impressions",
        "AdsCampaignReports.sales14d",
        "AdsCampaignReports.purchases14d",
        "AdsCampaignReports.roas",
        "AdsCampaignReports.ctr",
        "AdsCampaignReports.cpc",
        "AdsCampaignReports.acos",
      ],
    },
    (data) =>
      data.map((item) => ({
        name: item["AdsCampaignReports.campaign_name"],
        id: item["AdsCampaignReports.campaign_id"],
        adType: item["AdsCampaignReports.ad_type"] || "",
        clicks: item["AdsCampaignReports.clicks"],
        impressions: item["AdsCampaignReports.impressions"],
        spend: item["AdsCampaignReports.cost"],
        sales: item["AdsCampaignReports.sales14d"],
        orders: item["AdsCampaignReports.purchases14d"],
        roas: item["AdsCampaignReports.roas"],
        ctr: item["AdsCampaignReports.ctr"],
        acos: item["AdsCampaignReports.acos"],
      })),
    "campaigns",
    "AdsCampaignReports.report_date",
    true,
    { initialData: initialData?.campaigns }
  );

  const { data: graphData } = useData(
    {
      measures: [...ADS_DAILY_GRAPH_MEASURES],
      dimensions: ["AdsCampaignReports.report_date"],
    },
    (rows) => rows.map(mapAdsCampaignDailyGraphRow),
    "adsGraphs",
    "AdsCampaignReports.report_date",
    true,
    { initialData: initialData?.graphData }
  );

  const { data: campaignDaily } = useData(
    campaignDailyPayload,
    (rows) => rows.map(mapCampaignDailyRow),
    "campaigndaily",
    "AdsCampaignReports.report_date",
    true,
    { initialData: initialData?.campaignDaily }
  );

  useEffect(() => {
    if (selectedCampaignId != null || !campaigns?.length) return;
    setSelectedCampaignId(String(campaigns[0].id));
  }, [campaigns, selectedCampaignId]);

  const entitySeries = useMemo(() => {
    if (!campaignDaily?.length || selectedCampaignId == null) return [];
    return campaignDaily
      .filter((r) => String(r.campaignId) === String(selectedCampaignId))
      .sort((a, b) => (a.sortKey ?? 0) - (b.sortKey ?? 0));
  }, [campaignDaily, selectedCampaignId]);

  const selectedName = campaigns?.find(
    (c) => String(c.id) === String(selectedCampaignId)
  )?.name;

  if (isLoading) {
    return (
      <div className="grid" style={{ gap: 20 }}>

        <div className="card">
          <div className="card-inner">
            <p className="reports-loading">Loading…</p>
          </div>
        </div>
      </div>
    );
  }

  const briefMetrics = useMemo(() => {
    if (!campaigns?.length) return {};
    const totSpend = campaigns.reduce((s, c) => s + (parseFloat(c.spend) || 0), 0);
    const totSales = campaigns.reduce((s, c) => s + (parseFloat(c.sales) || 0), 0);
    const avgAcos = campaigns.reduce((s, c) => s + (parseFloat(c.acos) || 0), 0) / campaigns.length;
    const avgRoas = campaigns.reduce((s, c) => s + (parseFloat(c.roas) || 0), 0) / campaigns.length;
    return { "Total Spend": totSpend, "Total Sales (14d)": totSales, "Avg ACOS": avgAcos, "Avg ROAS": avgRoas, "Campaign Count": campaigns.length };
  }, [campaigns]);

  return (
    <div className="grid" style={{ gap: 20 }}>

      <AIPageBrief page="campaigns" metrics={briefMetrics} title="Campaign Health Brief" />
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
      {campaigns?.length > 0 && (
        <div className="card">
          <div className="card-inner">
            <div className="filter-row" style={{ marginBottom: 16 }}>
              <label className="tw:text-sm tw:text-muted-foreground">
                Campaign trend
              </label>
              <select
                className="input"
                value={selectedCampaignId ?? ""}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
              >
                {campaigns.map((c) => (
                  <option key={String(c.id)} value={String(c.id)}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <LineChart
              data={entitySeries}
              title={
                selectedName
                  ? `Spend vs sales — ${selectedName}`
                  : "Campaign spend vs sales"
              }
              xKey="date"
              config={{
                spend: {
                  key: "spend",
                  name: "Spend",
                  color: "#6caaf0",
                  formatter: "currency",
                },
                sales: {
                  key: "sales",
                  name: "Sales (14d)",
                  color: "#ac6cf0",
                  formatter: "currency",
                },
              }}
            />
          </div>
        </div>
      )}
      <div className={"tw:grid tw:grid-cols-2 tw:gap-2"}>
        <LineChart
          data={graphData}
          title={"Spend vs ad sales (account)"}
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
        <LineChart
          data={graphData}
          title={"ACOS vs ROAS (account)"}
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
