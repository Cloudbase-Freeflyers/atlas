/**
 * Amazon Advertising API client.
 * Campaigns, keywords, and metrics — used to power Ads Overview, Campaigns, Keywords reports.
 * @see https://advertising.amazon.com/API/docs
 */

import { getAdsAccessToken } from "./auth.js";
import {
  getAdsConfig,
  getAdsApiBase,
} from "./config.js";

/**
 * Call Amazon Advertising API with LWA token (requires profileId for scope).
 * @param {string} path - e.g. /sp/campaigns
 * @param {RequestInit} [options]
 * @returns {Promise<Response>}
 */
async function adsApiRequest(path, options = {}) {
  const config = getAdsConfig();
  if (!config.configured) {
    throw new Error("Amazon Ads is not configured. Set AMAZON_ADS_* env vars.");
  }
  const token = await getAdsAccessToken({
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    refreshToken: config.refreshToken,
  });
  const base = getAdsApiBase(config.region);
  const url = `${base}${path}`;
  const headers = {
    Authorization: `Bearer ${token.access_token}`,
    "Amazon-Advertising-API-ClientId": config.clientId,
    "Amazon-Advertising-API-Scope": config.profileId,
    "Content-Type": "application/json",
    ...options.headers,
  };
  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Call Amazon Advertising API without profile scope (for endpoints that don't require it, e.g. GET /v2/profiles).
 * Requires only clientId, clientSecret, refreshToken (profileId not needed).
 */
async function adsApiRequestNoScope(path, options = {}) {
  const config = getAdsConfig();
  if (!config.clientId || !config.clientSecret || !config.refreshToken) {
    throw new Error("Amazon Ads credentials required: AMAZON_ADS_CLIENT_ID, AMAZON_ADS_CLIENT_SECRET, AMAZON_ADS_REFRESH_TOKEN.");
  }
  const token = await getAdsAccessToken({
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    refreshToken: config.refreshToken,
  });
  const base = getAdsApiBase(config.region);
  const url = `${base}${path}`;
  const headers = {
    Authorization: `Bearer ${token.access_token}`,
    "Amazon-Advertising-API-ClientId": config.clientId,
    "Content-Type": "application/json",
    ...options.headers,
  };
  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * List advertiser profiles. Does not require AMAZON_ADS_PROFILE_ID.
 * Use this to discover profile IDs to set in AMAZON_ADS_PROFILE_ID.
 * @see https://advertising.amazon.com/API/docs/en-us/guides/account-management/authorization/profiles
 */
export async function listProfiles() {
  const res = await adsApiRequestNoScope("/v2/profiles");
  if (!res.ok) {
    const err = await res.text();
    if (res.status === 401) {
      throw new Error(
        `Ads API listProfiles failed (401 Unauthorized). The refresh token must be from Amazon Advertising API authorization, not Seller Central. ` +
          `Authorize your app for Advertising at advertising.amazon.com (or the Ads API onboarding flow) to get an Ads refresh token, then set AMAZON_ADS_REFRESH_TOKEN. Raw: ${err}`
      );
    }
    throw new Error(`Ads API listProfiles failed (${res.status}): ${err}`);
  }
  return res.json();
}

/**
 * List Sponsored Products campaigns.
 * @param {{ count?: number, startIndex?: number, stateFilter?: string }} [params]
 */
export async function listCampaigns(params = {}) {
  const q = new URLSearchParams();
  if (params.count != null) q.set("count", String(params.count));
  if (params.startIndex != null) q.set("startIndex", String(params.startIndex));
  if (params.stateFilter) q.set("stateFilter", params.stateFilter);
  const query = q.toString();
  const path = `/sp/campaigns${query ? `?${query}` : ""}`;
  const res = await adsApiRequest(path);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Ads API listCampaigns failed (${res.status}): ${err}`);
  }
  return res.json();
}

/**
 * List Sponsored Products ad groups (optional, for hierarchy).
 */
export async function listAdGroups(params = {}) {
  const q = new URLSearchParams();
  if (params.campaignIdFilter) q.set("campaignIdFilter", params.campaignIdFilter);
  if (params.count != null) q.set("count", String(params.count));
  const query = q.toString();
  const path = `/sp/adGroups${query ? `?${query}` : ""}`;
  const res = await adsApiRequest(path);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Ads API listAdGroups failed (${res.status}): ${err}`);
  }
  return res.json();
}

/**
 * List Sponsored Products keywords.
 * @param {{ campaignIdFilter?: string, adGroupIdFilter?: string, count?: number, startIndex?: number }} [params]
 */
export async function listKeywords(params = {}) {
  const q = new URLSearchParams();
  if (params.campaignIdFilter) q.set("campaignIdFilter", params.campaignIdFilter);
  if (params.adGroupIdFilter) q.set("adGroupIdFilter", params.adGroupIdFilter);
  if (params.count != null) q.set("count", String(params.count));
  if (params.startIndex != null) q.set("startIndex", String(params.startIndex));
  const query = q.toString();
  const path = `/sp/keywords${query ? `?${query}` : ""}`;
  const res = await adsApiRequest(path);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Ads API listKeywords failed (${res.status}): ${err}`);
  }
  return res.json();
}

/**
 * Request a Sponsored Products campaign report (metrics: impressions, clicks, cost, sales, etc.).
 * Report is async: create report, poll until ready, then get document URL.
 * @param {{ recordType: string, reportDate: string, metrics?: string }} [params]
 */
export async function createCampaignReport(params = {}) {
  const reportDate = params.reportDate || new Date().toISOString().slice(0, 10);
  const body = {
    recordType: params.recordType || "campaigns",
    reportDate,
    metrics: params.metrics || "impressions,clicks,cost,sales,orders",
  };
  const res = await adsApiRequest("/reporting/reports", {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Ads API createCampaignReport failed (${res.status}): ${err}`);
  }
  return res.json();
}

