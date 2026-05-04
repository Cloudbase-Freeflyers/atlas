/**
 * Daily AdsCampaignReports (Amazon ads) series from Cube.
 *
 * Query `measures` should include these members (plus `AdsCampaignReports.report_date`
 * as dimension or time dimension) so each row maps cleanly for line charts:
 *
 * - spend — ad spend ($)
 * - sales — ad-attributed sales ($), same as “Total Ad Sales” in metrics
 * - purchases14d — orders attributed within 14d window
 * - impressions, clicks — volume
 * - ctr — click-through rate (0–100 style; axis uses percent formatter)
 * - cpc — cost per click ($)
 * - acos, roas — efficiency (axis uses percent formatter in this app)
 */
export const ADS_DAILY_GRAPH_MEASURES = [
  "AdsCampaignReports.spend",
  "AdsCampaignReports.sales",
  "AdsCampaignReports.purchases14d",
  "AdsCampaignReports.impressions",
  "AdsCampaignReports.clicks",
  "AdsCampaignReports.acos",
  "AdsCampaignReports.roas",
  "AdsCampaignReports.ctr",
  "AdsCampaignReports.cpc",
];

export function mapAdsCampaignDailyGraphRow(item) {
  const raw = item["AdsCampaignReports.report_date"];
  const date =
    raw instanceof Date ? raw : new Date(raw);
  return {
    date: Number.isNaN(date.getTime())
      ? String(raw ?? "")
      : date.toLocaleDateString(),
    spend: item["AdsCampaignReports.spend"],
    sales: item["AdsCampaignReports.sales"],
    purchases14d: item["AdsCampaignReports.purchases14d"],
    impressions: item["AdsCampaignReports.impressions"],
    clicks: item["AdsCampaignReports.clicks"],
    ctr: item["AdsCampaignReports.ctr"],
    cpc: item["AdsCampaignReports.cpc"],
    roas: item["AdsCampaignReports.roas"],
    acos: item["AdsCampaignReports.acos"],
  };
}
