import { getAdsConfig } from "../../../../lib/amazon/config.js";
import { listCampaigns, normalizeCampaignsForUi } from "../../../../lib/amazon/adsClient.js";
import { campaignRows } from "../../../../lib/sampleData.js";
import createCubeApi from "../../../../lib/cube.js";
import { cookies } from "next/headers";

/**
 * GET /api/amazon/ads/campaigns
 * Returns campaigns list for Campaigns report.
 * Uses Amazon Advertising API when configured; otherwise sample data.
 */
export async function GET(request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value || "";
  const cubeApi = createCubeApi(token);

  const data=await cubeApi
      .load({
          "dimensions": [
              "AdsCampaignReports.campaign_name",
              "AdsCampaignReports.campaign_id",
          ],
          "measures": [
              "AdsCampaignReports.clicks",
              "AdsCampaignReports.cost",
              "AdsCampaignReports.impressions",
              "AdsCampaignReports.cost",
              "AdsCampaignReports.sales14d",
              "AdsCampaignReports.purchases14d",
              "AdsCampaignReports.roas",
              "AdsCampaignReports.ctr",
              "AdsCampaignReports.cpc",
              "AdsCampaignReports.acos",
          ]
      }).then((response) => {
          return response.rawData().map((campaign) => {
              return {
                  name: campaign['AdsCampaignReports.campaign_name'],
                  id: campaign['AdsCampaignReports.campaign_id'],
                  clicks: campaign['AdsCampaignReports.clicks'],
                  impressions: campaign['AdsCampaignReports.impressions'],
                  spend: campaign['AdsCampaignReports.cost'],
                  sales: campaign['AdsCampaignReports.sales14d'],
                  orders: campaign['AdsCampaignReports.purchases14d'],
                  roas: parseFloat(campaign['AdsCampaignReports.roas']),
                  ctr: campaign['AdsCampaignReports.ctr'],
                  acos: parseFloat(campaign['AdsCampaignReports.acos']),
              };
          });
      })
    return Response.json({
        source: "api",
        data: { rows:data, raw:data },
    });
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
