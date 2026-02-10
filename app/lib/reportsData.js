/**
 * Reports data layer: Amazon API when configured, sample data otherwise.
 * Used by report pages (Server Components) so they stay server-side and get live or sample data.
 * API routes (/api/amazon/...) expose the same data for external/API usage and client refresh.
 */

import { getSellerConfig, getAdsConfig } from "./amazon/config.js";
import {
  getSellerKpis,
  getOrderReportData,
  getSalesAndTrafficReportData,
} from "./amazon/sellerClient.js";
import {
  listCampaigns,
  listKeywords,
  normalizeCampaignsForUi,
  normalizeKeywordsForUi,
} from "./amazon/adsClient.js";
import {
  kpiMetrics,
  adsMetrics,
  adsSeries,
  campaignRows,
  keywordRows,
  pAndlSeries,
  organicSeries,
} from "./sampleData.js";

/** Default lookback days for order/sales reports. */
const ORDER_REPORT_DAYS = 30;

/**
 * Aggregate order report rows by product (product_name or sku).
 * @param {Array<Record<string, string>>} orderRows from parseOrderReportFlatFile
 * @returns {{ byProduct: Map<string, { orders: Set<string>, units: number, sales: number }>, byDate: Map<string, { sales: number, units: number }> }}
 */
function aggregateOrderReportRows(orderRows) {
  const byProduct = new Map();
  const byDate = new Map();
  for (const r of orderRows) {
    const productKey = (r.product_name || r.sku || "Unknown").trim() || "Unknown";
    const qty = Math.max(0, parseInt(r.quantity, 10) || 0);
    const price = parseFloat(r.item_price) || 0;
    const sales = qty * price;
    const orderId = r.amazon_order_id || r.order_id || "";

    if (!byProduct.has(productKey)) {
      byProduct.set(productKey, { orders: new Set(), units: 0, sales: 0 });
    }
    const p = byProduct.get(productKey);
    p.orders.add(orderId);
    p.units += qty;
    p.sales += sales;

    const dateKey = (r.purchase_date || "").slice(0, 10);
    if (dateKey) {
      if (!byDate.has(dateKey)) byDate.set(dateKey, { sales: 0, units: 0 });
      const d = byDate.get(dateKey);
      d.sales += sales;
      d.units += qty;
    }
  }
  return { byProduct, byDate };
}

/**
 * Build chart series from byDate map (sorted by date).
 * @param {Map<string, { sales: number, units: number }>} byDate
 * @param {'sales'|'units'} metric
 * @returns {Array<{ name: string, data: number[], color: string, fill?: string }>}
 */
