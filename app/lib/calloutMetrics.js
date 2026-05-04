import { differenceInCalendarDays, subDays, format, parseISO } from "date-fns";
import { fetchCubeData } from "./cubeReports.js";

/** Match cubeReports / useData: company id as API provides it. */
function companyFilter(companyId) {
  return [
    {
      member: "Companies.id",
      operator: "equals",
      values: [companyId],
    },
  ];
}

export function previousPeriodRange(startDateStr, endDateStr) {
  const start = parseISO(startDateStr);
  const end = parseISO(endDateStr);
  const days = differenceInCalendarDays(end, start) + 1;
  const prevEnd = subDays(start, 1);
  const prevStart = subDays(prevEnd, days - 1);
  return {
    prevStart: format(prevStart, "yyyy-MM-dd"),
    prevEnd: format(prevEnd, "yyyy-MM-dd"),
    days,
  };
}

/**
 * Must match deployed Cube. Campaigns/entities use sales14d; overview often uses sales.
 * Request both so at least one resolves per schema.
 */
const ADS_MEASURES = [
  "AdsCampaignReports.spend",
  "AdsCampaignReports.sales",
  "AdsCampaignReports.sales14d",
  "AdsCampaignReports.purchases14d",
  "AdsCampaignReports.impressions",
  "AdsCampaignReports.clicks",
  "AdsCampaignReports.acos",
  "AdsCampaignReports.roas",
  "AdsCampaignReports.ctr",
  "AdsCampaignReports.cpc",
];

/** Sum these across days. Sales uses {@link pickAdAttributedSales} per row to avoid double-counting sales vs sales14d. */
const ADS_ADDITIVE = [
  "AdsCampaignReports.spend",
  "AdsCampaignReports.purchases14d",
  "AdsCampaignReports.impressions",
  "AdsCampaignReports.clicks",
];

const PNL_MEASURES = [
  "PnlDistribution.totalSales",
  "PnlDistribution.adCost",
  "PnlDistribution.adSales",
  "PnlDistribution.profit",
  "PnlDistribution.totalUnits",
  "PnlDistribution.organicSales",
];

const PNL_ADDITIVE = [...PNL_MEASURES];

/**
 * Prefer `sales` when present; otherwise `sales14d` (Cube schemas vary). Avoids double-counting in rollups.
 */
export function pickAdAttributedSales(row) {
  if (!row) return null;
  const rawS = row["AdsCampaignReports.sales"];
  const raw14 = row["AdsCampaignReports.sales14d"];
  if (rawS != null && rawS !== "" && Number.isFinite(Number(rawS))) {
    return Number(rawS);
  }
  if (raw14 != null && raw14 !== "" && Number.isFinite(Number(raw14))) {
    return Number(raw14);
  }
  return null;
}

/**
 * Cube may return one row per day when the time dimension is active. Sum additive
 * fields, then recompute ACOS/ROAS/CTR/CPC from period totals (do not sum ratio columns).
 */
export function rollupAdsCubeRows(rows) {
  if (!rows?.length) return null;
  if (rows.length === 1) {
    const r = { ...rows[0] };
    const sales = pickAdAttributedSales(r) ?? 0;
    return recomputeAdsDerived(r, sales);
  }
  const acc = {};
  for (const k of ADS_ADDITIVE) acc[k] = 0;
  let effectiveSales = 0;
  for (const row of rows) {
    for (const k of ADS_ADDITIVE) {
      acc[k] += Number(row[k]) || 0;
    }
    effectiveSales += pickAdAttributedSales(row) ?? 0;
  }
  acc["AdsCampaignReports.sales"] = effectiveSales;
  acc["AdsCampaignReports.sales14d"] = 0;
  return recomputeAdsDerived(acc, effectiveSales);
}

