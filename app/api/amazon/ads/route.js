import { getAdsConfig } from "../../../lib/amazon/config.js";
import { getAdsAccessToken } from "../../../lib/amazon/auth.js";

/**
 * GET /api/amazon/ads
 * Status and connection check for Amazon Advertising API.
 */
export async function GET() {
  const config = getAdsConfig();
  if (!config.configured) {
    return Response.json({
      status: "not_configured",
      service: "amazon-advertising",
      message: "Set AMAZON_ADS_CLIENT_ID, AMAZON_ADS_CLIENT_SECRET, AMAZON_ADS_REFRESH_TOKEN, AMAZON_ADS_PROFILE_ID to connect.",
      requiredEnv: ["AMAZON_ADS_CLIENT_ID", "AMAZON_ADS_CLIENT_SECRET", "AMAZON_ADS_REFRESH_TOKEN", "AMAZON_ADS_PROFILE_ID"],
    });
  }
  try {
    await getAdsAccessToken({
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      refreshToken: config.refreshToken,
    });
    return Response.json({
      status: "connected",
      service: "amazon-advertising",
      configured: true,
    });
  } catch (err) {
    return Response.json({
      status: "error",
      service: "amazon-advertising",
      configured: true,
      error: err.message,
    }, { status: 502 });
  }
}