/**
 * Get report status.
 * @param {string} reportId
 */
export async function getReportStatus(reportId) {
  const res = await adsApiRequest(`/reporting/reports/${reportId}`);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Ads API getReportStatus failed (${res.status}): ${err}`);
  }
  return res.json();
}

/**
 * Update daily budgets for Sponsored Products campaigns.
 * Fetches all active SP campaigns, matches by name to recommendations, then PUTs updates.
 * @param {Array<{ campaignName: string, recommendedBudget: number }>} recommendations
 * @returns {Promise<Array<{ campaignName: string, dailyBudget: number }>>}
 */
export async function updateSpCampaignBudgets(recommendations) {
  // Fetch current campaigns to get their IDs
  const listRes = await adsApiRequest("/sp/campaigns?stateFilter=enabled&count=200");
  if (!listRes.ok) {
    const err = await listRes.text();
    throw new Error(`Failed to list campaigns (${listRes.status}): ${err}`);
  }
  const { campaigns: liveCampaigns = [] } = await listRes.json();

  // Build name → id map (case-insensitive)
  const nameToId = {};
  for (const c of liveCampaigns) {
    nameToId[(c.name ?? "").toLowerCase()] = c.campaignId;
  }

  // Build update payload — only for campaigns we can match
  const updates = [];
  const applied = [];
  for (const rec of recommendations) {
    const id = nameToId[(rec.campaignName ?? "").toLowerCase()];
    if (id) {
      updates.push({ campaignId: id, dailyBudget: rec.recommendedBudget });
      applied.push({ campaignName: rec.campaignName, dailyBudget: rec.recommendedBudget });
    }
  }

  if (!updates.length) {
    throw new Error("No campaign name matches found in the Amazon Ads account. Ensure campaign names match exactly.");
  }

  const putRes = await adsApiRequest("/sp/campaigns", {
    method: "PUT",
    body: JSON.stringify(updates),
  });
  if (!putRes.ok) {
    const err = await putRes.text();
    throw new Error(`Failed to update campaign budgets (${putRes.status}): ${err}`);
  }

  return applied;
}

/**
 * Normalize Ads API campaigns list to app's campaignRows shape.
 * @param {Array<{ campaignId: string, name: string, state: string }>} campaigns
 * @param {Record<string, { spend?: number, sales?: number, impressions?: number, clicks?: number, orders?: number }>} [metricsByCampaign]
 */
export function normalizeCampaignsForUi(campaigns, metricsByCampaign = {}) {
  return (campaigns || []).map((c, i) => {
    const m = metricsByCampaign[c.campaignId] || {};
    return {
      id: i + 1,
      name: c.name || c.campaignId,
      spend: m.spend != null ? `$${Number(m.spend).toFixed(2)}` : "—",
      impressions: m.impressions != null ? String(m.impressions) : "—",
      clicks: m.clicks != null ? String(m.clicks) : "—",
      orders: m.orders != null ? String(m.orders) : "—",
      sales: m.sales != null ? `$${Number(m.sales).toFixed(2)}` : "—",
      conversion: m.clicks ? `${(((m.orders || 0) / m.clicks) * 100).toFixed(2)}%` : "—",
      roas: m.spend && m.sales ? (m.sales / m.spend).toFixed(2) : "—",
      ctr: m.impressions && m.clicks ? `${((m.clicks / m.impressions) * 100).toFixed(2)}%` : "—",
      acos: m.sales && m.spend ? `${((m.spend / m.sales) * 100).toFixed(2)}%` : "—",
    };
  });
}

/**
 * Normalize Ads API keywords/targets to app's keywordRows shape.
 */
export function normalizeKeywordsForUi(keywords, metricsByKeyword = {}) {
  return (keywords || []).map((k, i) => {
    const m = metricsByKeyword[k.keywordId || k.targetId] || {};
    return {
      id: i + 1,
      term: k.keywordText || k.expression || "—",
      match: (k.matchType || "BROAD").toUpperCase(),
      spend: m.cost != null ? `$${Number(m.cost).toFixed(2)}` : "—",
      clicks: m.clicks != null ? String(m.clicks) : "—",
      orders: m.orders != null ? String(m.orders) : "—",
      sales: m.sales != null ? `$${Number(m.sales).toFixed(2)}` : "—",
      conversion: m.clicks ? `${(((m.orders || 0) / m.clicks) * 100).toFixed(2)}%` : "0%",
      roas: m.cost && m.sales ? (m.sales / m.cost).toFixed(1) : "0",
      ctr: m.impressions && m.clicks ? `${((m.clicks / m.impressions) * 100).toFixed(2)}%` : "—",
    };
  });
}
