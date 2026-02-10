/**
 * Amazon SP-API (Seller Central) client.
 * Reports, orders, and catalog — used to power Seller Central reports in the app.
 * @see https://developer-docs.amazon.com/sp-api/
 */

import { gunzipSync } from "zlib";
import { getSellerAccessToken } from "./auth.js";
import {
  getSellerConfig,
  getSellerApiBase,
} from "./config.js";

/**
 * Call SP-API with LWA token and optional request body.
 * @param {string} path - e.g. /reports/2021-06-30/reports
 * @param {RequestInit} [options]
 * @returns {Promise<Response>}
 */
async function spApiRequest(path, options = {}) {
  const config = getSellerConfig();
  if (!config.configured) {
    throw new Error("Seller Central is not configured. Set AMAZON_SELLER_* env vars.");
  }
  const token = await getSellerAccessToken({
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    refreshToken: config.refreshToken,
  });
  const base = getSellerApiBase(config.region, config.sandbox);
  const url = `${base}${path}`;
  const headers = {
    "x-amz-access-token": token.access_token,
    "Content-Type": "application/json",
    ...options.headers,
  };
  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Create a report and return reportId.
 * @param {string} reportType - e.g. GET_FLAT_FILE_ALL_ORDERS_DATA_BY_ORDER_DATE_GENERAL
 * @param {{ dataStartTime?: string, dataEndTime?: string, marketplaceIds: string[] }} [params]
 */
export async function createReport(reportType, params = {}) {
  const config = getSellerConfig();
  const marketplaceIds = params.marketplaceIds || [config.marketplaceId];
  const body = {
    reportType,
    marketplaceIds,
    ...(params.dataStartTime && { dataStartTime: params.dataStartTime }),
    ...(params.dataEndTime && { dataEndTime: params.dataEndTime }),
    ...(params.reportOptions && { reportOptions: params.reportOptions }),
  };
  const res = await spApiRequest("/reports/2021-06-30/reports", {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`SP-API createReport failed (${res.status}): ${err}`);
  }
  const data = await res.json();
  return data.reportId;
}

/**
 * Get report status.
 * @param {string} reportId
 */
export async function getReport(reportId) {
  const res = await spApiRequest(`/reports/2021-06-30/reports/${reportId}`);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`SP-API getReport failed (${res.status}): ${err}`);
  }
  return res.json();
}

/**
 * Get report document (download URL and compression).
 * @param {string} reportDocumentId
 */
export async function getReportDocument(reportDocumentId) {
  const res = await spApiRequest(`/reports/2021-06-30/documents/${reportDocumentId}`);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`SP-API getReportDocument failed (${res.status}): ${err}`);
  }
  return res.json();
}

/**
 * Download report document content from pre-signed URL.
 * Handles GZIP compression. Returns plain text (UTF-8).
 * @param {string} reportDocumentId
 * @returns {Promise<string>}
 */
export async function downloadReportContent(reportDocumentId) {
  const doc = await getReportDocument(reportDocumentId);
  const url = doc.url;
  if (!url) throw new Error("Report document has no url");
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Report download failed (${res.status}): ${res.statusText}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const compression = (doc.compressionAlgorithm || "").toUpperCase();
  const raw = compression === "GZIP" ? gunzipSync(buf) : buf;
  return raw.toString("utf-8");
}

const REPORT_POLL_INTERVAL_MS = 3000;
const REPORT_POLL_MAX_WAIT_MS = 300000; // 5 min

/**
 * Poll report until processingStatus is DONE or CANCELLED.
 * @param {string} reportId
 * @param {number} [maxWaitMs]
 * @returns {Promise<{ processingStatus: string, reportDocumentId?: string }>}
 */
export async function pollReportUntilDone(reportId, maxWaitMs = REPORT_POLL_MAX_WAIT_MS) {
  const start = Date.now();
  for (;;) {
    const report = await getReport(reportId);
    const status = report.processingStatus || report.status;
    if (status === "DONE") {
      return { processingStatus: "DONE", reportDocumentId: report.reportDocumentId };
    }
    if (status === "CANCELLED" || status === "FATAL") {
      return { processingStatus: status, reportDocumentId: report.reportDocumentId };
    }
    if (Date.now() - start >= maxWaitMs) {
      return { processingStatus: "TIMEOUT" };
    }
    await new Promise((r) => setTimeout(r, REPORT_POLL_INTERVAL_MS));
  }
}

/** Report type for all orders by order date (tab-delimited). */
export const REPORT_TYPE_ORDERS_BY_ORDER_DATE = "GET_FLAT_FILE_ALL_ORDERS_DATA_BY_ORDER_DATE_GENERAL";

/** Report type for Sales and Traffic (Seller only). */
export const REPORT_TYPE_SALES_AND_TRAFFIC = "GET_SALES_AND_TRAFFIC_REPORT";

/**
 * Create a report, wait until done, download and return raw text.
 * @param {string} reportType
 * @param {{ dataStartTime: string, dataEndTime: string, reportOptions?: object }} params
 * @returns {Promise<string>}
 */
