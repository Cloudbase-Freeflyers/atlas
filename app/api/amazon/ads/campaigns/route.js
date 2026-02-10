import { getAdsConfig } from "../../../../lib/amazon/config.js";
import { listCampaigns, normalizeCampaignsForUi } from "../../../../lib/amazon/adsClient.js";
import { campaignRows } from "../../../../lib/sampleData.js";

/**
 * GET /api/amazon/ads/campaigns
 * Returns campaigns list for Campaigns report.
 * Uses Amazon Advertising API when configured; otherwise sample data.
 */
export async function GET(request) {
  const config = getAdsConfig();
  if (!config.configured) {
    return Response.json({
      source: "sample",
      data: { rows: campaignRows },
    });
  }
  try {
    const payload = await listCampaigns({ count: 100 });
    const raw = Array.isArray(payload) ? payload : payload.campaigns || [];
    const rows = normalizeCampaignsForUi(raw);
    return Response.json({
      source: "api",
      data: { rows, raw },
    });
  } catch (err) {
    return Response.json({
      source: "sample",
      error: err.message,
      data: { rows: campaignRows },
    });
  }
}
