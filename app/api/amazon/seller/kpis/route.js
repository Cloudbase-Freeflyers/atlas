import { getSellerConfig } from "../../../../lib/amazon/config.js";
import { getSellerKpis } from "../../../../lib/amazon/sellerClient.js";
import { kpiMetrics } from "../../../../lib/sampleData.js";
import createCubeApi from "../../../../lib/cube.js";
import { cookies } from "next/headers";

/**
 * GET /api/amazon/seller/kpis
 * Returns KPIs for Overall KPIs and Seller Central reports.
 * Uses live SP-API when configured; otherwise returns sample data.
 */
export async function GET(request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value || "";
  const cubeApi = createCubeApi(token);

  const measures= await cubeApi.load({
    "measures": [
      "SellerOrderReports.sale",
      "SellerOrderReports.unique_order_count"
    ],
    "dimensions": [],
    "filters": []
  }).then(response => {
    const data = response.rawData().map((item) => {
      return [
        { label: "Total Orders", value: item['SellerOrderReports.unique_order_count'] },
        { label: "Total Sales ($)", value: parseFloat(item['SellerOrderReports.sale']).toFixed(2) },
      ]
    });
    return data[0]
  });
  const adsMeasures = await cubeApi.load({
    "measures": [
      "AdsCampaignReports.spend",
      "AdsCampaignReports.purchases14d",
      "AdsCampaignReports.acos",
      "AdsCampaignReports.roas"
    ]
  }).then(response => {
    const data = response.rawData().map((item) => {
      return [
        { label: "Amount Spent ($)", value: parseFloat(item['AdsCampaignReports.spend']).toFixed(2) },
        { label: "Total Ad Orders", value: parseFloat(item['AdsCampaignReports.purchases14d']).toFixed(2) },
        { label: "Total ROAS", value: parseFloat(item['AdsCampaignReports.acos']).toFixed(2) },
        { label: "Total ACOS", value: parseFloat(item['AdsCampaignReports.roas']).toFixed(2) },
      ]
    });
    return data[0]
  });
  return Response.json({
    source: "api",
    data: { metrics: [...measures,...adsMeasures] },
  });

  const config = getSellerConfig();
  if (!config.configured) {
    return Response.json({
      source: "sample",
      data: { metrics: [...measures,...adsMeasures] },
    });
  }
  try {
    const result = await getSellerKpis();
    if (result.source === "api" && result.data) {
      const metrics = [
        { label: "Total Orders", value: String(result.data.totalOrders ?? 0) },
        { label: "Total Sales ($)", value: (result.data.totalSales ?? 0).toFixed(2) },
        { label: "Amount Spent ($)", value: "—" },
        { label: "Total Ad Orders", value: "—" },
        { label: "Total ROAS", value: "—" },
        { label: "Total ACOS", value: "—" },
      ];
      return Response.json({
        source: "api",
        data: { metrics, raw: result.data, sellerOnly: true },
      });
    }
    if (result.source === "api_error") {
      return Response.json({
        source: "sample",
        error: result.error,
        data: { metrics: kpiMetrics },
      });
    }
    return Response.json({
      source: "sample",
      data: { metrics: kpiMetrics },
    });
  } catch (err) {
    return Response.json({
      source: "sample",
      error: err.message,
      data: { metrics: kpiMetrics },
    });
  }
}
