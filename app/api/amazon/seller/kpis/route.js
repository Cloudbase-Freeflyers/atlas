import { getSellerConfig } from "../../../../lib/amazon/config.js";
import { getSellerKpis } from "../../../../lib/amazon/sellerClient.js";
import { kpiMetrics } from "../../../../lib/sampleData.js";

/**
 * GET /api/amazon/seller/kpis
 * Returns KPIs for Overall KPIs and Seller Central reports.
 * Uses live SP-API when configured; otherwise returns sample data.
 */
export async function GET() {
  const config = getSellerConfig();
  if (!config.configured) {
    return Response.json({
      source: "sample",
      data: { metrics: kpiMetrics },
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
