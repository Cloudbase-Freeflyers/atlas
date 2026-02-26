import { getAdsConfig } from "../../../../lib/amazon/config.js";
import { listCampaigns } from "../../../../lib/amazon/adsClient.js";
import { adsMetrics, adsSeries } from "../../../../lib/sampleData.js";
import cubeApi from "../../../../lib/cube.js";

/**
 * GET /api/amazon/ads/overview
 * Returns ads overview metrics and series for Ads Overview report.
 * Uses Amazon Advertising API when configured; otherwise sample data.
 */
export async function GET() {
  const matrices=await cubeApi.load({
    "measures": [
      "AdsCampaignReports.sales",
      "AdsCampaignReports.spend",
      "AdsCampaignReports.purchases14d",
      "AdsCampaignReports.acos",
      "AdsCampaignReports.roas",
      "AdsCampaignReports.impressions",
      "AdsCampaignReports.clicks",
      "AdsCampaignReports.cpc",
      "AdsCampaignReports.ctr"
  ]
  }).then(response => {
    const data=response.rawData().map(item=> [
      {
        label: "Total Ad Sales",
        value:parseFloat(item['AdsCampaignReports.sales']).toFixed(2),
      }, {
        label: "Amount Spent",
        value:parseFloat(item['AdsCampaignReports.spend']).toFixed(2),
      }, {
        label: "Total Ad Orders",
        value:item['AdsCampaignReports.purchases14d']
      },{
        label: "ACOS",
        value:parseFloat(item['AdsCampaignReports.acos']).toFixed(2)+'%',
      }, {
        label:"ROAS",
        value:parseFloat(item['AdsCampaignReports.roas']).toFixed(2)+'%',
      },{
        label: "Impressions",
        value:item['AdsCampaignReports.impressions']
      },{
        label: "Clicks",
        value:item['AdsCampaignReports.clicks']
      },{
        label: "CPC",value:parseFloat(item['AdsCampaignReports.cpc']).toFixed(2),
      },{
        label: "CTR",value:parseFloat(item['AdsCampaignReports.ctr']).toFixed(2),
      },{label: "Conversion Rate",value:'-'
      }

    ])
    return data[0]
  })
  console.log(matrices)
  return Response.json({
    source: "api",
    data: { metrics: matrices, },
  });
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