export async function createReportAndDownload(reportType, params) {
  const reportId = await createReport(reportType, {
    dataStartTime: params.dataStartTime,
    dataEndTime: params.dataEndTime,
    reportOptions: params.reportOptions,
  });
  const poll = await pollReportUntilDone(reportId);
  if (poll.processingStatus !== "DONE" || !poll.reportDocumentId) {
    throw new Error(`Report ${reportType} failed: ${poll.processingStatus}`);
  }
  return downloadReportContent(poll.reportDocumentId);
}

/**
 * Fetch Sales and Traffic report (Seller only). Returns JSON with salesAndTrafficByDate, salesAndTrafficByAsin.
 * Report document may be JSON or need parsing; we try JSON first.
 * @param {string} dataStartTime date only e.g. 2024-01-01
 * @param {string} dataEndTime date only e.g. 2024-01-31
 * @returns {Promise<{ salesAndTrafficByDate?: Array<{ date: string, salesByDate: object, trafficByDate: object }>, salesAndTrafficByAsin?: array }>}
 */
export async function getSalesAndTrafficReportData(dataStartTime, dataEndTime) {
  const startDate = dataStartTime.slice(0, 10);
  const endDate = dataEndTime.slice(0, 10);
  const raw = await createReportAndDownload(REPORT_TYPE_SALES_AND_TRAFFIC, {
    dataStartTime: startDate,
    dataEndTime: endDate,
    reportOptions: { dateGranularity: "DAY", asinGranularity: "PARENT" },
  });
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/**
 * Parse tab-delimited order flat file (GET_FLAT_FILE_ALL_ORDERS_DATA_BY_ORDER_DATE_GENERAL).
 * Columns: amazon-order-id, merchant-order-id, purchase-date, last-updated-date, order-status,
 * fulfillment-channel, sales-channel, order-channel, ship-service-level, product-name, sku, asin,
 * item-status, quantity, currency, item-price, item-tax, shipping-price, shipping-tax, ...
 * @param {string} text
 * @returns {Array<Record<string, string>>}
 */
export function parseOrderReportFlatFile(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const header = lines[0].split("\t").map((h) => h.trim().toLowerCase().replace(/-/g, "_"));
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split("\t");
    const row = {};
    header.forEach((h, j) => {
      row[h] = values[j] !== undefined ? String(values[j]).trim() : "";
    });
    rows.push(row);
  }
  return rows;
}

/**
 * Fetch order report for date range, parse and return row objects.
 * @param {string} dataStartTime ISO 8601
 * @param {string} dataEndTime ISO 8601
 * @returns {Promise<Array<Record<string, string>>>}
 */
export async function getOrderReportData(dataStartTime, dataEndTime) {
  const raw = await createReportAndDownload(REPORT_TYPE_ORDERS_BY_ORDER_DATE, {
    dataStartTime,
    dataEndTime,
  });
  return parseOrderReportFlatFile(raw);
}

/**
 * Get order items for an order (Orders API v0).
 * @param {string} orderId
 */
export async function getOrderItems(orderId) {
  const res = await spApiRequest(`/orders/v0/orders/${orderId}/orderItems`);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`SP-API getOrderItems failed (${res.status}): ${err}`);
  }
  return res.json();
}

/**
 * Get orders for a date range (Orders API v0).
 * CreatedAfter/CreatedBefore must be ISO 8601 date-time (e.g. 2024-01-15T00:00:00Z).
 * @param {{ CreatedAfter?: string, CreatedBefore?: string, MaxResultsPerPage?: number }} [query]
 */
export async function getOrders(query = {}) {
  const config = getSellerConfig();
  const marketplaceIds = config.sandbox ? "ATVPDKIKX0DER" : config.marketplaceId;
  const params = new URLSearchParams();
  params.set("MarketplaceIds", marketplaceIds);
  if (query.CreatedAfter) {
    params.set("CreatedAfter", query.CreatedAfter);
  }
  if (query.CreatedBefore) {
    params.set("CreatedBefore", query.CreatedBefore);
  }
  if (query.MaxResultsPerPage != null) {
    params.set("MaxResultsPerPage", String(query.MaxResultsPerPage));
  }
  const queryString = params.toString();
  const res = await spApiRequest(`/orders/v0/orders${queryString ? `?${queryString}` : ""}`);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`SP-API getOrders failed (${res.status}): ${err}`);
  }
  return res.json();
}

/**
 * Aggregated KPIs derived from Seller Central (orders / reports).
 * When reports API is used, you would process report documents and aggregate.
 * This returns a shape matching the app's kpiMetrics / P&L for API-ready usage.
 */
export async function getSellerKpis() {
  const config = getSellerConfig();
  if (!config.configured) {
    return { source: "sample", data: null };
  }
  try {
    const createdAfter = config.sandbox
      ? "TEST_CASE_200"
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const ordersRes = await getOrders({
      CreatedAfter: createdAfter,
      MaxResultsPerPage: 100,
    });
    const orders = ordersRes.payload?.Orders || [];
    const totalOrders = orders.length;
    const orderTotal = orders.reduce((sum, o) => sum + (Number(o.OrderTotal?.Amount) || 0), 0);
    return {
      source: "api",
      data: {
        totalOrders,
        totalSales: orderTotal,
        currency: orders[0]?.OrderTotal?.CurrencyCode || "USD",
      },
    };
  } catch (err) {
    return { source: "api_error", error: err.message, data: null };
  }
}
