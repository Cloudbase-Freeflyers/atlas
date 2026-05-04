/**
 * Shared Cube.js payloads for AdsSearchTermReports (Atlas UI).
 * Network/ad_type is omitted until exposed on this cube in Cube meta.
 */

export const ADS_SEARCH_TERM_PREFIX = "AdsSearchTermReports";

/** Dimensions + measures for per–search-term + match type rows (aggregated client-side by term). */
export const SEARCH_TERM_DETAIL_MEASURES = [
  `${ADS_SEARCH_TERM_PREFIX}.impressions`,
  `${ADS_SEARCH_TERM_PREFIX}.clicks`,
  `${ADS_SEARCH_TERM_PREFIX}.cost`,
  `${ADS_SEARCH_TERM_PREFIX}.purchases14d`,
  `${ADS_SEARCH_TERM_PREFIX}.sales14d`,
];

export function buildSearchTermDetailPayload({ filters, timeDimensions }) {
  return {
    dimensions: [
      `${ADS_SEARCH_TERM_PREFIX}.searchTerm`,
      `${ADS_SEARCH_TERM_PREFIX}.match_type`,
    ],
    measures: SEARCH_TERM_DETAIL_MEASURES,
    order: { [`${ADS_SEARCH_TERM_PREFIX}.cost`]: "desc" },
    limit: 25_000,
    filters,
    timeDimensions,
  };
}

/** Rollup by match type only (one row per match type). */
export function buildMatchTypeRollupPayload({ filters, timeDimensions }) {
  return {
    dimensions: [`${ADS_SEARCH_TERM_PREFIX}.match_type`],
    measures: [...SEARCH_TERM_DETAIL_MEASURES],
    filters,
    timeDimensions,
  };
}

/** Client `useData` payload (filters + timeDimensions added by the hook). */
export const searchTermDetailClientPayload = {
  dimensions: [
    `${ADS_SEARCH_TERM_PREFIX}.searchTerm`,
    `${ADS_SEARCH_TERM_PREFIX}.match_type`,
  ],
  measures: [...SEARCH_TERM_DETAIL_MEASURES],
  order: { [`${ADS_SEARCH_TERM_PREFIX}.cost`]: "desc" },
  limit: 25_000,
};

export const matchTypeRollupClientPayload = {
  dimensions: [`${ADS_SEARCH_TERM_PREFIX}.match_type`],
  measures: [...SEARCH_TERM_DETAIL_MEASURES],
};
