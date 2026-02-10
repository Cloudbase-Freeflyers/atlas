/**
 * Login with Amazon (LWA) token exchange.
 * Used by both SP-API (Seller Central) and Amazon Advertising API.
 * @see https://developer-docs.amazon.com/sp-api/docs/connecting-to-the-selling-partner-api
 * @see https://advertising.amazon.com/API/docs/en-us/get-started/developer-notes
 */

const LWA_TOKEN_URL = "https://api.amazon.com/auth/o2/token";

/**
 * Exchange LWA refresh token for access token (Seller Central / SP-API).
 * @param {{ clientId: string, clientSecret: string, refreshToken: string }} opts
 * @returns {Promise<{ access_token: string, expires_in: number }>}
 */
export async function getSellerAccessToken(opts) {
  const { clientId, clientSecret, refreshToken } = opts;
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Missing LWA credentials: clientId, clientSecret, refreshToken");
  }
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
  });
  const res = await fetch(LWA_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LWA token failed (${res.status}): ${text}`);
  }
  return res.json();
}

/**
 * Exchange LWA refresh token for access token (Amazon Advertising API).
 * Same endpoint; Ads API uses the same LWA credentials flow.
 * @param {{ clientId: string, clientSecret: string, refreshToken: string }} opts
 * @returns {Promise<{ access_token: string, expires_in: number }>}
 */
export async function getAdsAccessToken(opts) {
  return getSellerAccessToken(opts);
}
