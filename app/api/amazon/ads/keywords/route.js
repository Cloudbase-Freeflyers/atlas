import { getAdsConfig } from "../../../../lib/amazon/config.js";
import { listKeywords, normalizeKeywordsForUi } from "../../../../lib/amazon/adsClient.js";
import { keywordRows } from "../../../../lib/sampleData.js";
import createCubeApi from "../../../../lib/cube.js";
import { cookies } from "next/headers";

/**
 * GET /api/amazon/ads/keywords
 * Returns keywords/targets for Keywords & Search Terms report.
 * Uses Amazon Advertising API when configured; otherwise sample data.
 */
export async function GET(request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value || "";
  const cubeApi = createCubeApi(token);

  const data=await cubeApi.load({
    "dimensions": [
      "AdsKeywordReports.keyword_id",
      "AdsKeywordReports.keyword_text",
      "AdsKeywordReports.match_type"
    ],
    "measures": [
      "AdsKeywordReports.clicks",
      "AdsKeywordReports.cost",
      "AdsKeywordReports.purchases14d",
      "AdsKeywordReports.sales14d",
      "AdsKeywordReports.roas",
      "AdsKeywordReports.ctr",
      "AdsKeywordReports.cpc",
      "AdsKeywordReports.acos",
    ]
  }).then(result => {
    return result.rawData().map(item => {
      return {
        id: item['AdsKeywordReports.keyword_id'],
        term: item['AdsKeywordReports.keyword_text'],
        match: item['AdsKeywordReports.match_type'],
        spend: item['AdsKeywordReports.cost'],
        clicks: item['AdsKeywordReports.clicks'],
        orders: item['AdsKeywordReports.purchases14d'],
        sales: item['AdsKeywordReports.sales14d'],
        // conversion: "0%",
        roas: parseFloat(item['AdsKeywordReports.roas']).toFixed(2) + "%",
        ctr: item['AdsKeywordReports.ctr'],
      }
    });
  });
  return Response.json({
    source: "api",
    data: { rows: data },
  });
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
