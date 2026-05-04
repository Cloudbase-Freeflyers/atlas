"use client";

import { useEffect, useMemo, useState } from "react";
import TabBar from "../TabBar";
import DataTable from "../DataTable";
import LineChart from "../LineChart";
import { useData } from "@/hooks/useData.js";
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
  { label: "Insights", href: "/reports/callouts" },
];

const VIEWS = [
  { id: "targeting", label: "Targeting keywords" },
  { id: "searchTerms", label: "Search terms" },
  { id: "negatives", label: "Negative candidates" },
  { id: "phrases", label: "Core phrases" },
  { id: "matchTypes", label: "Match types" },
  { id: "performers", label: "Top performers" },
];

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
        <TabBar tabs={navTabs} active="Keywords And Search Terms" />
        <div className="card">
          <div className="card-inner">
            <p className="reports-loading">Loading…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid" style={{ gap: 20 }}>
      <TabBar tabs={navTabs} active="Keywords And Search Terms" />

      <div className="card">
        <div className="card-inner">
          <div className="reports-keyword-view-tabs">
            {VIEWS.map((v) => (
              <button
                key={v.id}
                type="button"
                className={`input ${view === v.id ? "" : "tw:opacity-70"}`}
                onClick={() => setView(v.id)}
                style={{
                  cursor: "pointer",
                  border:
                    view === v.id
                      ? "2px solid var(--accent, #2e75b6)"
                      : undefined,
                }}
              >
                {v.label}
              </button>
            ))}
          </div>

          {view === "targeting" && (
            <>
              <div className="filter-row">
                <input className="input" placeholder="Campaign name" readOnly />
                <input className="input" placeholder="Spend USD" readOnly />
                <input className="input" placeholder="Sales USD" readOnly />
                <input className="input" placeholder="Clicks" readOnly />
              </div>
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
