const APIFY_BASE = "https://api.apify.com/v2";

export const ACTORS = {
  KEYWORD_TRACKER: "sovereigntaylor/amazon-keyword-tracker",
};

async function apifyFetch(path, options = {}) {
  const token = process.env.APIFY_API_KEY;
  if (!token) throw new Error("APIFY_API_KEY environment variable is not set");

  const sep = path.includes("?") ? "&" : "?";
  const url = `${APIFY_BASE}${path}${sep}token=${token}`;

  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Apify ${res.status}: ${text.slice(0, 300)}`);
  }

  return res.json();
}

/**
 * Start a keyword rank tracker actor run.
 * @param {{ keywords: string[], trackASINs?: string[], domain?: string, maxResultsPerKeyword?: number }} params
 * @returns {{ runId: string, datasetId: string, status: string }}
 */
export async function runKeywordTracker({
  keywords,
  trackASINs = [],
  domain = "amazon.com",
  maxResultsPerKeyword = 48,
}) {
  const data = await apifyFetch(`/acts/${ACTORS.KEYWORD_TRACKER}/runs`, {
    method: "POST",
    body: JSON.stringify({ keywords, trackASINs, domain, maxResultsPerKeyword }),
  });
  return {
    runId: data.data.id,
    datasetId: data.data.defaultDatasetId,
    status: data.data.status,
  };
}

/**
 * Get the current status of an actor run.
 * @param {string} runId
 * @returns {{ runId: string, status: string, datasetId: string, finishedAt: string|null }}
 */
export async function getRunStatus(runId) {
  const data = await apifyFetch(`/actor-runs/${runId}`);
  return {
    runId: data.data.id,
    status: data.data.status,
    datasetId: data.data.defaultDatasetId,
    finishedAt: data.data.finishedAt ?? null,
  };
}

/**
 * Fetch items from an Apify dataset.
 * @param {string} datasetId
 * @param {{ limit?: number, offset?: number }} opts
 * @returns {Array}
 */
export async function fetchDatasetItems(datasetId, { limit = 2000, offset = 0 } = {}) {
  const data = await apifyFetch(
    `/datasets/${datasetId}/items?limit=${limit}&offset=${offset}&format=json`
  );
  return Array.isArray(data) ? data : (data.items ?? []);
}
