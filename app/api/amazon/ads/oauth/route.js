import { getAdsConfig } from "../../../../lib/amazon/config.js";

const LWA_TOKEN_URL = "https://api.amazon.com/auth/o2/token";

/**
 * POST /api/amazon/ads/oauth
 * Exchange Ads authorization code for access + refresh token.
 * Body: { code: string, redirectUri: string }
 */
export async function POST(request) {
  const config = getAdsConfig();
  const { code, redirectUri } = await request.json().catch(() => ({}));

  if (!config.clientId || !config.clientSecret) {
    return Response.json(
      {
        error: "Missing Ads client credentials",
        message: "Set AMAZON_ADS_CLIENT_ID/SECRET (or AMAZON_CLIENT_ID/SECRET).",
      },
      { status: 400 }
    );
  }

  if (!code || !redirectUri) {
    return Response.json(
      {
        error: "Missing parameters",
        message: "Provide both code and redirectUri.",
      },
      { status: 400 }
    );
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: redirectUri,
  });

  try {
    const res = await fetch(LWA_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
    const text = await res.text();
    if (!res.ok) {
      return Response.json(
        {
          error: `LWA token exchange failed (${res.status})`,
          details: text,
        },
        { status: 502 }
      );
    }
    const data = JSON.parse(text);
    return Response.json({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      token_type: data.token_type,
    });
  } catch (err) {
    return Response.json(
      {
        error: "Token exchange error",
        details: err.message,
      },
      { status: 502 }
    );
  }
}
