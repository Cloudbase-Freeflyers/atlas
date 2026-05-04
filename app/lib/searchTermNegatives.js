function safeDiv(a, b) {
  return b === 0 ? 0 : a / b;
}

export function isAsinSearchTerm(term) {
  return /^b0[a-z0-9]{8}$/i.test(String(term).trim());
}

/**
 * @param {Array<{ term: string, sales?: number }>} keywords — targeting keywords (higher sales first)
 */
export function detectBrandHintFromKeywords(keywords) {
  if (!keywords?.length) return null;
  const sorted = keywords
    .slice()
    .sort((a, b) => (b.sales ?? 0) - (a.sales ?? 0));
  const stopWords = new Set([
    "for", "the", "and", "with", "women", "men", "size", "in", "a", "an", "of", "to", "on",
  ]);
  const tokenCount = {};
  sorted.slice(0, 20).forEach((k) => {
    String(k.term || "")
      .toLowerCase()
      .split(/\s+/)
      .forEach((tok) => {
        if (tok.length < 3 || stopWords.has(tok)) return;
        tokenCount[tok] = (tokenCount[tok] || 0) + (k.sales || 1);
      });
  });
  let bestTok = null;
  let bestScore = 0;
  Object.entries(tokenCount).forEach(([tok, score]) => {
    if (score > bestScore) {
      bestScore = score;
      bestTok = tok;
    }
  });
  return bestTok;
}

export function classifyNegativeReason(term, brandHint) {
  const t = String(term).toLowerCase();
  if (isAsinSearchTerm(t)) return "ASIN / product target";
  if (brandHint && t.includes(brandHint)) return `Branded (contains “${brandHint}”)`;
  if (/^[\d\s./-]+$/.test(t)) return "Numeric / size-style query";
  if (t.split(/\s+/).length <= 2) return "Very short — often generic";
  if (
    /sport|athletic|workout|gym|running|yoga|mens|men's|women's|womens/.test(t)
  ) {
    return "Category / audience mismatch (review)";
  }
  return "Non-converting — review";
}

/**
 * @param {Array<object>} rows — aggregated search term rows (see aggregateSearchTermsByTerm)
 */
export function buildNegativeTiers(rows, brandHint) {
  const high = rows
    .filter(
      (t) =>
        t.clicks >= 5 &&
        t.sales === 0 &&
        !isAsinSearchTerm(t.term) &&
        (!brandHint || !String(t.term).toLowerCase().includes(brandHint))
    )
    .sort((a, b) => b.spend - a.spend);

  const mediumAsin = rows
    .filter((t) => t.clicks >= 5 && t.sales === 0 && isAsinSearchTerm(t.term))
    .sort((a, b) => b.spend - a.spend);

  const low = rows
    .filter(
      (t) =>
        t.clicks >= 2 &&
        t.clicks < 5 &&
        t.sales === 0 &&
        !isAsinSearchTerm(t.term)
    )
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 50);

  const highAcos = rows
    .filter(
      (t) =>
        t.sales > 0 &&
        t.clicks >= 5 &&
        safeDiv(t.spend, t.sales) > 0.5
    )
    .sort(
      (a, b) =>
        safeDiv(b.spend, b.sales) - safeDiv(a.spend, a.sales)
    )
    .slice(0, 30);

  return { high, mediumAsin, low, highAcos };
}

export function wastedSpendSummary(rows, tiers, totalSpendDenom) {
  const totalWasted = rows
    .filter((t) => t.sales === 0 && t.clicks >= 1)
    .reduce((a, t) => a + t.spend, 0);
  const highW = tiers.high.reduce((a, t) => a + t.spend, 0);
  const medW = tiers.mediumAsin.reduce((a, t) => a + t.spend, 0);
  const lowW = tiers.low.reduce((a, t) => a + t.spend, 0);
  const haSpend = tiers.highAcos.reduce((a, t) => a + t.spend, 0);
  const denom = totalSpendDenom > 0 ? totalSpendDenom : 1;

  return [
    {
      tier: "High priority",
      description: "5+ clicks, $0 sales, non-branded, non-ASIN",
      count: tiers.high.length,
      wastedSpend: highW,
      pctSpend: highW / denom,
      action: "Negate or isolate",
    },
    {
      tier: "Medium priority",
      description: "5+ clicks, $0 sales, ASIN-shaped term",
      count: tiers.mediumAsin.length,
      wastedSpend: medW,
      pctSpend: medW / denom,
      action: "Negate competitor ASIN targets",
    },
    {
      tier: "Low priority",
      description: "2–4 clicks, $0 sales (watch list)",
      count: tiers.low.length,
      wastedSpend: lowW,
      pctSpend: lowW / denom,
      action: "Monitor",
    },
    {
      tier: "High ACOS",
      description: "Selling but ACOS > 50%",
      count: tiers.highAcos.length,
      wastedSpend: haSpend,
      pctSpend: haSpend / denom,
      action: "Lower bids",
    },
    {
      tier: "Total zero-sale click spend",
      description: "All terms with clicks and $0 sales",
      count: rows.filter((t) => t.sales === 0 && t.clicks >= 1).length,
      wastedSpend: totalWasted,
      pctSpend: totalWasted / denom,
      action: "—",
    },
  ];
}

export function buildTopPerformers(rows, { minOrders = 1, minRoas = 3, limit = 50 } = {}) {
  return rows
    .filter((t) => t.orders >= minOrders && t.roas >= minRoas)
    .sort((a, b) => b.sales - a.sales)
    .slice(0, limit)
    .map((t) => {
      let action = "Harvest as exact match";
      const mt = String(t.matchTypes || "").toLowerCase();
      if (mt.includes("exact")) action = "Already exact — tune bid";
      else if (t.roas > 15) action = "Strong ROAS — scale exact";
      return { ...t, action };
    });
}
