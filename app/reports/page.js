"use client";

import DashboardCard from "../components/DashboardCard";
import BrandHealthScore from "../components/BrandHealthScore";
import { useData } from "@/hooks/useData.js";
import { useAuth } from "@/lib/authContext";
import { useState } from "react";
import { LayoutDashboard } from "lucide-react";

const adsCampaignStats = {
  roas:  { label: "ROAS",      stat: "AdsCampaignReports.roas",  formatter: "percent" },
  acos:  { label: "ACOS",      stat: "AdsCampaignReports.acos",  formatter: "percent" },
  sales: { label: "Ad Sales",  stat: "AdsCampaignReports.sales", formatter: "currency" },
  cpc:   { label: "CPC",       stat: "AdsCampaignReports.cpc",   formatter: "currency" },
  count: { label: "Campaigns", stat: "AdsCampaignReports.count", formatter: "compact" },
  spend: { label: "Spend",     stat: "AdsCampaignReports.spend", formatter: "currency" },
};

const salesStats = {
  units:  { label: "Units",  stat: "PnlDistribution.totalUnits", formatter: "compact" },
  profit: { label: "Profit", stat: "PnlDistribution.profit",     formatter: "currency" },
};

const searchStats = {
  terms: { label: "Terms", stat: "AdsSearchTermReports.keywordCount", formatter: "compact" },
  roas:  { label: "ROAS",  stat: "AdsSearchTermReports.roas",         formatter: "percent" },
};

const CARDS = [
  { href: "/reports/overall-kpis",         tag: "Overview",       title: "Overall KPIs",               description: "Account-wide KPIs across ads + seller central.",                                                          stats: ["roas", "acos"],  type: "campaign" },
  { href: "/reports/ads-overview",         tag: "Advertising",    title: "Ads Overview",               description: "Daily ad sales, spend, CPC, and CTR trends.",                                                             stats: ["sales", "cpc"],  type: "campaign" },
  { href: "/reports/seller-central",       tag: "Seller Central", title: "Seller Central",             description: "P&L distribution with product-level performance.",                                                        stats: ["units", "profit"],type: "sale" },
  { href: "/reports/keywords",             tag: "Search",         title: "Keywords & Search Terms",    description: "Targeting keywords, shopper search terms, negative candidates, core phrase rollups.",                     stats: ["terms", "roas"], type: "search" },
  { href: "/reports/campaigns",            tag: "Campaigns",      title: "Campaigns",                  description: "Campaign health, spend, and conversions.",                                                                stats: ["count", "spend"],type: "campaign" },
  { href: "/reports/inventory-forecast",   tag: "Inventory",      title: "Inventory Forecast",         description: "Restock profiles, stock health, and lead time.",                                                          stats: ["SKUs", "Restock"],type: "static" },
  { href: "/reports/product-details",      tag: "Catalog",        title: "Product Details",            description: "Editable catalog details and production costs.",                                                           stats: ["Active", "COGs"],type: "static" },
  { href: "/reports/sales-trend",          tag: "Trends",         title: "Sales Trend",                description: "Weekly sales and margin heatmap.",                                                                         stats: ["Weeks", "Orders"],type: "static" },
  { href: "/reports/callouts",             tag: "Insights",       title: "Insights",                   description: "Daily AI snapshot, header-range insights, and weekly full audit from your dashboard metrics.",            stats: ["GPT", "OpenAI"], type: "callout" },
  { href: "/reports/pnl",                  tag: "Seller Central", title: "P&L Dashboard",              description: "True P&L waterfall: revenue, ad cost, FBA fees, COGS, and net margin.",                                  stats: ["P&L", "New"],    type: "static", isNew: true },
  { href: "/reports/alerts",               tag: "Insights",       title: "Smart Alerts",               description: "Anomaly detection for TACOS spikes, revenue drops, inventory risk, and budget exhaustion.",               stats: ["AI", "Live"],    type: "static", isNew: true },
  { href: "/reports/budget-optimizer",     tag: "Advertising",    title: "Budget Optimizer",           description: "AI-recommended budget allocation across SP/SB/SD campaigns with projected ROAS improvement.",             stats: ["AI", "New"],     type: "static", isNew: true },
  { href: "/reports/share-of-voice",       tag: "Insights",       title: "Share of Voice",             description: "Track your keyword rank vs competitors. Visibility trends by week across your top terms.",                stats: ["SOV", "New"],    type: "static", isNew: true },
];

