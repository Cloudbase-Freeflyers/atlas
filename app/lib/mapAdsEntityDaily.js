/**
 * Daily rows per ads entity (keyword / campaign) from Cube timeDimensions with granularity day.
 */

function safeDateLabel(raw) {
  const d = raw instanceof Date ? raw : new Date(raw);
  return Number.isNaN(d.getTime()) ? String(raw ?? "") : d.toLocaleDateString();
}

export function mapKeywordDailyRow(item) {
  const raw = item["AdsKeywordReports.report_date"];
  const d = raw instanceof Date ? raw : new Date(raw);
  const sortKey = Number.isNaN(d.getTime()) ? 0 : d.getTime();
  return {
    keywordId: item["AdsKeywordReports.keyword_id"],
    keywordText: item["AdsKeywordReports.keyword_text"],
    date: safeDateLabel(raw),
    sortKey,
    spend: item["AdsKeywordReports.cost"],
    sales: item["AdsKeywordReports.sales14d"],
    orders: item["AdsKeywordReports.purchases14d"],
    clicks: item["AdsKeywordReports.clicks"],
    ctr: item["AdsKeywordReports.ctr"],
    cpc: item["AdsKeywordReports.cpc"],
    acos: item["AdsKeywordReports.acos"],
    roas: item["AdsKeywordReports.roas"],
  };
}

export function mapCampaignDailyRow(item) {
  const raw = item["AdsCampaignReports.report_date"];
  const d = raw instanceof Date ? raw : new Date(raw);
  const sortKey = Number.isNaN(d.getTime()) ? 0 : d.getTime();
  return {
    campaignId: item["AdsCampaignReports.campaign_id"],
    campaignName: item["AdsCampaignReports.campaign_name"],
    date: safeDateLabel(raw),
    sortKey,
    spend: item["AdsCampaignReports.cost"],
    sales: item["AdsCampaignReports.sales14d"],
    orders: item["AdsCampaignReports.purchases14d"],
    clicks: item["AdsCampaignReports.clicks"],
    impressions: item["AdsCampaignReports.impressions"],
    ctr: item["AdsCampaignReports.ctr"],
    cpc: item["AdsCampaignReports.cpc"],
    acos: item["AdsCampaignReports.acos"],
    roas: item["AdsCampaignReports.roas"],
  };
}
