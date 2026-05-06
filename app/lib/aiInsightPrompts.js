/**
 * Per-page AI insight prompts and static benchmark data.
 * Used by /api/ai-insight and AIMetricBenchmark component.
 */

// ── Static benchmarks (no API call needed) ──────────────────────────────────

export const METRIC_BENCHMARKS = {
  // Key: normalized metric label (lowercase, no spaces)
  acos: {
    label: "ACOS",
    unit: "%",
    good: { max: 20 },
    ok: { max: 30 },
    description: "Ad Cost of Sales — lower is better. Target <20% for established products.",
    tip: "Review match types and pause keywords with high spend and zero orders.",
    isPercent: true,
    higherIsBad: true,
  },
  roas: {
    label: "ROAS",
    unit: "x",
    good: { min: 4 },
    ok: { min: 2.5 },
    description: "Return on Ad Spend — higher is better. Target >4x for profitability.",
    tip: "Focus budget on campaigns exceeding 4x ROAS. Reduce spend on sub-2x.",
    higherIsBad: false,
  },
  tacos: {
    label: "TACOS",
    unit: "%",
    good: { max: 10 },
    ok: { max: 15 },
    description: "Total ACOS — ad spend as % of total revenue. Target <10%.",
    tip: "If TACOS > ACOS, organic rank is growing. If TACOS ≈ ACOS, your organic visibility needs work.",
    isPercent: true,
    higherIsBad: true,
  },
  ctr: {
    label: "CTR",
    unit: "%",
    good: { min: 0.4 },
    ok: { min: 0.2 },
    description: "Click-Through Rate. Amazon average is ~0.3%. Target >0.4%.",
    tip: "A low CTR usually signals weak main images or irrelevant targeting.",
    isPercent: true,
    higherIsBad: false,
  },
  cpc: {
    label: "CPC",
    unit: "$",
    good: { max: 0.8 },
    ok: { max: 1.5 },
    description: "Cost Per Click. Varies by category — target <$1 for most categories.",
    tip: "High CPC with low conversion = wasted budget. Tighten match types.",
    higherIsBad: true,
  },
  cvr: {
    label: "CVR",
    unit: "%",
    good: { min: 12 },
    ok: { min: 8 },
    description: "Conversion Rate. Amazon average is ~10%. Target >12%.",
    tip: "Low CVR suggests listing issues — improve bullets, images, or price.",
    isPercent: true,
    higherIsBad: false,
  },
  conversion: {
    label: "CVR",
    unit: "%",
    good: { min: 12 },
    ok: { min: 8 },
    description: "Conversion Rate. Amazon average is ~10%. Target >12%.",
    tip: "Low CVR suggests listing issues — improve bullets, images, or price.",
    isPercent: true,
    higherIsBad: false,
  },
  impressions: {
    label: "Impressions",
    unit: "",
    description: "Number of times your ad was shown. Context-dependent.",
    tip: "Flat impressions may indicate low bids or limited keyword coverage.",
    higherIsBad: false,
  },
  spend: {
    label: "Spend",
    unit: "$",
    description: "Total ad spend in the period.",
    tip: "Ensure spend is aligned with your daily budget cap and TACOS target.",
    higherIsBad: false,
  },
  sales: {
    label: "Sales",
    unit: "$",
    description: "Total revenue attributed to ads.",
    tip: "Compare ad sales vs organic sales to understand channel mix.",
    higherIsBad: false,
  },
};

// ── Per-page system prompts for /api/ai-insight ───────────────────────────

