const STOP = new Set([
  "the",
  "and",
  "for",
  "with",
  "from",
  "this",
  "that",
  "a",
  "an",
  "of",
  "to",
  "in",
  "on",
  "at",
  "or",
  "is",
  "it",
  "as",
  "be",
]);

function tokenize(term) {
  return String(term)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 0 && !STOP.has(t));
}

function ngrams(tokens, minN, maxN) {
  const out = new Set();
    for (let n = minN; n <= maxN; n++) {
    for (let i = 0; i + n <= tokens.length; i++) {
      out.add(tokens.slice(i, i + n).join(" "));
    }
  }
  return out;
}

/**
 * Rolls 2- and 3-word phrases: each source term’s metrics are added to every phrase it contains
 * (useful for ranking phrase importance; row totals will not match account totals).
 */
export function buildPhraseRollup(rows, { minN = 2, maxN = 3 } = {}) {
  const acc = new Map();
  for (const row of rows) {
    const tok = tokenize(row.term);
    if (tok.length < minN) continue;
    const phrases = ngrams(tok, minN, maxN);
    for (const phrase of phrases) {
      if (phrase.length < 3) continue;
      const cur = acc.get(phrase) || {
        phrase,
        impressions: 0,
        clicks: 0,
        spend: 0,
        orders: 0,
        sales: 0,
      };
      cur.impressions += row.impressions;
      cur.clicks += row.clicks;
      cur.spend += row.spend;
      cur.orders += row.orders;
      cur.sales += row.sales;
      acc.set(phrase, cur);
    }
  }

  return Array.from(acc.values()).map((a) => {
    const imp = a.impressions;
    const cl = a.clicks;
    const sp = a.spend;
    const sa = a.sales;
    const ctrRatio = imp > 0 ? cl / imp : 0;
    const acosRatio = sa > 0 ? sp / sa : 0;
    return {
      phrase: a.phrase,
      network: null,
      impressions: imp,
      clicks: cl,
      spend: sp,
      orders: a.orders,
      sales: sa,
      cpc: cl > 0 ? sp / cl : 0,
      ctrPct: ctrRatio * 100,
      acosPct: acosRatio * 100,
      roas: sp > 0 ? sa / sp : 0,
    };
  });
}
