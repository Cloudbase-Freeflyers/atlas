"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import DataTable from "../DataTable";
import LineChart from "../LineChart";
import AIPageBrief from "../ai/AIPageBrief";
import AIRowAction from "../ai/AIRowAction";
import KeywordHarvestPanel from "../ai/KeywordHarvestPanel";
import { useData } from "@/hooks/useData.js";
import { useFilters } from "@/lib/FiltersContext.js";
import { Play, RefreshCw, Loader2, ChevronDown, ChevronUp, CheckCircle2, XCircle } from "lucide-react";
import {
  ADS_DAILY_GRAPH_MEASURES,
  mapAdsCampaignDailyGraphRow,
} from "@/lib/mapAdsDailyGraphRow.js";
import { mapKeywordDailyRow } from "@/lib/mapAdsEntityDaily.js";
import {
  searchTermDetailClientPayload,
  matchTypeRollupClientPayload,
} from "@/lib/searchTermQuery.js";
import {
  parseSearchTermCubeResponse,
  mapMatchTypeRollupRow,
} from "@/lib/searchTermAggregate.js";
import { buildPhraseRollup } from "@/lib/searchTermNgrams.js";
import {
  buildNegativeTiers,
  buildTopPerformers,
  classifyNegativeReason,
  detectBrandHintFromKeywords,
  wastedSpendSummary,
} from "@/lib/searchTermNegatives.js";

const navTabs = [
  { label: "Overall KPIs", href: "/reports/overall-kpis" },
  { label: "Ads Overview", href: "/reports/ads-overview" },
  { label: "Seller Central Overview", href: "/reports/seller-central" },
  { label: "Keywords And Search Terms", href: "/reports/keywords" },
  { label: "Campaigns", href: "/reports/campaigns" },
  { label: "Top ASINs", href: "/reports/top-asins" },
  { label: "Insights", href: "/reports/callouts" },
];

const VIEWS = [
  { id: "targeting", label: "Targeting keywords" },
  { id: "searchTerms", label: "Search terms" },
  { id: "negatives", label: "Negative candidates" },
  { id: "phrases", label: "Core phrases" },
  { id: "matchTypes", label: "Match types" },
  { id: "performers", label: "Top performers" },
  { id: "competitors", label: "Competitor ranks" },
];

// ─── Apify / localStorage helpers (shared with share-of-voice page) ───────────

function apifyStorageKey(companyId) {
  return `atlas_apify_${companyId}`;
}