export default function ReportsPage() {
  const { user } = useAuth();

  const { data: campaignData, isLoading } = useData(
    { measures: ["AdsCampaignReports.acos", "AdsCampaignReports.sales", "AdsCampaignReports.spend", "AdsCampaignReports.roas", "AdsCampaignReports.cpc", "AdsCampaignReports.count"], filters: [{ member: "Companies.id", operator: "equals", values: ["1"] }] },
    (data) => data.map((item) => ({ acos: item["AdsCampaignReports.acos"], sales: item["AdsCampaignReports.sales"], spend: item["AdsCampaignReports.spend"], roas: item["AdsCampaignReports.roas"], cpc: item["AdsCampaignReports.cpc"], count: item["AdsCampaignReports.count"] })),
    "overviewcampaign", "AdsCampaignReports.report_date", false
  );

  const { data: saleData } = useData(
    { measures: ["PnlDistribution.profit", "PnlDistribution.totalUnits"] },
    (data) => data.map((item) => ({ profit: item["PnlDistribution.profit"], units: item["PnlDistribution.totalUnits"] })),
    "pnloverview", "PnlDistribution.report_date", false
  );

  const { data: searchData } = useData(
    { measures: ["AdsSearchTermReports.keywordCount", "AdsSearchTermReports.roas"] },
    (data) => data.map((item) => ({ terms: item["AdsSearchTermReports.keywordCount"], roas: item["AdsSearchTermReports.roas"] })),
    "searchoverview", "AdsSearchTermReports.report_date", false
  );

  function getStats(card) {
    const getValue = (dataset, key) => dataset?.[0]?.[key] ?? "--";
    switch (card.type) {
      case "campaign":
        return card.stats.map((key) => ({ ...adsCampaignStats[key], value: getValue(campaignData, key) }));
      case "sale":
        return card.stats.map((key) => ({ ...salesStats[key], value: getValue(saleData, key) }));
      case "search":
        return card.stats.map((key) => ({ ...searchStats[key], value: getValue(searchData, key) }));
      case "callout":
        return [{ label: "Source", value: "GPT-4o", formatter: (v) => v }, { label: "Powered by", value: "OpenAI", formatter: (v) => v }];
      default:
        return card.stats.map((key) => ({ label: key, value: "", formatter: (v) => v }));
    }
  }

  const existingCards = CARDS.filter((c) => !c.isNew);
  const newCards = CARDS.filter((c) => c.isNew);

  return (
    <div className="tw:space-y-8">
      {/* Page Header */}
      <div className="tw:flex tw:items-start tw:justify-between tw:gap-4">
        <div>
          <div className="tw:flex tw:items-center tw:gap-2 tw:mb-2">
            <LayoutDashboard size={18} className="tw:text-zinc-500" />
            <h2 className="tw:text-xl tw:font-semibold tw:text-white">
              {user?.name ? `Welcome back${user.name ? `, ${user.name.split(" ")[0]}` : ""}` : "Dashboard"}
            </h2>
          </div>
          <p className="tw:text-zinc-500 tw:text-sm">Your Amazon commerce control tower. Each module opens a focused analytics workspace.</p>
        </div>
      </div>

      {/* Brand Health Score widget */}
      <div className="tw:grid tw:grid-cols-1 md:tw:grid-cols-3 tw:gap-4">
        <BrandHealthScore />
        <div className="md:tw:col-span-2 tw:rounded-2xl tw:border tw:border-white/[0.07] tw:bg-zinc-900 tw:p-5 tw:flex tw:flex-col tw:justify-center">
          <p className="tw:text-xs tw:uppercase tw:tracking-widest tw:text-zinc-600 tw:mb-3">Quick Actions</p>
          <div className="tw:grid tw:grid-cols-2 sm:tw:grid-cols-4 tw:gap-3">
            {[
              { href: "/reports/alerts", label: "Check Alerts", emoji: "🔔" },
              { href: "/reports/budget-optimizer", label: "Optimize Budget", emoji: "🎯" },
              { href: "/reports/pnl", label: "View P&L", emoji: "💰" },
              { href: "/reports/callouts", label: "AI Insights", emoji: "✨" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="tw:flex tw:flex-col tw:items-center tw:gap-2 tw:p-3 tw:rounded-xl tw:border tw:border-white/[0.06] tw:bg-white/[0.02] hover:tw:bg-white/[0.05] hover:tw:border-white/15 tw:transition-all tw:text-center"
              >
                <span className="tw:text-xl">{item.emoji}</span>
                <span className="tw:text-xs tw:text-zinc-400 tw:font-medium">{item.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* New features highlight */}
      {newCards.length > 0 && (
        <div>
          <div className="tw:flex tw:items-center tw:gap-2 tw:mb-3">
            <span className="tw:text-xs tw:font-semibold tw:uppercase tw:tracking-widest tw:text-cyan-500">New Features</span>
            <div className="tw:flex-1 tw:h-px tw:bg-cyan-500/20" />
          </div>
          <div className="tw:grid tw:grid-cols-1 sm:tw:grid-cols-2 xl:tw:grid-cols-4 tw:gap-4">
            {newCards.map((card) => (
              <DashboardCard
                key={card.href}
                {...card}
                stats={getStats(card)}
                isLoading={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Core modules */}
      <div>
        <div className="tw:flex tw:items-center tw:gap-2 tw:mb-3">
          <span className="tw:text-xs tw:font-semibold tw:uppercase tw:tracking-widest tw:text-zinc-600">Modules</span>
          <div className="tw:flex-1 tw:h-px tw:bg-white/[0.06]" />
        </div>
        <div className="tw:grid tw:grid-cols-1 sm:tw:grid-cols-2 xl:tw:grid-cols-3 tw:gap-4">
          {existingCards.map((card) => (
            <DashboardCard
              key={card.href}
              {...card}
              stats={getStats(card)}
              isLoading={card.type === "campaign" ? isLoading : false}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
