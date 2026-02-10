import { getSellerConfig } from "../../../lib/amazon/config.js";
import { getSellerKpis } from "../../../lib/amazon/sellerClient.js";

/**
 * GET /api/amazon/seller
 * Status and connection check for Seller Central (SP-API).
 */
export async function GET(request) {
  const config = getSellerConfig();
  if (!config.configured) {
    return Response.json({
      status: "not_configured",
      service: "amazon-seller-central",
      message: "Set AMAZON_SELLER_CLIENT_ID, AMAZON_SELLER_CLIENT_SECRET, AMAZON_SELLER_REFRESH_TOKEN to connect.",
      requiredEnv: ["AMAZON_SELLER_CLIENT_ID", "AMAZON_SELLER_CLIENT_SECRET", "AMAZON_SELLER_REFRESH_TOKEN"],
    });
  }
  try {
    const kpis = await getSellerKpis();
    if (kpis.source === "api_error") {
      return Response.json({
        status: "error",
        service: "amazon-seller-central",
        configured: true,
        error: kpis.error,
        sample: true,
      });
    }
    return Response.json({
      status: "connected",
      service: "amazon-seller-central",
      configured: true,
      kpis: kpis.source === "api" ? kpis.data : undefined,
      sample: kpis.source === "sample",
    });
  } catch (err) {
    return Response.json({
      status: "error",
      service: "amazon-seller-central",
      configured: true,
      error: err.message,
    }, { status: 502 });
  }
}
