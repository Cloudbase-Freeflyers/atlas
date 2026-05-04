import {
  addDays,
  differenceInCalendarDays,
  format,
  parseISO,
  startOfDay,
} from "date-fns";

function num(v) {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** Keep the newest snapshot per ASIN + SKU (Cube rows ordered by report_date desc). */
export function pickLatestInventoryByAsinSku(rows) {
  const sorted = [...(rows || [])].sort((a, b) => {
    const da = new Date(a["SellerInventoryReports.report_date"]).getTime();
    const db = new Date(b["SellerInventoryReports.report_date"]).getTime();
    return db - da;
  });
  const seen = new Set();
  const out = [];
  for (const row of sorted) {
    const asin = row["SellerInventoryReports.asin"];
    const sku = row["SellerInventoryReports.sku"];
    if (asin == null || sku == null) continue;
    const k = `${asin}|${sku}`;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(row);
  }
  return out;
}

export function velocityByAsin(velocityRows) {
  const map = new Map();
  for (const row of velocityRows || []) {
    const asin = row["ProductStats.asin"];
    if (asin == null) continue;
    map.set(asin, {
      title: row["SellerListingReports.item_name"] ?? "",
      units: row["ProductStats.units"],
    });
  }
  return map;
}

export function forecastDayCount(startDateYmd, endDateYmd) {
  if (!startDateYmd || !endDateYmd) return 1;
  const d0 = startOfDay(parseISO(startDateYmd));
  const d1 = startOfDay(parseISO(endDateYmd));
  return Math.max(1, differenceInCalendarDays(d1, d0) + 1);
}

/**
 * @param {Record<string, { productionDays?: number, freightDays?: number, restockQty?: number, restockCost?: number }>} leadByKey keyed `asin|sku`
 */
export function buildInventoryForecastRows(
  latestInv,
  velocityMap,
  dayCount,
  leadByKey,
  now = new Date()
) {
  const today = startOfDay(now);
  const rows = [];

  for (const inv of latestInv) {
    const asin = inv["SellerInventoryReports.asin"];
    const sku = inv["SellerInventoryReports.sku"];
    const rowKey = `${asin}|${sku}`;
    const vel = velocityMap.get(asin);
    const title = vel?.title ?? "";
    const unitsSold = num(vel?.units);
    const days = Math.max(1, dayCount || 1);
    const dailyVelocity =
      unitsSold != null ? Math.round((unitsSold / days) * 100) / 100 : null;

    const afnTotal = num(inv["SellerInventoryReports.afn_total_quantity"]);
    const afnFulfillable = num(
      inv["SellerInventoryReports.afn_fulfillable_quantity"]
    );
    const fbaStock = afnFulfillable ?? afnTotal;

    const daysOfSupply =
      dailyVelocity != null &&
      dailyVelocity > 0 &&
      fbaStock != null &&
      fbaStock >= 0
        ? Math.round((fbaStock / dailyVelocity) * 10) / 10
        : null;

    const stockout =
      daysOfSupply != null
        ? addDays(today, Math.ceil(daysOfSupply))
        : null;

    const lead = leadByKey[rowKey] || {};
    const prod = num(lead.productionDays);
    const fr = num(lead.freightDays);
    const restockQty = num(lead.restockQty);
    const restockCost = num(lead.restockCost);
    const leadSum = (prod ?? 0) + (fr ?? 0);
    const restockDate =
      stockout && leadSum > 0 ? addDays(stockout, -leadSum) : null;
    const daysToReorder =
      restockDate != null
        ? differenceInCalendarDays(restockDate, today)
        : null;

    let stockLevelLabel = "";
    if (fbaStock != null && fbaStock <= 0) stockLevelLabel = "Out";
    else if (
      daysOfSupply != null &&
      daysOfSupply < 14 &&
      daysOfSupply >= 0
    )
      stockLevelLabel = "Low";

    rows.push({
      rowKey,
      thumb: "",
      asin,
      sku,
      title,
      parentAsin: "",
      productionLead: "",
      freightLead: "",
      stockLevelLabel,
      daysToReorder,
      restockDate,
      restockQty,
      restockCost,
      fbaStock,
      available: afnFulfillable,
      awdToFba: null,
      dailyVelocity,
      daysOfSupply,
      stockoutDate: stockout,
      inProduction: null,
      inboundFba: null,
      inbound3pl: null,
      inboundAwd: null,
      threePl: null,
      threePlToFba: null,
      productionDays: prod,
      freightDays: fr,
    });
  }

  rows.sort((a, b) => {
    const fa = a.fbaStock ?? -1;
    const fb = b.fbaStock ?? -1;
    return fb - fa;
  });
  return rows;
}

export function formatShortDate(d) {
  if (!d) return "";
  try {
    return format(d, "dd-MMM-yy");
  } catch {
    return "";
  }
}
