import { pickAdAttributedSales } from "./calloutMetrics.js";

function num(v) {
  if (v == null || Number.isNaN(Number(v))) return null;
  return Number(v);
}

function pctDelta(cur, prev) {
  const c = num(cur);
  const p = num(prev);
  if (c == null || p == null || p === 0) return null;
  return ((c - p) / Math.abs(p)) * 100;
}

function rowSummary(label, curVal, prevVal, format = "number") {
  const d = pctDelta(curVal, prevVal);
  const dStr =
    d == null ? "n/a" : `${d >= 0 ? "+" : ""}${d.toFixed(1)}% vs prior window`;
  let curFmt = curVal == null ? "n/a" : String(curVal);
  if (format === "currency" && curVal != null) {
    curFmt = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(Number(curVal));
  }
  return `- ${label}: current ${curFmt}; prior period ${prevVal == null ? "n/a" : prevVal}; change ${dStr}`;
}

/**
 * Human-readable block for the model (Cube row keys preserved for transparency).
 */
export function buildCalloutUserPrompt({ companyName, bundle, mode = "snapshot" }) {
  const lines = [
    `Account: ${companyName}`,
    `Analysis window: ${bundle.current.start} → ${bundle.current.end} (${bundle.periodDays} day(s)).`,
    `Comparison window (equal length, immediately before): ${bundle.previous.start} → ${bundle.previous.end}.`,
    "",
    "Rules: Only infer from the numbers below. If a metric is missing or Cube failed, say so briefly and avoid inventing figures.",
    "",
  ];

  const errMsg =
    bundle.errors?.length
      ? bundle.errors.join("; ")
      : bundle.error;
  if (errMsg) {
    lines.push(
      `Data note: ${!bundle.ok ? "Cube data is incomplete. " : ""}Some queries failed (${errMsg}). Use only metrics that appear below; acknowledge gaps briefly.`,
      ""
    );
  }

  const aC = bundle.adsCurrent || {};
  const aP = bundle.adsPrevious || {};
  const pC = bundle.pnlCurrent || {};
  const pP = bundle.pnlPrevious || {};

  lines.push(
    "Advertising (AdsCampaignReports):",
    rowSummary(
      "Spend",
      aC["AdsCampaignReports.spend"],
      aP["AdsCampaignReports.spend"],
      "currency"
    ),
    rowSummary(
      "Ad-attributed sales (sales or sales14d)",
      pickAdAttributedSales(aC),
      pickAdAttributedSales(aP),
      "currency"
    ),
    rowSummary(
      "Ad orders (14d attribution)",
      aC["AdsCampaignReports.purchases14d"],
      aP["AdsCampaignReports.purchases14d"]
    ),
    rowSummary(
      "Impressions",
      aC["AdsCampaignReports.impressions"],
      aP["AdsCampaignReports.impressions"]
    ),
    rowSummary(
      "Clicks",
      aC["AdsCampaignReports.clicks"],
      aP["AdsCampaignReports.clicks"]
    ),
    rowSummary(
      "ACOS (period, spend / ad sales)",
      aC["AdsCampaignReports.acos"],
      aP["AdsCampaignReports.acos"]
    ),
    rowSummary(
      "ROAS (period)",
      aC["AdsCampaignReports.roas"],
      aP["AdsCampaignReports.roas"]
    ),
    rowSummary(
      "CTR (period)",
      aC["AdsCampaignReports.ctr"],
      aP["AdsCampaignReports.ctr"]
    ),
    rowSummary(
      "CPC (period)",
      aC["AdsCampaignReports.cpc"],
      aP["AdsCampaignReports.cpc"],
      "currency"
    ),
    "",
    "Business / P&L (PnlDistribution):",
    rowSummary(
      "Total sales",
      pC["PnlDistribution.totalSales"],
      pP["PnlDistribution.totalSales"],
      "currency"
    ),
    rowSummary(
      "Ad cost",
      pC["PnlDistribution.adCost"],
      pP["PnlDistribution.adCost"],
      "currency"
    ),
    rowSummary(
      "Ad-attributed sales (P&L)",
      pC["PnlDistribution.adSales"],
      pP["PnlDistribution.adSales"],
      "currency"
    ),
    rowSummary(
      "Organic sales",
      pC["PnlDistribution.organicSales"],
      pP["PnlDistribution.organicSales"],
      "currency"
    ),
    rowSummary(
      "Profit",
      pC["PnlDistribution.profit"],
      pP["PnlDistribution.profit"],
      "currency"
    ),
    rowSummary(
      "Total units",
      pC["PnlDistribution.totalUnits"],
      pP["PnlDistribution.totalUnits"]
    ),
    "",
    taskInstruction(mode)
  );

  return lines.join("\n");
}

