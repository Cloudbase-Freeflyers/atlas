import { getAdsConfig } from "../../../../lib/amazon/config.js";
import { listProfiles } from "../../../../lib/amazon/adsClient.js";

/**
 * GET /api/amazon/ads/profiles
 * Returns the list of advertising profiles (advertiser accounts) for the authenticated Ads user.
 * Use this to discover profile IDs to set as AMAZON_ADS_PROFILE_ID in .env.
 * Requires: AMAZON_ADS_CLIENT_ID, AMAZON_ADS_CLIENT_SECRET, AMAZON_ADS_REFRESH_TOKEN (profile ID not required).
 */
export async function GET() {
  const config = getAdsConfig();
  if (!config.clientId || !config.clientSecret || !config.refreshToken) {
    return Response.json(
      {
        error: "Missing Ads credentials",
        message: "Set AMAZON_ADS_CLIENT_ID, AMAZON_ADS_CLIENT_SECRET, and AMAZON_ADS_REFRESH_TOKEN to list profiles.",
        requiredEnv: ["AMAZON_ADS_CLIENT_ID", "AMAZON_ADS_CLIENT_SECRET", "AMAZON_ADS_REFRESH_TOKEN"],
      },
      { status: 400 }
    );
  }
  try {
    const profiles = await listProfiles();
    const list = Array.isArray(profiles) ? profiles : [];
    return Response.json({
      profiles: list.map((p) => ({
        profileId: p.profileId,
        countryCode: p.countryCode,
        currencyCode: p.currencyCode,
        timezone: p.timezone,
        accountInfo: p.accountInfo
          ? {
              marketplaceStringId: p.accountInfo.marketplaceStringId,
              id: p.accountInfo.id,
              type: p.accountInfo.type,
              name: p.accountInfo.name,
              validPaymentMethod: p.accountInfo.validPaymentMethod,
            }
          : null,
      })),
      count: list.length,
    });
  } catch (err) {
    const is401 = err.message.includes("(401)");
    return Response.json(
      {
        error: err.message,
        hint: is401
          ? "Use a refresh token from Amazon Advertising API authorization (not Seller Central). See AMAZON_API.md for how to get an Ads refresh token."
          : undefined,
      },
      { status: is401 ? 401 : 502 }
    );
  }
}