export const PAGE_SYSTEM_PROMPTS = {
  "overall-kpis": `You are Atlas AI, an Amazon PPC and e-commerce performance expert embedded in a client analytics platform.
You are given aggregated KPI metrics for a specific date range. Analyze them and return JSON with:
- "brief": 2 sentences max — what stands out most from the overall numbers, referencing specific values
- "tips": array of exactly 2 short actionable tips (each ≤ 15 words)
- "topAction": single most important next action (≤ 20 words, starts with a verb)
Be specific. Use the exact metric values. Never give generic advice.`,

  "ads-overview": `You are Atlas AI, an Amazon advertising specialist.
You are given advertising metrics (spend, sales, ACOS, ROAS, CTR, CPC, impressions, clicks) for a date range. Analyze them and return JSON with:
- "brief": 2 sentences — what the ad account health looks like, with specific numbers
- "tips": array of exactly 2 short actionable improvements (each ≤ 15 words)
- "topAction": the single most impactful next action (≤ 20 words, starts with a verb)
Cite the exact numbers passed. Focus on efficiency.`,

  campaigns: `You are Atlas AI, an Amazon campaign optimization expert.
You are given campaign performance data. Analyze and return JSON with:
- "brief": 2 sentences on campaign portfolio health — highlight best and worst performers by ROAS/ACOS
- "tips": array of exactly 2 actionable campaign-level tips (each ≤ 15 words)
- "topAction": the single most important campaign action (≤ 20 words, starts with a verb)
Be specific about which metrics to act on.`,

  keywords: `You are Atlas AI, an Amazon keyword and search term expert.
You are given keyword and search term performance data. Analyze and return JSON with:
- "brief": 2 sentences on the keyword portfolio — wasted spend, top performers, harvest opportunities
- "tips": array of exactly 2 keyword-specific actions (each ≤ 15 words)
- "topAction": the most urgent keyword action right now (≤ 20 words, starts with a verb)
Focus on match type efficiency and negative keyword opportunities.`,

  "seller-central": `You are Atlas AI, an Amazon Seller Central performance expert.
You are given seller metrics (orders, units, sales, sessions, BSR signals). Analyze and return JSON with:
- "brief": 2 sentences on organic sales health and any notable patterns
- "tips": array of exactly 2 seller-specific actions (each ≤ 15 words)
- "topAction": the single most important seller action (≤ 20 words, starts with a verb)`,

  pnl: `You are Atlas AI, an Amazon profitability and P&L expert.
You are given revenue, ad cost, estimated FBA fees, COGS, and net profit data. Analyze and return JSON with:
- "brief": 2 sentences on overall profitability — where the biggest cost leaks are, referencing exact $ values
- "tips": array of exactly 2 margin improvement tips (each ≤ 15 words)
- "topAction": the single action to improve net margin most (≤ 20 words, starts with a verb)`,

  "inventory-forecast": `You are Atlas AI, an Amazon inventory management expert.
You are given inventory levels, sales velocity, and restock data. Analyze and return JSON with:
- "brief": 2 sentences on inventory health — stockout risk, overstock risk, priority SKUs
- "tips": array of exactly 2 inventory-specific tips (each ≤ 15 words)
- "topAction": the most urgent inventory action (≤ 20 words, starts with a verb)`,

  "sales-trend": `You are Atlas AI, an Amazon sales trend analyst.
You are given weekly/daily sales trend data. Analyze and return JSON with:
- "brief": 2 sentences on the trend — is the trajectory improving, declining, or flat? Reference the numbers.
- "tips": array of exactly 2 tips to improve sales trajectory (each ≤ 15 words)
- "topAction": one concrete action to accelerate growth (≤ 20 words, starts with a verb)`,

  harvest: `You are Atlas AI, an Amazon search term harvest expert.
You will receive a list of search terms with spend, clicks, and orders data. Analyze and return JSON with:
- "negatives": array of 3-5 search terms to add as negatives (high spend, zero or near-zero orders)
- "promotions": array of 2-4 search terms to promote to exact match targeting (good CVR, relevant)
- "bidAdjust": array of 2-3 search terms where bid should be lowered (high spend, below-average ROAS)
For each item include: { "term": "...", "reason": "≤10 word reason" }`,
};

// ── Utility: get benchmark status for a metric value ─────────────────────

export function getBenchmarkStatus(metricKey, rawValue) {
  const key = metricKey?.toLowerCase().replace(/[^a-z]/g, "");
  const bench = METRIC_BENCHMARKS[key];
  if (!bench || rawValue == null || rawValue === "—") return null;

  const val = parseFloat(rawValue);
  if (isNaN(val)) return null;

  // Convert percent fractions (0.24 → 24%) for comparison
  const display = bench.isPercent && val < 1 ? val * 100 : val;

  let status = "neutral";
  if (bench.good?.min != null) status = display >= bench.good.min ? "good" : display >= (bench.ok?.min ?? 0) ? "ok" : "bad";
  if (bench.good?.max != null) status = display <= bench.good.max ? "good" : display <= (bench.ok?.max ?? Infinity) ? "ok" : "bad";

  return { status, display: display.toFixed(bench.unit === "$" ? 2 : bench.isPercent ? 1 : 2), bench };
}
