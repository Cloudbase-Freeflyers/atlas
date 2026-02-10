import { getAdsConfig } from "../../../../lib/amazon/config.js";
import { listCampaigns } from "../../../../lib/amazon/adsClient.js";
import { adsMetrics, adsSeries } from "../../../../lib/sampleData.js";

/**
 * GET /api/amazon/ads/overview
 * Returns ads overview metrics and series for Ads Overview report.
 * Uses Amazon Advertising API when configured; otherwise sample data.
 */
export async function GET() {
  const config = getAdsConfig();
  if (!config.configured) {
    return Response.json({
      source: "sample",
      data: { metrics: adsMetrics, series: adsSeries },
    });
  }
  try {
    const payload = await listCampaigns({ count: 100 });
    const campaigns = Array.isArray(payload) ? payload : payload.campaigns || [];
    const metrics = [
      { label: "Total Campaigns", value: String(campaigns.length) },
      { label: "Active", value: String(campaigns.filter((c) => c.state === "enabled").length) },
      ...adsMetrics.slice(0, 8),
    ];
    return Response.json({
      source: "api",
      data: { metrics, series: adsSeries, campaignCount: campaigns.length },
    });
  } catch (err) {
    return Response.json({
      source: "sample",
      error: err.message,
      data: { metrics: adsMetrics, series: adsSeries },
    });
  }
}