function loadApifyState(companyId) {
  if (typeof window === "undefined" || !companyId) return null;
  try {
    const raw = localStorage.getItem(apifyStorageKey(companyId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persistApifyState(companyId, patch) {
  if (typeof window === "undefined" || !companyId) return;
  try {
    const existing = loadApifyState(companyId) ?? {};
    localStorage.setItem(apifyStorageKey(companyId), JSON.stringify({ ...existing, ...patch }));
  } catch {}
}

function processCompetitorItems(items) {
  const byKeyword = {};
  for (const item of items) {
    const kw = item.keyword;
    if (!kw) continue;
    if (!byKeyword[kw]) byKeyword[kw] = { keyword: kw, mine: [], rivals: [] };
    if (item.isTrackedASIN) byKeyword[kw].mine.push(item);
    else byKeyword[kw].rivals.push(item);
  }
  return Object.values(byKeyword).map(({ keyword, mine, rivals }) => ({
    keyword,
    myBestPosition: mine.sort((a, b) => a.position - b.position)[0]?.position ?? null,
    myAsin: mine[0]?.asin ?? null,
    rivals: rivals
      .sort((a, b) => a.position - b.position)
      .slice(0, 8)
      .map((r) => ({
        asin: r.asin,
        title: r.title,
        position: r.position,
        isSponsored: r.isSponsored,
        rating: r.rating,
        reviewCount: r.reviewCount,
        imageUrl: r.imageUrl,
      })),
  }));
}

function CompetitorsPanel({ keywords, asins, companyId }) {
  const [runState, setRunState] = useState(null);
  const [items, setItems] = useState(null);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState(null);
  const [expandedKw, setExpandedKw] = useState(null);
  const pollRef = useRef(null);

  useEffect(() => {
    if (!companyId) return;
    const saved = loadApifyState(companyId);
    if (saved?.runState) setRunState(saved.runState);
  }, [companyId]);

  const stopPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    setPolling(false);
  }, []);

  const fetchResults = useCallback(async (runId) => {
    try {
      const res = await fetch(`/api/apify/results?runId=${runId}`);
      const data = await res.json();
      setRunState((prev) => ({ ...prev, status: data.status }));
      persistApifyState(companyId, { runState: { ...runState, status: data.status } });
      if (data.status === "SUCCEEDED") {
        stopPolling();
        setItems(data.items ?? []);
      } else if (["FAILED", "ABORTED", "TIMED-OUT"].includes(data.status)) {
        stopPolling();
        setError(`Run ${data.status.toLowerCase()}. Try again.`);
      }
    } catch (err) {
      stopPolling();
      setError(err.message);
    }
  }, [companyId, runState, stopPolling]);

  const handleRun = useCallback(async () => {
    if (!keywords?.length) return;
    setError(null);
    setItems(null);
    try {
      const res = await fetch("/api/apify/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords: keywords.slice(0, 50), asins: asins?.slice(0, 20) ?? [] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to start run");
      const newRunState = { runId: data.runId, datasetId: data.datasetId, status: data.status, scrapedAt: new Date().toISOString() };
      setRunState(newRunState);
      setPolling(true);
      persistApifyState(companyId, { runState: newRunState });
      pollRef.current = setInterval(() => fetchResults(data.runId), 15_000);
    } catch (err) {
      setError(err.message);
    }
  }, [keywords, asins, companyId, fetchResults]);

  const handleLoadExisting = useCallback(async () => {
    if (!runState?.datasetId) return;
    try {
      const res = await fetch(`/api/apify/results?datasetId=${runState.datasetId}`);
      const data = await res.json();
      setItems(data.items ?? []);
    } catch (err) {
      setError(err.message);
    }
  }, [runState]);

  useEffect(() => () => stopPolling(), [stopPolling]);

  const processed = useMemo(() => (items ? processCompetitorItems(items) : []), [items]);
  const isRunning = polling || (runState?.status && !["SUCCEEDED", "FAILED", "ABORTED"].includes(runState.status));
  const hasRan = runState?.status === "SUCCEEDED";

  return (
    <div className="tw:space-y-4">
      <div className="tw:flex tw:items-center tw:justify-between tw:gap-4">
        <div>
          <p className="tw:text-sm tw:text-muted-foreground">
            See who holds page-1 positions on your targeted keywords. Data from live Amazon SERP scraping via Apify.
          </p>
          {runState?.scrapedAt && (
            <p className="tw:text-xs tw:text-zinc-600 tw:mt-1">
              Last scan: {new Date(runState.scrapedAt).toLocaleString()}
            </p>
          )}
        </div>
        <div className="tw:flex tw:items-center tw:gap-2 tw:flex-shrink-0">
          {runState?.status && (
            <span className={`tw:flex tw:items-center tw:gap-1 tw:text-xs tw:font-medium ${
              runState.status === "SUCCEEDED" ? "tw:text-emerald-400" :
              ["FAILED", "ABORTED"].includes(runState.status) ? "tw:text-red-400" : "tw:text-yellow-400"
            }`}>
              {runState.status === "SUCCEEDED" ? <CheckCircle2 size={12} /> :
               ["FAILED", "ABORTED"].includes(runState.status) ? <XCircle size={12} /> :
               <Loader2 size={12} className="tw:animate-spin" />}
              {runState.status}
            </span>
          )}
          {hasRan && !items && (
            <button type="button" onClick={handleLoadExisting}
              className="tw:text-xs tw:px-3 tw:py-1.5 tw:rounded-lg tw:bg-zinc-800 hover:tw:bg-zinc-700 tw:text-zinc-300 tw:transition-colors">
              Load results
            </button>
          )}
          <button
            type="button"
            onClick={handleRun}
            disabled={isRunning || !keywords?.length}
            className="tw:flex tw:items-center tw:gap-2 tw:px-4 tw:py-2 tw:rounded-xl tw:bg-cyan-500 hover:tw:bg-cyan-400 tw:text-zinc-950 tw:text-sm tw:font-semibold tw:transition-colors disabled:tw:opacity-50 disabled:tw:cursor-not-allowed"
          >
            {isRunning ? <><Loader2 size={14} className="tw:animate-spin" /> Scanning…</> :
             items ? <><RefreshCw size={14} /> Re-scan</> : <><Play size={14} /> Scan Competitors</>}
          </button>
        </div>
      </div>

      {error && (
        <div className="tw:rounded-xl tw:border tw:border-red-500/30 tw:bg-red-500/10 tw:px-4 tw:py-3 tw:text-sm tw:text-red-400">
          {error}
        </div>
      )}

      {isRunning && !processed.length && (
        <div className="tw:rounded-2xl tw:border tw:border-white/[0.07] tw:bg-zinc-900/50 tw:p-8 tw:flex tw:flex-col tw:items-center tw:gap-3">
          <Loader2 size={24} className="tw:animate-spin tw:text-cyan-400" />
          <p className="tw:text-zinc-500 tw:text-sm">Scanning {keywords?.length ?? 0} keywords on Amazon… (2–8 min)</p>
        </div>
      )}

      {processed.length > 0 && (
        <div className="tw:rounded-2xl tw:border tw:border-white/[0.07] tw:bg-zinc-900 tw:overflow-hidden">
          <div className="tw:overflow-x-auto">
            <table className="tw:w-full tw:text-sm">
              <thead>
                <tr className="tw:border-b tw:border-white/[0.05]">
                  {["Keyword", "Your position", "Your ASIN", "Competitors on page 1"].map((h) => (
                    <th key={h} className="tw:text-left tw:px-5 tw:py-3 tw:text-[10px] tw:uppercase tw:tracking-widest tw:text-zinc-600 tw:font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {processed.map((row) => (
                  <tr key={row.keyword} className="tw:border-b tw:border-white/[0.03] hover:tw:bg-white/[0.02] tw:transition-colors tw:align-top">
                    <td className="tw:px-5 tw:py-3 tw:text-zinc-200 tw:font-medium tw:whitespace-nowrap">{row.keyword}</td>
                    <td className="tw:px-5 tw:py-3">
                      {row.myBestPosition != null ? (
                        <span className={`tw:text-sm tw:font-bold ${row.myBestPosition <= 3 ? "tw:text-emerald-400" : row.myBestPosition <= 10 ? "tw:text-yellow-400" : "tw:text-zinc-400"}`}>
                          #{row.myBestPosition}
                        </span>
                      ) : (
                        <span className="tw:text-zinc-600 tw:text-sm">Not found</span>
                      )}
                    </td>
                    <td className="tw:px-5 tw:py-3 tw:text-zinc-500 tw:text-xs tw:font-mono">{row.myAsin ?? "—"}</td>
                    <td className="tw:px-5 tw:py-3 tw:max-w-xs">
                      <button
                        type="button"
                        onClick={() => setExpandedKw(expandedKw === row.keyword ? null : row.keyword)}
                        className="tw:flex tw:items-center tw:gap-1 tw:text-xs tw:text-zinc-400 hover:tw:text-zinc-200 tw:transition-colors tw:mb-1"
                      >
                        {row.rivals.length} ASINs {expandedKw === row.keyword ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>
                      {expandedKw === row.keyword && (
                        <div className="tw:space-y-1.5 tw:mt-1">
                          {row.rivals.map((r, idx) => (
                            <div key={r.asin ?? idx} className="tw:flex tw:items-center tw:gap-2">
                              <span className="tw:text-zinc-600 tw:text-xs tw:w-5 tw:text-right">{r.position}</span>
                              <span className={`tw:text-[10px] tw:px-1 tw:rounded tw:font-medium ${r.isSponsored ? "tw:bg-cyan-500/20 tw:text-cyan-400" : "tw:bg-zinc-700 tw:text-zinc-400"}`}>
                                {r.isSponsored ? "S" : "O"}
                              </span>
                              {r.imageUrl && <img src={r.imageUrl} alt="" className="tw:w-6 tw:h-6 tw:object-contain tw:rounded tw:bg-zinc-800 tw:flex-shrink-0" />}
                              <span className="tw:text-xs tw:text-zinc-400 tw:truncate tw:max-w-[160px]">{r.title || r.asin}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!isRunning && !processed.length && !hasRan && (
        <div className="tw:rounded-2xl tw:border tw:border-dashed tw:border-white/10 tw:p-8 tw:text-center">
          <p className="tw:text-zinc-600 tw:text-sm">No scan data yet. Click "Scan Competitors" to see who ranks on your keywords.</p>
        </div>
      )}
    </div>
  );
}

const targetingColumns = [
  { key: "term", label: "Target term" },
  { key: "match", label: "Match type" },
  { key: "spend", label: "Spend", formatter: "currency" },
  { key: "clicks", label: "Clicks", formatter: "compact" },
  { key: "orders", label: "Orders", formatter: "compact" },
  { key: "sales", label: "Sales", formatter: "currency" },
  { key: "conversion", label: "CVR", formatter: "percent" },
  { key: "roas", label: "ROAS", formatter: "percent" },
  { key: "ctr", label: "CTR", formatter: "percent" },
  { key: "_ai", label: "", render: (row) => <AIRowAction type="keyword" row={row} /> },
];

const searchTermColumns = [
  { key: "term", label: "Search term" },
  { key: "network", label: "Network" },
  { key: "matchTypes", label: "Match types" },
  { key: "impressions", label: "Impressions", formatter: "compact" },
  { key: "clicks", label: "Clicks", formatter: "compact" },
  { key: "ctrPct", label: "CTR", formatter: "percent" },
  { key: "spend", label: "Spend", formatter: "currency" },
  { key: "cpc", label: "CPC", formatter: "currency" },
  { key: "orders", label: "Orders", formatter: "compact" },
  { key: "sales", label: "Sales", formatter: "currency" },
  { key: "acosPct", label: "ACOS", formatter: "percent" },
  { key: "roas", label: "ROAS", formatter: "decimal" },
];

const matchTypeColumns = [
  { key: "matchType", label: "Match type" },
  { key: "impressions", label: "Impressions", formatter: "compact" },
  { key: "clicks", label: "Clicks", formatter: "compact" },
  { key: "ctrPct", label: "CTR", formatter: "percent" },
  { key: "spend", label: "Spend", formatter: "currency" },
  { key: "cpc", label: "CPC", formatter: "currency" },
  { key: "orders", label: "Orders", formatter: "compact" },
  { key: "sales", label: "Sales", formatter: "currency" },
  { key: "acosPct", label: "ACOS", formatter: "percent" },
  { key: "roas", label: "ROAS", formatter: "decimal" },
];

const phraseColumns = [
  { key: "phrase", label: "Phrase" },
  { key: "network", label: "Network" },
  { key: "impressions", label: "Impressions", formatter: "compact" },
  { key: "clicks", label: "Clicks", formatter: "compact" },
  { key: "ctrPct", label: "CTR", formatter: "percent" },
  { key: "spend", label: "Spend", formatter: "currency" },
  { key: "cpc", label: "CPC", formatter: "currency" },
  { key: "orders", label: "Orders", formatter: "compact" },
  { key: "sales", label: "Sales", formatter: "currency" },
  { key: "acosPct", label: "ACOS", formatter: "percent" },
  { key: "roas", label: "ROAS", formatter: "decimal" },
];

const performerColumns = [
  { key: "term", label: "Search term" },
  { key: "matchTypes", label: "Match types" },
  { key: "impressions", label: "Impressions", formatter: "compact" },
  { key: "clicks", label: "Clicks", formatter: "compact" },
  { key: "spend", label: "Spend", formatter: "currency" },
  { key: "orders", label: "Orders", formatter: "compact" },
  { key: "sales", label: "Sales", formatter: "currency" },
  { key: "acosPct", label: "ACOS", formatter: "percent" },
  { key: "roas", label: "ROAS", formatter: "decimal" },
  { key: "action", label: "Suggested action" },
];

const keywordDailyPayload = {
  dimensions: [
    "AdsKeywordReports.keyword_id",
    "AdsKeywordReports.keyword_text",
  ],
  measures: [
    "AdsKeywordReports.cost",
    "AdsKeywordReports.clicks",
    "AdsKeywordReports.sales14d",
    "AdsKeywordReports.purchases14d",
    "AdsKeywordReports.ctr",
    "AdsKeywordReports.cpc",
    "AdsKeywordReports.acos",
    "AdsKeywordReports.roas",
  ],
  order: { "AdsKeywordReports.report_date": "asc" },
};

function networkCell(v) {
  if (v == null || v === "") return "—";
  return String(v);
}

export default function ReportKeywords({ initialData }) {
  const { companyId } = useFilters();
  const [selectedKeywordId, setSelectedKeywordId] = useState(null);
  const [view, setView] = useState("targeting");

  const { data: keywords, isLoading } = useData(
    {
      dimensions: [
        "AdsKeywordReports.keyword_id",
        "AdsKeywordReports.keyword_text",
        "AdsKeywordReports.match_type",
      ],
      measures: [
        "AdsKeywordReports.clicks",
        "AdsKeywordReports.cost",
        "AdsKeywordReports.purchases14d",
        "AdsKeywordReports.sales14d",
        "AdsKeywordReports.roas",
        "AdsKeywordReports.ctr",
        "AdsKeywordReports.cpc",
        "AdsKeywordReports.acos",
      ],
    },
    (data) =>
      data.map((item) => {
        const clicks = item["AdsKeywordReports.clicks"];
        const orders = item["AdsKeywordReports.purchases14d"];
        return {
          id: item["AdsKeywordReports.keyword_id"],
          term: item["AdsKeywordReports.keyword_text"],
          match: item["AdsKeywordReports.match_type"],
          spend: item["AdsKeywordReports.cost"],
          clicks,
          orders,
          sales: item["AdsKeywordReports.sales14d"],
          roas: item["AdsKeywordReports.roas"],
          ctr: item["AdsKeywordReports.ctr"],
          conversion: clicks > 0 ? (orders / clicks) * 100 : 0,
        };
      }),
    "keywrds",
    "AdsKeywordReports.report_date",
    true,
    { initialData: initialData?.keywords }
  );

  const { data: graphData } = useData(
    {
      measures: [...ADS_DAILY_GRAPH_MEASURES],
      dimensions: ["AdsCampaignReports.report_date"],
    },
    (rows) => rows.map(mapAdsCampaignDailyGraphRow),
    "adsGraphs",
    "AdsCampaignReports.report_date",
    true,
    { initialData: initialData?.graphData }
  );

  const { data: keywordDaily } = useData(
    keywordDailyPayload,
    (rows) => rows.map(mapKeywordDailyRow),
    "keyworddaily",
    "AdsKeywordReports.report_date",
    true,
    { initialData: initialData?.keywordDaily }
  );

  const { data: searchTerms, isLoading: searchTermsLoading } = useData(
    searchTermDetailClientPayload,
    parseSearchTermCubeResponse,
    "searchtermsagg",
    "AdsSearchTermReports.report_date",
    false,
    { initialData: initialData?.searchTerms }
  );

  const { data: matchTypeRollup, isLoading: matchTypesLoading } = useData(
    matchTypeRollupClientPayload,
    (rows) => rows.map(mapMatchTypeRollupRow),
    "searchtermmatchrollup",
    "AdsSearchTermReports.report_date",
    false,
    { initialData: initialData?.matchTypeRollup }
  );

  useEffect(() => {
    if (selectedKeywordId != null || !keywords?.length) return;
    setSelectedKeywordId(String(keywords[0].id));
  }, [keywords, selectedKeywordId]);

  const entitySeries = useMemo(() => {
    if (!keywordDaily?.length || selectedKeywordId == null) return [];
    return keywordDaily
      .filter((r) => String(r.keywordId) === String(selectedKeywordId))
      .sort((a, b) => (a.sortKey ?? 0) - (b.sortKey ?? 0));
  }, [keywordDaily, selectedKeywordId]);

  const selectedTerm = keywords?.find(
    (k) => String(k.id) === String(selectedKeywordId)
  )?.term;

  const brandHint = useMemo(
    () => detectBrandHintFromKeywords(keywords ?? []),
    [keywords]
  );

  const searchTermsForDisplay = useMemo(() => {
    const rows = searchTerms ?? [];
    return rows.map((r) => ({
      ...r,
      network: networkCell(r.network),
    }));
  }, [searchTerms]);

  const searchTermsTopSales = useMemo(() => {
    return searchTermsForDisplay
      .slice()
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 100);
  }, [searchTermsForDisplay]);

  const tiers = useMemo(
    () =>
      searchTerms?.length
        ? buildNegativeTiers(searchTerms, brandHint)
        : { high: [], mediumAsin: [], low: [], highAcos: [] },
    [searchTerms, brandHint]
  );

  const totalSearchSpend = useMemo(
    () => searchTermsForDisplay.reduce((a, r) => a + r.spend, 0),
    [searchTermsForDisplay]
  );

  const wasteSummary = useMemo(
    () =>
      searchTerms?.length
        ? wastedSpendSummary(searchTerms, tiers, totalSearchSpend)
        : [],
    [searchTerms, tiers, totalSearchSpend]
  );

  const topPerformers = useMemo(
    () => (searchTerms?.length ? buildTopPerformers(searchTerms) : []),
    [searchTerms]
  );

  const phraseRollup = useMemo(
    () => (searchTerms?.length ? buildPhraseRollup(searchTerms) : []),
    [searchTerms]
  );

  const phraseWinners = useMemo(() => {
    return phraseRollup.slice().sort((a, b) => b.sales - a.sales).slice(0, 150);
  }, [phraseRollup]);

  const phraseWaste = useMemo(() => {
    return phraseRollup
      .filter((p) => p.clicks >= 5 && p.sales === 0)
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 100)
      .map((r) => ({
        ...r,
        network: networkCell(r.network),
      }));
  }, [phraseRollup]);

  const phraseWinnersDisplay = useMemo(() => {
    return phraseWinners.map((r) => ({
      ...r,
      network: networkCell(r.network),
    }));
  }, [phraseWinners]);

  const detailColsNeg = [
    { key: "term", label: "Search term" },
    { key: "network", label: "Network" },
    { key: "impressions", label: "Impressions", formatter: "compact" },
    { key: "clicks", label: "Clicks", formatter: "compact" },
    { key: "cpc", label: "CPC", formatter: "currency" },
    { key: "spend", label: "Spend", formatter: "currency" },
    { key: "reason", label: "Reason" },
    { key: "matchTypes", label: "Match types" },
  ];

  const highRows = useMemo(() => {
    return tiers.high.slice(0, 100).map((t) => ({
      ...t,
      network: networkCell(t.network),
      reason: classifyNegativeReason(t.term, brandHint),
    }));
  }, [tiers.high, brandHint]);

  const medRows = useMemo(() => {
    return tiers.mediumAsin.slice(0, 50).map((t) => ({
      ...t,
      network: networkCell(t.network),
      term: String(t.term).toUpperCase(),
      reason: "Competitor ASIN — not converting",
    }));
  }, [tiers.mediumAsin]);

  const lowRows = useMemo(() => {
    return tiers.low.map((t) => ({
      ...t,
      network: networkCell(t.network),
      reason: classifyNegativeReason(t.term, brandHint),
    }));
  }, [tiers.low, brandHint]);

  const highAcosCols = [
    { key: "term", label: "Search term" },
    { key: "impressions", label: "Impressions", formatter: "compact" },
    { key: "clicks", label: "Clicks", formatter: "compact" },
    { key: "spend", label: "Spend", formatter: "currency" },
    { key: "sales", label: "Sales", formatter: "currency" },
    { key: "orders", label: "Orders", formatter: "compact" },
    { key: "acosPct", label: "ACOS", formatter: "percent" },
    { key: "roas", label: "ROAS", formatter: "decimal" },
  ];

  const summaryColumns = [
    { key: "tier", label: "Tier" },
    { key: "description", label: "Description" },
    { key: "count", label: "# Rows", formatter: "compact" },
    { key: "wastedSpend", label: "Spend ($)", formatter: "currency" },
    { key: "pctSpend", label: "% of search spend", formatter: "percent" },
    { key: "action", label: "Action" },
  ];

  const summaryRows = useMemo(
    () =>
      wasteSummary.map((w) => ({
        ...w,
        pctSpend: w.pctSpend * 100,
      })),
    [wasteSummary]
  );

  if (isLoading) {
    return (
      <div className="grid" style={{ gap: 20 }}>
        <div className="card">
          <div className="card-inner">
            <p className="reports-loading">Loading…</p>
          </div>
        </div>
      </div>
    );
  }

  const briefMetrics = useMemo(() => {
    if (!keywords?.length) return {};
    const totSpend = keywords.reduce((s, k) => s + (parseFloat(k.spend) || 0), 0);
    const avgAcos = keywords.reduce((s, k) => s + (parseFloat(k.acos) || 0), 0) / keywords.length;
    const wastedTotal = tiers.high.reduce((s, t) => s + (parseFloat(t.spend) || 0), 0);
    return {
      "Keyword Count": keywords.length,
      "Total Keyword Spend": totSpend,
      "Avg ACOS": avgAcos,
      "Wasted Spend (zero-order terms)": wastedTotal,
      "Negative Candidates": tiers.high.length,
    };
  }, [keywords, tiers]);

  return (
    <div className="grid" style={{ gap: 20 }}>
      <AIPageBrief page="keywords" metrics={briefMetrics} title="Keyword Intelligence Brief" />

      <div className="card">
        <div className="card-inner">
          <div className="reports-keyword-toolbar">
            <span className="reports-keyword-toolbar-label">Report view</span>
            <div
              className="reports-keyword-pill-wrap"
              role="tablist"
              aria-label="Keyword and search term report views"
            >
              {VIEWS.flatMap((v, i) => {
                const tab = (
                  <button
                    key={v.id}
                    type="button"
                    role="tab"
                    id={`kw-view-${v.id}`}
                    aria-selected={view === v.id}
                    className="reports-keyword-pill"
                    data-active={view === v.id ? "true" : "false"}
                    onClick={() => setView(v.id)}
                  >
                    {v.label}
                  </button>
                );
                if (i === 4) {
                  return [
                    <span
                      key="kw-view-sep"
                      className="reports-keyword-pill-sep"
                      aria-hidden
                    />,
                    tab,
                  ];
                }
                return tab;
              })}
            </div>
            <p className="reports-keyword-toolbar-caption">
              Search terms and rollups use the date range from the header filters.
            </p>
          </div>

          {view === "targeting" && (
            <>
              <p className="reports-keyword-view-hint">
                Active targeting keywords for the selected period. Use the chart below
                to compare spend and sales for a single keyword.
              </p>
              <DataTable columns={targetingColumns} rows={keywords} />
            </>
          )}

          {view === "searchTerms" && (
            <>
              <p className="tw:text-sm tw:text-muted-foreground tw:mb-3">
                Top 100 customer search terms by sales (14d). Network shows “—”
                unless your Cube schema exposes ad type on search term rows.
              </p>
              {searchTermsLoading ? (
                <p className="reports-loading">Loading search terms…</p>
              ) : (
                <DataTable
                  columns={searchTermColumns}
                  rows={searchTermsTopSales}
                  initialPageSize={100}
                />
              )}
              {!searchTermsLoading && <KeywordHarvestPanel searchTerms={searchTerms} />}
            </>
          )}

          {view === "negatives" && (
            <>
              <p className="tw:text-sm tw:text-muted-foreground tw:mb-3">
                Tiered candidates from search term performance (mirrors bulk
                sheet logic). Review before negating in Seller Central.
              </p>
              {searchTermsLoading ? (
                <p className="reports-loading">Loading…</p>
              ) : (
                <>
                  <h3 className="tw:text-sm tw:font-semibold tw:mb-2">
                    Wasted spend summary
                  </h3>
                  <DataTable
                    columns={summaryColumns}
                    rows={summaryRows}
                    allowPagination={false}
                  />
                  <h3 className="tw:text-sm tw:font-semibold tw:mt-6 tw:mb-2">
                    High priority
                  </h3>
                  <DataTable
                    columns={detailColsNeg}
                    rows={highRows}
                    initialPageSize={100}
                  />
                  <h3 className="tw:text-sm tw:font-semibold tw:mt-6 tw:mb-2">
                    Medium priority (ASIN-shaped)
                  </h3>
                  <DataTable columns={detailColsNeg} rows={medRows} />
                  <h3 className="tw:text-sm tw:font-semibold tw:mt-6 tw:mb-2">
                    Low priority (watch list)
                  </h3>
                  <DataTable columns={detailColsNeg} rows={lowRows} />
                  <h3 className="tw:text-sm tw:font-semibold tw:mt-6 tw:mb-2">
                    High ACOS (reduce bids)
                  </h3>
                  <DataTable
                    columns={highAcosCols}
                    rows={tiers.highAcos.map((t) => ({
                      ...t,
                      acosPct: (t.acos ?? 0) * 100,
                    }))}
                  />
                </>
              )}
            </>
          )}

          {view === "phrases" && (
            <>
              <p className="tw:text-sm tw:text-muted-foreground tw:mb-3">
                2– and 3-word phrase rollups from search terms (metrics
                attributed to every phrase a term contains — use for relative
                ranking).
              </p>
              {searchTermsLoading ? (
                <p className="reports-loading">Loading…</p>
              ) : (
                <>
                  <h3 className="tw:text-sm tw:font-semibold tw:mb-2">
                    Core phrases (top by sales)
                  </h3>
                  <DataTable
                    columns={phraseColumns}
                    rows={phraseWinnersDisplay}
                    initialPageSize={100}
                  />
                  <h3 className="tw:text-sm tw:font-semibold tw:mt-6 tw:mb-2">
                    Wasteful phrases (5+ clicks, $0 sales)
                  </h3>
                  <DataTable columns={phraseColumns} rows={phraseWaste} />
                </>
              )}
            </>
          )}

          {view === "matchTypes" && (
            <>
              {matchTypesLoading ? (
                <p className="reports-loading">Loading…</p>
              ) : (
                <DataTable
                  columns={matchTypeColumns}
                  rows={matchTypeRollup ?? []}
                />
              )}
            </>
          )}

          {view === "performers" && (
            <>
              <p className="tw:text-sm tw:text-muted-foreground tw:mb-3">
                Search terms with orders and ROAS ≥ 3× (14d), sorted by sales.
              </p>
              {searchTermsLoading ? (
                <p className="reports-loading">Loading…</p>
              ) : (
                <DataTable
                  columns={performerColumns}
                  rows={topPerformers.map((t) => ({
                    ...t,
                    network: networkCell(t.network),
                    acosPct: t.acos * 100,
                  }))}
                />
              )}
            </>
          )}

          {view === "competitors" && (
            <CompetitorsPanel
              keywords={keywords?.map((k) => k.term).filter(Boolean) ?? []}
              asins={[]}
              companyId={companyId}
            />
          )}
        </div>
      </div>

      {keywords?.length > 0 && view === "targeting" && (
        <div className="card">
          <div className="card-inner">
            <div className="filter-row" style={{ marginBottom: 16 }}>
              <label className="tw:text-sm tw:text-muted-foreground">
                Keyword trend
              </label>
              <select
                className="input"
                value={selectedKeywordId ?? ""}
                onChange={(e) => setSelectedKeywordId(e.target.value)}
              >
                {keywords.map((k) => (
                  <option key={String(k.id)} value={String(k.id)}>
                    {k.term}
                  </option>
                ))}
              </select>
            </div>
            <LineChart
              data={entitySeries}
              title={
                selectedTerm
                  ? `Spend vs sales — ${selectedTerm}`
                  : "Keyword spend vs sales"
              }
              xKey="date"
              config={{
                spend: {
                  key: "spend",
                  name: "Spend",
                  color: "#6caaf0",
                  formatter: "currency",
                },
                sales: {
                  key: "sales",
                  name: "Sales (14d)",
                  color: "#ac6cf0",
                  formatter: "currency",
                },
              }}
            />
          </div>
        </div>
      )}

      {view === "targeting" && (
        <div className={"tw:grid tw:grid-cols-2 tw:gap-2"}>
          <LineChart
            data={graphData}
            title={"Spend vs ad sales (account)"}
            xKey={"date"}
            config={{
              spend: {
                key: "spend",
                name: "Spend",
                color: "#6caaf0",
                formatter: "currency",
              },
              adSales: {
                key: "sales",
                name: "Ad sales",
                color: "#ac6cf0",
                formatter: "currency",
              },
            }}
          />
          <LineChart
            data={graphData}
            title={"ACOS vs ROAS (account)"}
            xKey={"date"}
            config={{
              acos: {
                key: "acos",
                name: "ACOS",
                color: "#f07c6c",
                formatter: "percent",
              },
              roas: {
                key: "roas",
                name: "ROAS",
                color: "#f0e96c",
                formatter: "percent",
              },
            }}
          />
        </div>
      )}
    </div>
  );
}
