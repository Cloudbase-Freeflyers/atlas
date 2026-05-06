import { NextResponse } from "next/server";
import { updateSpCampaignBudgets } from "../../../lib/amazon/adsClient.js";
import { getAdsConfig } from "../../../lib/amazon/config.js";

/**
 * POST /api/budget-optimizer/apply
 * Applies AI-recommended daily budgets to Amazon Advertising SP campaigns.
 * Falls back to a simulated response when Amazon Ads API is not configured.
 */
export async function POST(req) {
  const { recommendations } = await req.json();

  if (!recommendations?.length) {
    return NextResponse.json({ error: "No recommendations provided" }, { status: 400 });
  }

  const config = getAdsConfig();

  // --- Simulated path (no Amazon Ads creds) ---
  if (!config.configured) {
    const applied = recommendations.map((r) => ({
      campaignName: r.campaignName,
      dailyBudget: r.recommendedBudget,
    }));
    return NextResponse.json({ simulated: true, applied });
  }

  // --- Live path: match by name against Ads API, then update ---
  try {
    const result = await updateSpCampaignBudgets(recommendations);
    return NextResponse.json({ simulated: false, applied: result });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}
