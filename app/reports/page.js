"use client";

import DashboardCard from "../components/DashboardCard";
import { dashboardCards } from "../lib/sampleData";
import {useData} from "@/hooks/useData.js";
import {useState} from "react";



const adsCampaignStats={
  "roas": {
    label:"ROAS",
    value:"",
    stat:"AdsCampaignReports.roas",
    formatter:"percent"
  },
  "acos":{
    label:"ACOS",
    value:"",
    stat:"AdsCampaignReports.acos",
    formatter:"percent"

  },
  "sales":{
    label:"Ad Sales",
    value:"",
    formatter:"currency",
    stat:"AdsCampaignReports.sales",
  },
  "cpc":{
    label:"CPC",
    value:"",
    formatter:"percent",
    stat:"AdsCampaignReports.cpc",
  },
  "count":{
    label:"Campaigns",
    value:"",
    formatter:"compact",
    stat:"AdsCampaignReports.count",
  },
  "spend":{
    label:"spend",
    value:"",
    formatter:"currency",
    stat:"AdsCampaignReports.spend",
  }
}


const salesStats= {
  "units": {
    label: "Units",
    value: "",
    stat: "PnlDistribution.units",
    formatter: "compact"
  },
  "profit": {
    label: "Profit",
    value: "",
    stat: "PnlDistribution.profit",
    formatter: "currency"
  },
}



const searchStats= {
  "terms": {
    label: "Terms",
    value: "",
    stat: "AdsSearchTermReports.keywordCount",
    formatter: "compact"
  },
  "roas": {
    label: "Roas",
    value: "",
    stat: "AdsSearchTermReports.roas",
    formatter: "percent"
  },
}


const reportCard = [
  { href: "/reports/overall-kpis", tag: "Overview", title: "Overall KPIs", description: "Account-wide KPIs across ads + seller central.", stats: ["roas", "acos"],type:'campaign' },
  { href: "/reports/ads-overview", tag: "Advertising", title: "Ads Overview", description: "Daily ad sales, spend, CPC, and CTR trends.", stats: ["sales", "cpc"],type:'campaign' },
  { href: "/reports/seller-central", tag: "Seller Central", title: "Seller Central Overview", description: "P&L distribution with product-level performance.", stats: ["Units", "Profit"],type:'sale' },
  { href: "/reports/keywords", tag: "Search", title: "Keywords & Search Terms", description: "Targeting keywords, shopper search terms, negative candidates, core phrase rollups, match types, and top harvest terms.", stats: ["Terms", "ROAS"],type:'search' },
  { href: "/reports/campaigns", tag: "Campaigns", title: "Campaigns", description: "Campaign health, spend, and conversions.", stats: ["count", "spend"],type:'campaign' },
  { href: "/reports/inventory-forecast", tag: "Inventory", title: "Inventory Forecast", description: "Restock profiles, stock health, and lead time.", stats: ["SKUs", "Restock"],type:'inventory' },
  { href: "/reports/product-details", tag: "Catalog", title: "Product Details", description: "Editable catalog details and production costs.", stats: ["Active", "Inactive"],type:'fee' },
  { href: "/reports/sales-trend", tag: "Trends", title: "Sales Trend", description: "Weekly sales and margin heatmap.", stats: ["Weeks", "Orders"],type:'sale' },
  { href: "/reports/callouts", tag: "Insights", title: "Insights", description: "Daily snapshot (once per day), header-range Generate insights, and weekly full audit from your dashboard metrics.", stats: ["Insights", "Trend"], type: "callout" },
];