function buildDailySeriesFromReport(byDate, metric = "sales") {
  const sorted = [...byDate.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  const data = sorted.map(([, v]) => (metric === "sales" ? v.sales : v.units));
  if (data.length === 0) return [];
  return [
    {
      name: metric === "sales" ? "Sales" : "Units",
      data,
      color: "#2f5bff",
      fill: "#dfe8ff",
    },
  ];
}

/**
 * Build P&L-style series (Sales + optional Orders) from byDate.
 */
function buildPAndLSeriesFromReport(byDate) {
  const sorted = [...byDate.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  const salesData = sorted.map(([, v]) => v.sales);
  const unitsData = sorted.map(([, v]) => v.units);
  const series = [
    { name: "Sales", data: salesData, color: "#2f5bff", fill: "#dfe8ff" },
    { name: "Units", data: unitsData, color: "#22b8cf", fill: "#c9f1f5" },
  ];
  return series.length ? series : [];
}

/**
 * Build organic/PPC-style series (we only have total units from order report).
 */
function buildUnitsSeriesFromReport(byDate) {
  const sorted = [...byDate.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  const unitsData = sorted.map(([, v]) => v.units);
  return [
    { name: "Units", data: unitsData, color: "#2f5bff", fill: "#dfe8ff" },
  ];
}

/**
 * Get KPIs for Overall KPIs report.
 * Returns { source: 'api'|'sample', data: { metrics } }.
 */
export async function getKpiMetrics() {
  const config = getSellerConfig();
  const adsConfig = getAdsConfig();
  if (!config.configured && !adsConfig.configured) {
    return { source: "sample", data: { metrics: kpiMetrics } };
  }
  try {
    const sellerResult = config.configured ? await getSellerKpis() : { source: "sample" };
    if (sellerResult.source === "api" && sellerResult.data) {
      const metrics = [
        { label: "Total Orders", value: String(sellerResult.data.totalOrders ?? 0) },
        { label: "Total Sales ($)", value: (sellerResult.data.totalSales ?? 0).toFixed(2) },
        ...kpiMetrics.slice(2, 7),
      ];
      return { source: "api", data: { metrics } };
    }
  } catch (e) {
    // fall through to sample
  }
  return { source: "sample", data: { metrics: kpiMetrics } };
}

/**
 * Get Ads Overview metrics and series.
 * Returns { source, data: { metrics, series } }.
 */
export async function getAdsOverview() {
  const config = getAdsConfig();
  if (!config.configured) {
    return { source: "sample", data: { metrics: adsMetrics, series: adsSeries } };
  }
  try {
    const payload = await listCampaigns({ count: 100 });
    const campaigns = Array.isArray(payload) ? payload : payload.campaigns || [];
    const metrics = [
      { label: "Total Campaigns", value: String(campaigns.length) },
      { label: "Active", value: String(campaigns.filter((c) => c.state === "enabled").length) },
      ...adsMetrics.slice(0, 8),
    ];
    return { source: "api", data: { metrics, series: adsSeries } };
  } catch {
    return { source: "sample", data: { metrics: adsMetrics, series: adsSeries } };
  }
}

/**
 * Get campaigns list for Campaigns report.
 * Returns { source, data: { rows } }.
 */
export async function getCampaignsData() {
  const config = getAdsConfig();
  if (!config.configured) {
    return { source: "sample", data: { rows: campaignRows } };
  }
  try {
    const payload = await listCampaigns({ count: 100 });
    const raw = Array.isArray(payload) ? payload : payload.campaigns || [];
    const rows = normalizeCampaignsForUi(raw);
    return { source: "api", data: { rows } };
  } catch {
    return { source: "sample", data: { rows: campaignRows } };
  }
}

/**
 * Get keywords/targets for Keywords & Search Terms report.
 * Returns { source, data: { rows } }.
 */
export async function getKeywordsData() {
  const config = getAdsConfig();
  if (!config.configured) {
    return { source: "sample", data: { rows: keywordRows } };
  }
  try {
    const payload = await listKeywords({ count: 500 });
    const raw = Array.isArray(payload) ? payload : payload.keywords || [];
    const rows = normalizeKeywordsForUi(raw);
    return { source: "api", data: { rows } };
  } catch {
    return { source: "sample", data: { rows: keywordRows } };
  }
}

/**
 * Get Seller Central P&L and product-level data (charts + table).
 * Uses SP-API order report when configured; otherwise Orders API KPIs or sample.
 * Returns { source, data: { pAndlSeries, organicSeries, rows } }.
 */
export async function getSellerCentralData() {
  const config = getSellerConfig();
  const sampleRows = [
    {
      product: "Sand",
      orders: "58",
      units: "58",
      sales: "$1,493.24",
      profits: "($202.63)",
      ads: "$396.90",
      acos: "40.80%",
      tacos: "26.6%",
      sessions: "1,521",
      conversion: "3.81%",
    },
    {
      product: "Charcoal",
      orders: "41",
      units: "41",
      sales: "$1,204.89",
      profits: "$182.14",
      ads: "$184.22",
      acos: "15.30%",
      tacos: "11.2%",
      sessions: "1,204",
      conversion: "3.40%",
    },
  ];
  if (!config.configured) {
    return { source: "sample", data: { pAndlSeries, organicSeries, rows: sampleRows } };
  }

  try {
    const end = new Date();
    const start = new Date(Date.now() - ORDER_REPORT_DAYS * 24 * 60 * 60 * 1000);
    const dataStartTime = start.toISOString().slice(0, 19) + "Z";
    const dataEndTime = end.toISOString().slice(0, 19) + "Z";
    const orderRows = await getOrderReportData(dataStartTime, dataEndTime);
    const { byProduct, byDate } = aggregateOrderReportRows(orderRows);
    const pAndlFromApi = buildPAndLSeriesFromReport(byDate);
    const organicFromApi = buildUnitsSeriesFromReport(byDate);
    const rows = [];
    for (const [product, agg] of byProduct.entries()) {
      rows.push({
        product,
        orders: String(agg.orders.size),
        units: String(agg.units),
        sales: `$${agg.sales.toFixed(2)}`,
        profits: "—",
        ads: "—",
        acos: "—",
        tacos: "—",
        sessions: "—",
        conversion: "—",
      });
    }
    return {
      source: "api",
      data: {
        pAndlSeries: pAndlFromApi.length ? pAndlFromApi : pAndlSeries,
        organicSeries: organicFromApi.length ? organicFromApi : organicSeries,
        rows: rows.length ? rows : sampleRows,
      },
    };
  } catch {
    // fall back to KPIs-only then sample
  }

  try {
    const kpis = await getSellerKpis();
    if (kpis.source === "api" && kpis.data) {
      return {
        source: "api",
        data: {
          pAndlSeries,
          organicSeries,
          rows: [
            {
              product: "Orders (30d)",
              orders: String(kpis.data.totalOrders ?? 0),
              units: "—",
              sales: `$${(kpis.data.totalSales ?? 0).toFixed(2)}`,
              profits: "—",
              ads: "—",
              acos: "—",
              tacos: "—",
              sessions: "—",
              conversion: "—",
            },
          ],
        },
      };
    }
  } catch {
    // fall through
  }
  return { source: "sample", data: { pAndlSeries, organicSeries, rows: sampleRows } };
}

/**
 * Get sales distribution data (by product: sales, orders, units, margin).
 * Uses same SP-API order report. Returns { source, data: { rows, series } }.
 */
export async function getSalesDistributionData() {
  const config = getSellerConfig();
  const placeholderSeries = [{ name: "—", data: [0, 0, 0, 0, 0, 0], color: "var(--c-ink-muted)" }];
  if (!config.configured) {
    return { source: "sample", data: { rows: [], series: placeholderSeries } };
  }
  try {
    const end = new Date();
    const start = new Date(Date.now() - ORDER_REPORT_DAYS * 24 * 60 * 60 * 1000);
    const orderRows = await getOrderReportData(
      start.toISOString().slice(0, 19) + "Z",
      end.toISOString().slice(0, 19) + "Z"
    );
    const { byProduct, byDate } = aggregateOrderReportRows(orderRows);
    const sorted = [...byDate.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    const series = [
      { name: "Sales", data: sorted.map(([, v]) => v.sales), color: "#2f5bff", fill: "#dfe8ff" },
    ];
    const rows = [];
    for (const [product, agg] of byProduct.entries()) {
      rows.push({
        product,
        sales: `$${agg.sales.toFixed(2)}`,
        orders: String(agg.orders.size),
        units: String(agg.units),
        margin: "—",
        refunds: "—",
      });
    }
    return { source: "api", data: { rows, series: series.length ? series : placeholderSeries } };
  } catch {
    return { source: "sample", data: { rows: [], series: placeholderSeries } };
  }
}

/**
 * Get units data (organic vs PPC not in order report; we return total units by product and by day).
 * Returns { source, data: { rows, series } }.
 */
export async function getUnitsData() {
  const config = getSellerConfig();
  const placeholderSeries = [{ name: "—", data: [0, 0, 0, 0, 0, 0], color: "var(--c-ink-muted)" }];
  if (!config.configured) {
    return { source: "sample", data: { rows: [], series: placeholderSeries } };
  }
  try {
    const end = new Date();
    const start = new Date(Date.now() - ORDER_REPORT_DAYS * 24 * 60 * 60 * 1000);
    const orderRows = await getOrderReportData(
      start.toISOString().slice(0, 19) + "Z",
      end.toISOString().slice(0, 19) + "Z"
    );
    const { byProduct, byDate } = aggregateOrderReportRows(orderRows);
    const sorted = [...byDate.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    const series = [
      { name: "Units", data: sorted.map(([, v]) => v.units), color: "#2f5bff", fill: "#dfe8ff" },
    ];
    const rows = [];
    for (const [product, agg] of byProduct.entries()) {
      rows.push({
        product,
        organic: "—",
        ppc: "—",
        total: String(agg.units),
      });
    }
    return { source: "api", data: { rows, series: series.length ? series : placeholderSeries } };
  } catch {
    return { source: "sample", data: { rows: [], series: placeholderSeries } };
  }
}

/**
 * Get sessions data (sessions, page views, unit session %) from GET_SALES_AND_TRAFFIC_REPORT.
 * Returns { source, data: { rows, series } }.
 */
export async function getSessionsData() {
  const config = getSellerConfig();
  const placeholderSeries = [{ name: "—", data: [0, 0, 0, 0, 0, 0], color: "var(--c-ink-muted)" }];
  if (!config.configured) {
    return { source: "sample", data: { rows: [], series: placeholderSeries } };
  }
  try {
    const end = new Date();
    const start = new Date(Date.now() - ORDER_REPORT_DAYS * 24 * 60 * 60 * 1000);
    const startStr = start.toISOString().slice(0, 10);
    const endStr = end.toISOString().slice(0, 10);
    const report = await getSalesAndTrafficReportData(startStr, endStr);
    const byDate = report.salesAndTrafficByDate || [];
    const sorted = [...byDate].sort((a, b) => (a.date || "").localeCompare(b.date || ""));
    const sessionsData = sorted.map((d) => (d.trafficByDate && d.trafficByDate.sessions) || 0);
    const unitSessionPct = sorted.map(
      (d) => (d.trafficByDate && d.trafficByDate.unitSessionPercentage) || 0
    );
    const series = [
      { name: "Sessions", data: sessionsData, color: "#2f5bff", fill: "#dfe8ff" },
      { name: "Unit Session %", data: unitSessionPct, color: "#22b8cf", fill: "#c9f1f5" },
    ];
    const rows = (report.salesAndTrafficByAsin || []).slice(0, 50).map((r) => ({
      asin: r.childAsin || r.parentAsin || "—",
      sessions: String((r.trafficByAsin && r.trafficByAsin.sessions) || 0),
      pageViews: String((r.trafficByAsin && r.trafficByAsin.pageViews) || 0),
      unitSessionPct: r.trafficByAsin && r.trafficByAsin.unitSessionPercentage != null
        ? `${Number(r.trafficByAsin.unitSessionPercentage).toFixed(2)}%`
        : "—",
      unitsOrdered: String((r.salesByAsin && r.salesByAsin.unitsOrdered) || 0),
    }));
    return {
      source: "api",
      data: {
        rows,
        series: sessionsData.length ? series : placeholderSeries,
      },
    };
  } catch {
    return { source: "sample", data: { rows: [], series: placeholderSeries } };
  }
}
