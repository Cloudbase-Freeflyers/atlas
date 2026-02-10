/**
 * Amazon API configuration from environment.
 * All credentials are optional; when missing, app uses sample data.
 *
 * Single-key (sandbox) mode: you can use one LWA app for everything.
 * Set AMAZON_CLIENT_ID, AMAZON_CLIENT_SECRET, and AMAZON_REFRESH_TOKEN
 * (Seller Central refresh token from your sandbox app). Seller Central
 * will use these; Ads can reuse the same client id/secret when you add
 * AMAZON_ADS_REFRESH_TOKEN and AMAZON_ADS_PROFILE_ID later.
 */

function trim(s) {
  return typeof s === "string" ? s.trim() : s;
}

export function getSellerConfig() {
  const clientId = trim(process.env.AMAZON_SELLER_CLIENT_ID || process.env.AMAZON_CLIENT_ID);
  const clientSecret = trim(process.env.AMAZON_SELLER_CLIENT_SECRET || process.env.AMAZON_CLIENT_SECRET);
  const refreshToken = trim(process.env.AMAZON_SELLER_REFRESH_TOKEN || process.env.AMAZON_REFRESH_TOKEN);
  const marketplaceId = process.env.AMAZON_SELLER_MARKETPLACE_ID || "ATVPDKIKX0DER"; // US
  const region = process.env.AMAZON_SELLER_REGION || "na"; // na, eu, fe
  const sandbox = process.env.AMAZON_SELLER_SANDBOX === "true" || process.env.AMAZON_SANDBOX === "true";
  const configured = !!(clientId && clientSecret && refreshToken);
  return {
    configured,
    clientId,
    clientSecret,
    refreshToken,
    marketplaceId,
    region,
    sandbox,
  };
}

export function getAdsConfig() {
  const clientId = trim(process.env.AMAZON_ADS_CLIENT_ID || process.env.AMAZON_CLIENT_ID);
  const clientSecret = trim(process.env.AMAZON_ADS_CLIENT_SECRET || process.env.AMAZON_CLIENT_SECRET);
  const refreshToken = trim(process.env.AMAZON_ADS_REFRESH_TOKEN);
  const profileId = trim(process.env.AMAZON_ADS_PROFILE_ID);
  const region = process.env.AMAZON_ADS_REGION || "na"; // na, eu, fe
  const configured = !!(clientId && clientSecret && refreshToken && profileId);
  return {
    configured,
    clientId,
    clientSecret,
    refreshToken,
    profileId,
    region,
  };
}

const SP_API_BASE = {
  na: "https://sellingpartnerapi-na.amazon.com",
  eu: "https://sellingpartnerapi-eu.amazon.com",
  fe: "https://sellingpartnerapi-fe.amazon.com",
};

const SP_API_SANDBOX_BASE = {
  na: "https://sandbox.sellingpartnerapi-na.amazon.com",
  eu: "https://sandbox.sellingpartnerapi-eu.amazon.com",
  fe: "https://sandbox.sellingpartnerapi-fe.amazon.com",
};

const ADS_API_BASE = {
  na: "https://advertising-api.amazon.com",
  eu: "https://advertising-api-eu.amazon.com",
  fe: "https://advertising-api-fe.amazon.com",
};

export function getSellerApiBase(region = "na", sandbox = false) {
  if (sandbox) {
    return SP_API_SANDBOX_BASE[region] || SP_API_SANDBOX_BASE.na;
  }
  return SP_API_BASE[region] || SP_API_BASE.na;
}

export function getAdsApiBase(region = "na") {
  return ADS_API_BASE[region] || ADS_API_BASE.na;
}
