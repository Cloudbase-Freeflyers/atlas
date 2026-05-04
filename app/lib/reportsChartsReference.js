/**
 * Reports UI: which routes render which charts and which Cube sources feed them.
 * Update when adding a chart or changing a query so SSR (cubeReports) and client useData stay aligned.
 *
 * Cube naming vs conceptual model: see `.cursor/skills/atlas-cube-schema-catalog/SKILL.md`
 * (ProductStats ≈ ProductPerformance hub; SellerSalesTrafficReports for sessions; *14d ad measures in UI).
 *
 * Ads (daily AdsCampaignReports via ADS_DAILY_GRAPH_MEASURES + mapAdsCampaignDailyGraphRow):
 * - /reports/overall-kpis — Gauge, Spend vs ad sales, optional volume charts
 * - /reports/ads-overview — CTR/CPC, Spend vs ad sales, ACOS/ROAS, impressions/clicks, spend/orders
 * - /reports/keywords — account-level lines + keyword table; entity LineChart from keywordDaily (Cube + mapKeywordDailyRow)
 * - /reports/campaigns — account-level lines + campaign table; entity LineChart from campaignDaily (mapCampaignDailyRow)
 *
 * Seller PnlDistribution (daily, sellercenteroverview key):
 * - /reports/seller-central — Area P&L, Units organic vs PPC, Line ad sales vs organic sales
 * - /reports/seller-central/sales-distribution — Area + Line ad vs organic sales + product table
 * - /reports/seller-central/units — Line units
 *
 * Seller other:
 * - /reports/seller-central/sessions — SellerSalesTrafficReports (sessions, unit session %, page views)
 * - /reports/seller-central/ppc — PnlDistribution adCost vs totalSales
 *
 * Placeholders (no Cube time series): sales-trend, inventory-forecast/*, most product-details/*
 */

export const REPORTS_CHARTS_REFERENCE_VERSION = 2;
