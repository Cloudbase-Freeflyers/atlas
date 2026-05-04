import { ADS_SEARCH_TERM_PREFIX } from "./searchTermQuery.js";

const p = ADS_SEARCH_TERM_PREFIX;

/**
 * @param {Record<string, unknown>} item
 */
export function mapMatchTypeRollupRow(item) {
  const impressions = Number(item[`${p}.impressions`] ?? 0);
  const clicks = Number(item[`${p}.clicks`] ?? 0);
  const spend = Number(item[`${p}.cost`] ?? 0);
  const orders = Number(item[`${p}.purchases14d`] ?? 0);
  const sales = Number(item[`${p}.sales14d`] ?? 0);
  const ctrRatio = impressions > 0 ? clicks / impressions : 0;
  const acosRatio = sales > 0 ? spend / sales : 0;
  return {
    matchType: item[`${p}.match_type`] || "—",
    impressions,
    clicks,
    spend,
    orders,
    sales,
    cpc: clicks > 0 ? spend / clicks : 0,
    ctrPct: ctrRatio * 100,
    acosPct: acosRatio * 100,
    roas: spend > 0 ? sales / spend : 0,
  };
}

/**
 * @param {Record<string, unknown>} item — raw Cube row
 */
export function mapSearchTermCubeRow(item) {
  return {
    term: item[`${p}.searchTerm`],
    matchType: item[`${p}.match_type`],
    impressions: Number(item[`${p}.impressions`] ?? 0),
    clicks: Number(item[`${p}.clicks`] ?? 0),
    spend: Number(item[`${p}.cost`] ?? 0),
    orders: Number(item[`${p}.purchases14d`] ?? 0),
    sales: Number(item[`${p}.sales14d`] ?? 0),
  };
}

/**
 * Merges rows that share the same search term (case-insensitive) and joins match types.
 * @param {Array<ReturnType<typeof mapSearchTermCubeRow>>} rows
 */
export function aggregateSearchTermsByTerm(rows) {
  const map = new Map();
  for (const r of rows) {
    if (r.term == null || r.term === "") continue;
    const k = String(r.term).toLowerCase();
    let cur = map.get(k);
    if (!cur) {
      cur = {
        displayTerm: String(r.term),
        matchTypes: new Set(),
        impressions: 0,
        clicks: 0,
        spend: 0,
        orders: 0,
        sales: 0,
      };
      map.set(k, cur);
    }
    if (r.matchType) cur.matchTypes.add(String(r.matchType));
    cur.impressions += r.impressions;
    cur.clicks += r.clicks;
    cur.spend += r.spend;
    cur.orders += r.orders;
    cur.sales += r.sales;
  }

  return Array.from(map.values()).map((a) => {
    const imp = a.impressions;
    const cl = a.clicks;
    const sp = a.spend;
    const sa = a.sales;
    const ctrRatio = imp > 0 ? cl / imp : 0;
    const acosRatio = sa > 0 ? sp / sa : 0;
    return {
      term: a.displayTerm,
      matchTypes: Array.from(a.matchTypes).sort().join(", ") || "—",
      network: null,
      impressions: imp,
      clicks: cl,
      spend: sp,
      orders: a.orders,
      sales: sa,
      cpc: cl > 0 ? sp / cl : 0,
      ctr: ctrRatio,
      ctrPct: ctrRatio * 100,
      acos: acosRatio,
      acosPct: acosRatio * 100,
      roas: sp > 0 ? sa / sp : 0,
    };
  });
}

export function parseSearchTermCubeResponse(rawData) {
  return aggregateSearchTermsByTerm(rawData.map(mapSearchTermCubeRow));
}
