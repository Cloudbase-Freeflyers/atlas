/**
 * Anomaly detection utilities for Atlas Smart Alerts.
 * Compares recent metric windows against baseline to surface spikes / drops.
 */

export const ALERT_TYPES = {
  TACOS_SPIKE:       { id: "tacos_spike",       severity: "high",   icon: "🔴", label: "TACOS Spike" },
  ACOS_SPIKE:        { id: "acos_spike",        severity: "high",   icon: "🔴", label: "ACOS Spike" },
  REVENUE_DROP:      { id: "revenue_drop",      severity: "high",   icon: "🔴", label: "Revenue Drop" },
  SPEND_SURGE:       { id: "spend_surge",       severity: "medium", icon: "🟡", label: "Ad Spend Surge" },
  ROAS_DROP:         { id: "roas_drop",         severity: "medium", icon: "🟡", label: "ROAS Drop" },
  LOW_INVENTORY:     { id: "low_inventory",     severity: "medium", icon: "🟡", label: "Low Inventory" },
  CTR_DROP:          { id: "ctr_drop",          severity: "low",    icon: "🔵", label: "CTR Drop" },
  CONVERSION_DROP:   { id: "conversion_drop",   severity: "low",    icon: "🔵", label: "Conversion Rate Drop" },
  BUDGET_EXHAUSTED:  { id: "budget_exhausted",  severity: "high",   icon: "🔴", label: "Budget Exhausted" },
};

/**
 * Detects anomalies from two time windows of data.
 * @param {object} recent  - metrics for the recent window (e.g. last 7 days)
 * @param {object} baseline - metrics for the baseline window (e.g. prior 7 days)
 * @returns {Array} array of alert objects
 */
export function detectAnomalies(recent, baseline) {
  const alerts = [];
  const now = new Date().toISOString();

  function pctChange(current, prev) {
    if (!prev || prev === 0) return 0;
    return ((current - prev) / Math.abs(prev)) * 100;
  }

  function pushAlert(type, metric, current, baseline, threshold, direction, suggestion) {
    const change = pctChange(current, baseline);
    const triggered = direction === "up" ? change > threshold : change < -threshold;
    if (triggered) {
      alerts.push({
        id: `${type.id}_${now}`,
        type: type.id,
        severity: type.severity,
        icon: type.icon,
        label: type.label,
        metric,
        current: +current?.toFixed(4),
        baseline: +baseline?.toFixed(4),
        changePct: +change.toFixed(1),
        suggestion,
        timestamp: now,
      });
    }
  }

  // TACOS spike > +15%
  pushAlert(
    ALERT_TYPES.TACOS_SPIKE, "TACOS",
    recent.tacos, baseline.tacos, 15, "up",
    "Review which campaigns are driving excess spend relative to total sales. Consider lowering bids on low-converting ad groups."
  );

  // ACOS spike > +20%
  pushAlert(
    ALERT_TYPES.ACOS_SPIKE, "ACOS",
    recent.acos, baseline.acos, 20, "up",
    "Check for match type leakage or keyword cannibalization. Consider adding negatives from high-spend, zero-order search terms."
  );

  // Revenue drop > -15%
  pushAlert(
    ALERT_TYPES.REVENUE_DROP, "Revenue",
    recent.revenue, baseline.revenue, 15, "down",
    "Check BSR movement, buy box status, and listing suppression. Review if a competitor lowered price significantly."
  );

  // Spend surge > +25%
  pushAlert(
    ALERT_TYPES.SPEND_SURGE, "Ad Spend",
    recent.spend, baseline.spend, 25, "up",
    "Verify daily budget caps are in place. Check for new broad-match keywords capturing irrelevant traffic."
  );

  // ROAS drop > -20%
  pushAlert(
    ALERT_TYPES.ROAS_DROP, "ROAS",
    recent.roas, baseline.roas, 20, "down",
    "Analyze which campaigns have the worst ROAS and pause or reduce bids. Focus spend on high-converting SKUs."
  );

  // CTR drop > -20%
  pushAlert(
    ALERT_TYPES.CTR_DROP, "CTR",
    recent.ctr, baseline.ctr, 20, "down",
    "Review main image and ad creative. A/B test new hero images. Check if competitors improved their listings."
  );

  // Sort by severity
  const order = { high: 0, medium: 1, low: 2 };
  alerts.sort((a, b) => order[a.severity] - order[b.severity]);

  return alerts;
}

export function severityColor(severity) {
  switch (severity) {
    case "high":   return { bg: "tw:bg-red-500/10",    border: "tw:border-red-500/20",    text: "tw:text-red-400",    dot: "tw:bg-red-500" };
    case "medium": return { bg: "tw:bg-yellow-500/10", border: "tw:border-yellow-500/20", text: "tw:text-yellow-400", dot: "tw:bg-yellow-500" };
    default:       return { bg: "tw:bg-blue-500/10",   border: "tw:border-blue-500/20",   text: "tw:text-blue-400",   dot: "tw:bg-blue-500" };
  }
}