export default function ReportsPage() {
  const {data:campaignData,isLoading} = useData({
    "measures": [
      "AdsCampaignReports.acos",
      "AdsCampaignReports.sales",
      "AdsCampaignReports.spend",
      "AdsCampaignReports.roas",
      "AdsCampaignReports.cpc",
      "AdsCampaignReports.count"
    ],
    "filters": [
      {
        "member": "Companies.id",
        "operator": "equals",
        "values": [
          "1"
        ]
      }
    ]
  },(data=>data.map(item=>({
    acos:item['AdsCampaignReports.acos'],
    sales:item['AdsCampaignReports.sales'],
    spend:item['AdsCampaignReports.spend'],
    roas:item['AdsCampaignReports.roas'],
    cpc:item['AdsCampaignReports.cpc'],
    count:item['AdsCampaignReports.count'],
  }))),"overviewcampaign","AdsCampaignReports.report_date",false)


  const {data:saleData} = useData({
    "measures": [
      "PnlDistribution.profit",
      "PnlDistribution.totalUnits"
    ]
  },data=>data.map(item=>({
    profit:item['PnlDistribution.profit'],
    units:item['PnlDistribution.totalUnits'],
  })),"pnloverview","PnlDistribution.report_date",false)



  const {data:searchData} = useData({
    "measures": [
      "AdsSearchTermReports.keywordCount",
      "AdsSearchTermReports.roas"
    ]
  },data=>data.map(item=>({
    terms:item['AdsSearchTermReports.keywordCount'],
    roas:item['AdsSearchTermReports.roas'],
  })),"searchoverview","AdsSearchTermReports.report_date",false)

  const [cards, setCards] = useState([
    { href: "/reports/overall-kpis", tag: "Overview", title: "Overall KPIs", description: "Account-wide KPIs across ads + seller central.", stats: ["roas", "acos"],type:'campaign' },
    { href: "/reports/ads-overview", tag: "Advertising", title: "Ads Overview", description: "Daily ad sales, spend, CPC, and CTR trends.", stats: ["sales", "cpc"],type:'campaign' },
    { href: "/reports/seller-central", tag: "Seller Central", title: "Seller Central Overview", description: "P&L distribution with product-level performance.", stats: ["units", "profit"],type:'sale' },
    { href: "/reports/keywords", tag: "Search", title: "Keywords & Search Terms", description: "Targeting keywords, shopper search terms, negative candidates, core phrase rollups, match types, and top harvest terms.", stats: ["terms", "roas"],type:'search' },
    { href: "/reports/campaigns", tag: "Campaigns", title: "Campaigns", description: "Campaign health, spend, and conversions.", stats: ["count", "spend"],type:'campaign' },
    { href: "/reports/inventory-forecast", tag: "Inventory", title: "Inventory Forecast", description: "Restock profiles, stock health, and lead time.", stats: ["SKUs", "Restock"],type:'inventory' },
    { href: "/reports/product-details", tag: "Catalog", title: "Product Details", description: "Editable catalog details and production costs.", stats: ["Active", "Inactive"],type:'fee' },
    { href: "/reports/sales-trend", tag: "Trends", title: "Sales Trend", description: "Weekly sales and margin heatmap.", stats: ["Weeks", "Orders"],type:'sale' },
    { href: "/reports/callouts", tag: "Insights", title: "Insights", description: "Daily snapshot (once per day), header-range Generate insights, and weekly full audit from your dashboard metrics.", stats: ["Insights", "Trend"], type: "callout" },
  ]);

  const getStats = (card)=>{
    switch (card.type) {
      case "campaign":
        return card.stats.map((key) => ({
          ...adsCampaignStats[key],
          value:campaignData && campaignData.length>0 && campaignData[0][key]?campaignData[0][key]:'--'
        }))
      case "sale":
        return card.stats.map((key) => ({
          ...salesStats[key],
          value:saleData && saleData.length>0 && saleData[0][key]?saleData[0][key]:'--'
        }))
      case "search":
        return card.stats.map((key) => ({
          ...searchStats[key],
          value:searchData && searchData.length>0 && searchData[0][key]?searchData[0][key]:'--'
        }))
      case "callout":
        return [
          {
            label: "Insights",
            value: "GPT narrative",
            formatter: (v) => v,
          },
          {
            label: "Source",
            value: "Cube + OpenAI",
            formatter: (v) => v,
          },
        ];
      default:
        return card.stats.map((key) => ({
          label:key,
          value:"",formatter:(v)=>v
        }))
    }
  }

  const getLoading = (card)=>{
    switch (card.type) {
      case "campaign":
        return isLoading
      default:
        return false
    }
  }

  return (
    <>
      <section className="reports-hero">
        <div className="container">
          <div className="reports-hero-grid">
            <div className="reports-hero-copy">
              <div className="badge">API-ready for Amazon Seller Central + Advertising</div>
              <h1>Commerce control tower</h1>
              <p>
                Track profitability, ads performance, and inventory health in one shared workspace.
                Each card opens a focused module with tables and charts tuned to that signal.
              </p>
            </div>
            <div className="reports-panel">
              <div className="section-title">Shareable workspace</div>
              <p>
                Links preserve account context and can be shared across teams.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="reports-section">
        <div className="container">
          <div className="section-title">Internal pages</div>
          <div className="grid grid-auto">
            {cards.map((card) => (
              <DashboardCard
                  key={card.href}
                  description={card.description}
                  title={card.title}
                  href={card.href}
                  tag={card.tag}
                  stats={getStats(card)}
                  isLoading={getLoading(card)} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
