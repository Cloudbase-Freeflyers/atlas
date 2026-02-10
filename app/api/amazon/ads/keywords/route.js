import { getAdsConfig } from "../../../../lib/amazon/config.js";
import { listKeywords, normalizeKeywordsForUi } from "../../../../lib/amazon/adsClient.js";
import { keywordRows } from "../../../../lib/sampleData.js";

/**
 * GET /api/amazon/ads/keywords
 * Returns keywords/targets for Keywords & Search Terms report.
 * Uses Amazon Advertising API when configured; otherwise sample data.
 */
export async function GET(request) {
  const config = getAdsConfig();
  if (!config.configured) {
    return Response.json({
      source: "sample",
      data: { rows: keywordRows },
    });
  }
  try {
    const payload = await listKeywords({ count: 500 });
    const raw = Array.isArray(payload) ? payload : payload.keywords || [];
    const rows = normalizeKeywordsForUi(raw);
    return Response.json({
      source: "api",
      data: { rows, raw },
    });
  } catch (err) {
    return Response.json({
      source: "sample",
      error: err.message,
      data: { rows: keywordRows },
    });
  }
}