function taskInstruction(mode) {
  if (mode === "weekly") {
    return (
      "Task (WEEKLY FULL AUDIT): This is a deeper weekly review. Write a thorough audit-style narrative for an Amazon seller using Atlas (ads + P&L). " +
      "Cover profitability, ad efficiency (ACOS/ROAS/CPC/CTR), volume and mix (orders/units, organic vs ad-attributed sales), and operational risks. " +
      "Be specific and tie conclusions to the numbers; call out contradictions or data gaps. Tone: strategic weekly business review."
    );
  }
  return (
    "Task: Write concise commerce-focused insights for an Amazon seller operating Atlas (ads + seller central data). " +
    "Emphasize profitability, efficiency (ACOS/ROAS/CPC), volume (orders/units), and risks. Keep the executive summary tight for a daily snapshot."
  );
}

export const CALLOUT_SYSTEM_PROMPT = `You are a senior Amazon marketplace analyst helping operators review Atlas dashboard metrics.

Output MUST be a single JSON object with these keys (all strings unless noted):
- "headline": one punchy sentence summarizing the most important finding for the selected window.
- "greeting": one short friendly line suitable for a banner (e.g. daily insight greeting with the date implied by the user message).
- "priority": one of "HIGH", "MEDIUM", "LOW" based on risk/opportunity.
- "executiveSummary": 2–4 sentences combining ads + P&L perspective.
- "bullets": array of 3–6 short bullet strings (actionable observations).
- "scoreboard": array of 4–6 objects, each with:
  - "label": metric name
  - "value": formatted primary number or text for the current window
  - "trend": "up" | "down" | "flat" | "unknown"
  - "context": short comparison vs the prior window (e.g. "up 12% vs prior period")
- "whatMoved": array of strings — factual observations about what changed (neutral tone).
- "shoutOuts": array of strings — positive signals or mitigating context (can be empty).
- "watchOuts": array of strings — risks, regressions, or things to monitor.
- "nextAction": one clear next step string.

Do not fabricate metrics not present in the user message. If data is missing, acknowledge it in "watchOuts" or "whatMoved".`;

/** Deeper narrative for the weekly full-audit run (same JSON shape, richer content). */
export const CALLOUT_WEEKLY_SYSTEM_PROMPT = `You are a senior Amazon marketplace analyst conducting a WEEKLY FULL AUDIT for Atlas (advertising + seller / P&L data).

Output MUST be a single JSON object with the SAME keys as the daily format:
- "headline": one strong summary line for the audit period.
- "greeting": professional weekly audit greeting referencing the period.
- "priority": "HIGH" | "MEDIUM" | "LOW".
- "executiveSummary": 5–8 sentences — full weekly narrative (not a tweet).
- "bullets": array of 8–14 bullet strings — audit findings, prioritized.
- "scoreboard": array of 6–10 objects with label, value, trend, context.
- "whatMoved": array of 6–12 strings — detailed observations of changes vs prior period.
- "shoutOuts": array of 2–6 strings — strengths to preserve.
- "watchOuts": array of 4–10 strings — risks, regressions, follow-ups.
- "nextAction": 2–4 sentences combining the top 2–3 priorities for the coming week.

Rules: Only use metrics from the user message. Mark uncertainty where data is missing.`;

export function getCalloutSystemPrompt(mode) {
  if (mode === "weekly") return CALLOUT_WEEKLY_SYSTEM_PROMPT;
  return CALLOUT_SYSTEM_PROMPT;
}

export function normalizeCalloutPayload(raw) {
  if (!raw || typeof raw !== "object") return null;
  return {
    headline: String(raw.headline ?? "").trim() || "No headline generated.",
    greeting: String(raw.greeting ?? "").trim(),
    priority: ["HIGH", "MEDIUM", "LOW"].includes(raw.priority)
      ? raw.priority
      : "MEDIUM",
    executiveSummary: String(raw.executiveSummary ?? "").trim(),
    bullets: Array.isArray(raw.bullets) ? raw.bullets.map(String) : [],
    scoreboard: Array.isArray(raw.scoreboard)
      ? raw.scoreboard.map((s) => ({
          label: String(s?.label ?? ""),
          value: String(s?.value ?? ""),
          trend: ["up", "down", "flat", "unknown"].includes(s?.trend)
            ? s.trend
            : "unknown",
          context: String(s?.context ?? ""),
        }))
      : [],
    whatMoved: Array.isArray(raw.whatMoved) ? raw.whatMoved.map(String) : [],
    shoutOuts: Array.isArray(raw.shoutOuts) ? raw.shoutOuts.map(String) : [],
    watchOuts: Array.isArray(raw.watchOuts) ? raw.watchOuts.map(String) : [],
    nextAction: String(raw.nextAction ?? "").trim(),
  };
}