function recomputeAdsDerived(row, salesTotal) {
  const spend = Number(row["AdsCampaignReports.spend"]) || 0;
  const sales = salesTotal ?? pickAdAttributedSales(row) ?? 0;
  const clicks = Number(row["AdsCampaignReports.clicks"]) || 0;
  const imps = Number(row["AdsCampaignReports.impressions"]) || 0;
  return {
    ...row,
    "AdsCampaignReports.acos": sales > 0 ? (spend / sales) * 100 : 0,
    "AdsCampaignReports.roas": spend > 0 ? sales / spend : 0,
    "AdsCampaignReports.ctr": imps > 0 ? (clicks / imps) * 100 : 0,
    "AdsCampaignReports.cpc": clicks > 0 ? spend / clicks : 0,
  };
}

export function rollupPnlCubeRows(rows) {
  if (!rows?.length) return null;
  if (rows.length === 1) return { ...rows[0] };
  const acc = {};
  for (const k of PNL_ADDITIVE) acc[k] = 0;
  for (const row of rows) {
    for (const k of PNL_ADDITIVE) {
      acc[k] += Number(row[k]) || 0;
    }
  }
  return acc;
}

function buildTimeRange(dimension, start, end) {
  return [
    {
      dimension,
      dateRange: [start, end],
    },
  ];
}

/**
 * Loads ads + P&L aggregates for the selected window and the prior window of equal length.
 * Tolerates partial Cube failure; rolls up multi-day result sets.
 */
export async function fetchCalloutMetricsBundle(companyId, startDateStr, endDateStr) {
  const filters = companyFilter(companyId);
  const { prevStart, prevEnd, days } = previousPeriodRange(
    startDateStr,
    endDateStr
  );

  const adsCurrentQuery = {
    measures: ADS_MEASURES,
    filters,
    timeDimensions: buildTimeRange(
      "AdsCampaignReports.report_date",
      startDateStr,
      endDateStr
    ),
  };
  const adsPreviousQuery = {
    measures: ADS_MEASURES,
    filters,
    timeDimensions: buildTimeRange(
      "AdsCampaignReports.report_date",
      prevStart,
      prevEnd
    ),
  };
  const pnlCurrentQuery = {
    measures: PNL_MEASURES,
    filters,
    timeDimensions: buildTimeRange(
      "PnlDistribution.report_date",
      startDateStr,
      endDateStr
    ),
  };
  const pnlPreviousQuery = {
    measures: PNL_MEASURES,
    filters,
    timeDimensions: buildTimeRange(
      "PnlDistribution.report_date",
      prevStart,
      prevEnd
    ),
  };

  const errors = [];

  let adsCurRaw = [];
  let adsPrevRaw = [];
  let pnlCurRaw = [];
  let pnlPrevRaw = [];

  const run = async (label, query) => {
    try {
      return await fetchCubeData(query);
    } catch (e) {
      errors.push(`${label}: ${e.message}`);
      return [];
    }
  };

  [adsCurRaw, adsPrevRaw, pnlCurRaw, pnlPrevRaw] = await Promise.all([
    run("Ads (current)", adsCurrentQuery),
    run("Ads (previous)", adsPreviousQuery),
    run("P&L (current)", pnlCurrentQuery),
    run("P&L (previous)", pnlPreviousQuery),
  ]);

  const adsCurrent = rollupAdsCubeRows(adsCurRaw);
  const adsPrevious = rollupAdsCubeRows(adsPrevRaw);
  const pnlCurrent = rollupPnlCubeRows(pnlCurRaw);
  const pnlPrevious = rollupPnlCubeRows(pnlPrevRaw);

  const hasAny = !!(adsCurrent || pnlCurrent);

  return {
    ok: hasAny,
    errors: errors.length ? errors : undefined,
    periodDays: days,
    current: { start: startDateStr, end: endDateStr },
    previous: { start: prevStart, end: prevEnd },
    adsCurrent,
    adsPrevious,
    pnlCurrent,
    pnlPrevious,
  };
}
