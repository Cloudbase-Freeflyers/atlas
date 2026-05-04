import { addDays, format, parseISO } from "date-fns";

/** Stable sort key for a Cube time bucket (week start). */
export function weekKeyFromCubeDate(raw) {
  if (raw == null || raw === "") return "";
  const d = raw instanceof Date ? raw : new Date(raw);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export function formatWeekRangeLabel(weekStartYmd) {
  if (!weekStartYmd) return "";
  try {
    const s = parseISO(weekStartYmd);
    const e = addDays(s, 6);
    return `${format(s, "dd MMM yyyy")} – ${format(e, "dd MMM yyyy")}`;
  } catch {
    return weekStartYmd;
  }
}

/**
 * Merges weekly PnlDistribution, AdsCampaignReports, and account-rolled-up ProductStats rows.
 */
export function mergeAccountWeeklyRows(pnlRows, adsRows, sessionRows) {
  const map = new Map();

  const ensure = (k) => {
    if (!k) return null;
    if (!map.has(k)) map.set(k, { weekStart: k });
    return map.get(k);
  };

  for (const row of pnlRows || []) {
    const k = weekKeyFromCubeDate(row["PnlDistribution.report_date"]);
    const o = ensure(k);
    if (!o) continue;
    o.totalSales = row["PnlDistribution.totalSales"];
    o.totalUnits = row["PnlDistribution.totalUnits"];
    o.profit = row["PnlDistribution.profit"];
    o.organicSales = row["PnlDistribution.organicSales"];
    o.organicUnits = row["PnlDistribution.organicUnits"];
    o.pnlAdSales = row["PnlDistribution.adSales"];
    o.pnlAdCost = row["PnlDistribution.adCost"];
    o.pnlAdUnits = row["PnlDistribution.adUnits"];
  }

  for (const row of adsRows || []) {
    const k = weekKeyFromCubeDate(row["AdsCampaignReports.report_date"]);
    const o = ensure(k);
    if (!o) continue;
    o.spend = row["AdsCampaignReports.spend"];
    o.adsAttributedSales = row["AdsCampaignReports.sales"];
    o.purchases14d = row["AdsCampaignReports.purchases14d"];
    o.impressions = row["AdsCampaignReports.impressions"];
    o.clicks = row["AdsCampaignReports.clicks"];
    o.ctr = row["AdsCampaignReports.ctr"];
    o.cpc = row["AdsCampaignReports.cpc"];
    o.acos = row["AdsCampaignReports.acos"];
    o.roas = row["AdsCampaignReports.roas"];
  }

  for (const row of sessionRows || []) {
    const k = weekKeyFromCubeDate(row["ProductStats.report_date"]);
    const o = ensure(k);
    if (!o) continue;
    o.sessions = row["ProductStats.sessions"];
    o.conversions = row["ProductStats.conversions"];
  }

  return Array.from(map.values()).sort((a, b) =>
    a.weekStart.localeCompare(b.weekStart)
  );
}

export function enrichWeeksForMetrics(weeks) {
  return weeks.map((w) => {
    const totalSales = num(w.totalSales);
    const spend = num(w.spend);
    const adsSales = num(w.adsAttributedSales);
    const sessions = num(w.sessions);
    const conversions = num(w.conversions);
    const totalUnits = num(w.totalUnits);
    const clicks = num(w.clicks);
    const purchases14d = num(w.purchases14d);
    const profit = num(w.profit);

    return {
      ...w,
      weekLabel: formatWeekRangeLabel(w.weekStart),
      ppcSalesPct:
        totalSales != null && totalSales > 0 && adsSales != null
          ? (adsSales / totalSales) * 100
          : null,
      tacosPct:
        totalSales != null && totalSales > 0 && spend != null
          ? (spend / totalSales) * 100
          : null,
      conversionPct:
        sessions != null && sessions > 0 && conversions != null
          ? (conversions / sessions) * 100
          : null,
      unitSessionPct:
        sessions != null && sessions > 0 && totalUnits != null
          ? (totalUnits / sessions) * 100
          : null,
      marginPct:
        totalSales != null && totalSales > 0 && profit != null
          ? (profit / totalSales) * 100
          : null,
      avgSalePrice:
        totalUnits != null && totalUnits > 0 && totalSales != null
          ? totalSales / totalUnits
          : null,
      ppcCvrPct:
        clicks != null && clicks > 0 && purchases14d != null
          ? (purchases14d / clicks) * 100
          : null,
      ppcCpo:
        purchases14d != null && purchases14d > 0 && spend != null
          ? spend / purchases14d
          : null,
    };
  });
}

function num(v) {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/**
 * Weekly rows for a single ASIN from ProductStats (one Cube query).
 */
export function mergeAsinWeeklyRows(rows) {
  const list = (rows || [])
    .map((row) => {
      const k = weekKeyFromCubeDate(row["ProductStats.report_date"]);
      if (!k) return null;
      return {
        weekStart: k,
        totalSales: row["ProductStats.sales"],
        totalUnits: row["ProductStats.units"],
        profit: row["ProductStats.profit"],
        orders: row["ProductStats.orders"],
        organicUnits: row["ProductStats.organicUnits"],
        pnlAdSales: row["ProductStats.adSales"],
        pnlAdCost: row["ProductStats.adCost"],
        pnlAdUnits: row["ProductStats.adUnits"],
        spend: row["ProductStats.adCost"],
        adsAttributedSales: row["ProductStats.adSales"],
        purchases14d: null,
        impressions: null,
        clicks: null,
        ctr: null,
        cpc: null,
        acos: row["ProductStats.acos"],
        roas: null,
        sessions: row["ProductStats.sessions"],
        conversions: row["ProductStats.conversions"],
        tacosFromCube: row["ProductStats.tacos"],
      };
    })
    .filter(Boolean);

  list.sort((a, b) => a.weekStart.localeCompare(b.weekStart));
  return list;
}

function pick(weeks, fn) {
  return weeks.map((w) => fn(w));
}

/** @param {boolean} accountScope — when false (ASIN), omit campaign-level-only PPC rows. */
export function buildMetricDefinitions(accountScope) {
  const defs = [
    {
      id: "totalSales",
      label: "Sales",
      format: "currency",
      higherIsBetter: true,
      summary: "sum",
      pick: (w) => num(w.totalSales),
    },
    {
      id: "profit",
      label: "Profit",
      format: "currency",
      higherIsBetter: true,
      summary: "sum",
      bipolarSpark: true,
      pick: (w) => num(w.profit),
    },
    {
      id: "orders",
      label: "Orders",
      format: "compact",
      higherIsBetter: true,
      summary: "sum",
      pick: (w) => num(w.orders),
      asinOnly: true,
    },
    {
      id: "totalUnits",
      label: "Units",
      format: "compact",
      higherIsBetter: true,
      summary: "sum",
      pick: (w) => num(w.totalUnits),
    },
    {
      id: "organicUnits",
      label: "Organic units",
      format: "compact",
      higherIsBetter: true,
      summary: "sum",
      pick: (w) => num(w.organicUnits),
    },
    {
      id: "organicSales",
      label: "Organic sales",
      format: "currency",
      higherIsBetter: true,
      summary: "sum",
      pick: (w) => num(w.organicSales),
      accountOnly: true,
    },
    {
      id: "pnlAdSales",
      label: "Ad sales (P&L)",
      format: "currency",
      higherIsBetter: true,
      summary: "sum",
      pick: (w) => num(w.pnlAdSales),
    },
    {
      id: "spend",
      label: "PPC spend",
      format: "currency",
      higherIsBetter: false,
      summary: "sum",
      invertHeat: true,
      costSpark: true,
      pick: (w) => num(w.spend),
    },
    {
      id: "adsAttributedSales",
      label: "PPC attributed sales",
      format: "currency",
      higherIsBetter: true,
      summary: "sum",
      pick: (w) => num(w.adsAttributedSales),
      accountOnly: true,
    },
    {
      id: "purchases14d",
      label: "PPC orders",
      format: "compact",
      higherIsBetter: true,
      summary: "sum",
      pick: (w) => num(w.purchases14d),
      accountOnly: true,
    },
    {
      id: "pnlAdUnits",
      label: "PPC units",
      format: "compact",
      higherIsBetter: true,
      summary: "sum",
      pick: (w) => num(w.pnlAdUnits),
    },
    {
      id: "ppcSalesPct",
      label: "PPC sales %",
      format: "percent",
      higherIsBetter: true,
      summary: "avg",
      pick: (w) => num(w.ppcSalesPct),
      accountOnly: true,
    },
    {
      id: "impressions",
      label: "PPC impressions",
      format: "compact",
      higherIsBetter: true,
      summary: "sum",
      pick: (w) => num(w.impressions),
      accountOnly: true,
    },
    {
      id: "clicks",
      label: "PPC clicks",
      format: "compact",
      higherIsBetter: true,
      summary: "sum",
      pick: (w) => num(w.clicks),
      accountOnly: true,
    },
    {
      id: "ctr",
      label: "PPC CTR %",
      format: "percent",
      higherIsBetter: true,
      summary: "avg",
      pick: (w) => num(w.ctr),
      accountOnly: true,
    },
    {
      id: "cpc",
      label: "PPC CPC",
      format: "currency",
      higherIsBetter: false,
      summary: "avg",
      invertHeat: true,
      costSpark: true,
      pick: (w) => num(w.cpc),
      accountOnly: true,
    },
    {
      id: "ppcCvrPct",
      label: "PPC conversion %",
      format: "percent",
      higherIsBetter: true,
      summary: "avg",
      pick: (w) => num(w.ppcCvrPct),
      accountOnly: true,
    },
    {
      id: "ppcCpo",
      label: "PPC cost / order",
      format: "currency",
      higherIsBetter: false,
      summary: "avg",
      invertHeat: true,
      costSpark: true,
      pick: (w) => num(w.ppcCpo),
      accountOnly: true,
    },
    {
      id: "acos",
      label: "ACOS",
      format: "percent",
      higherIsBetter: false,
      summary: "avg",
      invertHeat: true,
      pick: (w) => num(w.acos),
    },
    {
      id: "tacosPct",
      label: "TACOS (spend / sales)",
      format: "percent",
      higherIsBetter: false,
      summary: "avg",
      invertHeat: true,
      pick: (w) => num(w.tacosPct),
      accountOnly: true,
    },
    {
      id: "tacosFromCube",
      label: "TACOS",
      format: "percent",
      higherIsBetter: false,
      summary: "avg",
      invertHeat: true,
      pick: (w) => num(w.tacosFromCube),
      asinOnly: true,
    },
    {
      id: "roas",
      label: "ROAS",
      format: "percent",
      higherIsBetter: true,
      summary: "avg",
      pick: (w) => num(w.roas),
      accountOnly: true,
    },
    {
      id: "marginPct",
      label: "Margin %",
      format: "percent",
      higherIsBetter: true,
      summary: "avg",
      bipolarSpark: true,
      pick: (w) => num(w.marginPct),
    },
    {
      id: "avgSalePrice",
      label: "Avg sale price",
      format: "currency",
      higherIsBetter: true,
      summary: "avg",
      pick: (w) => num(w.avgSalePrice),
    },
    {
      id: "sessions",
      label: "Sessions",
      format: "compact",
      higherIsBetter: true,
      summary: "sum",
      pick: (w) => num(w.sessions),
    },
    {
      id: "conversionPct",
      label: "Conversion %",
      format: "percent",
      higherIsBetter: true,
      summary: "avg",
      pick: (w) => num(w.conversionPct),
    },
    {
      id: "unitSessionPct",
      label: "Unit session %",
      format: "percent",
      higherIsBetter: true,
      summary: "avg",
      pick: (w) => num(w.unitSessionPct),
    },
  ];

  return defs.filter((d) => {
    if (d.accountOnly && !accountScope) return false;
    if (d.asinOnly && accountScope) return false;
    return true;
  });
}

export function metricsFromWeeks(weeks, accountScope) {
  const enriched = enrichWeeksForMetrics(weeks);
  const defs = buildMetricDefinitions(accountScope);
  return defs.map((d) => {
    const values = pick(enriched, d.pick);
    const summary = summarizeValues(values, d.summary);
    return {
      ...d,
      values,
      summary,
    };
  });
}

function summarizeValues(values, kind) {
  const nums = values.filter((v) => v != null && Number.isFinite(v));
  if (nums.length === 0) return null;
  if (kind === "sum") return nums.reduce((a, b) => a + b, 0);
  const s = nums.reduce((a, b) => a + b, 0);
  return s / nums.length;
}
