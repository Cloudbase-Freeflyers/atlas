"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Sparkles, RefreshCw, TrendingUp, TrendingDown, Minus,
  Info, Loader2, Play, CheckCircle2, XCircle, ChevronDown, ChevronUp,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useFilters } from "@/lib/FiltersContext";
import { useData } from "@/hooks/useData";

// ─── localStorage helpers ────────────────────────────────────────────────────

function storageKey(companyId) {
  return `atlas_apify_${companyId}`;
}

function loadSavedState(companyId) {
  if (typeof window === "undefined" || !companyId) return null;
  try {
    const raw = localStorage.getItem(storageKey(companyId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persistState(companyId, patch) {
  if (typeof window === "undefined" || !companyId) return;
  try {
    const existing = loadSavedState(companyId) ?? {};
    localStorage.setItem(storageKey(companyId), JSON.stringify({ ...existing, ...patch }));
  } catch {}
}

// ─── Data processing ─────────────────────────────────────────────────────────

/**
 * Collapse flat Apify items (one per SERP row) into per-keyword summaries
 * for the user's own tracked ASINs and the top competitors.
 */
function processItems(items) {
  const byKeyword = {};

  for (const item of items) {
    const kw = item.keyword;
    if (!kw) continue;
    if (!byKeyword[kw]) byKeyword[kw] = { keyword: kw, myResults: [], competitorResults: [] };
    if (item.isTrackedASIN) {
      byKeyword[kw].myResults.push(item);
    } else {
      byKeyword[kw].competitorResults.push(item);
    }
  }

  return Object.values(byKeyword).map(({ keyword, myResults, competitorResults }) => {
    const sponsored = myResults
      .filter((i) => i.isSponsored)
      .sort((a, b) => a.position - b.position)[0];
    const organic = myResults
      .filter((i) => !i.isSponsored)
      .sort((a, b) => (a.organicPosition ?? a.position ?? 999) - (b.organicPosition ?? b.position ?? 999))[0];

    const topCompetitors = competitorResults
      .sort((a, b) => a.position - b.position)
      .slice(0, 6)
      .map((c) => ({
        asin: c.asin,
        title: c.title,
        position: c.position,
        organicPosition: c.organicPosition,
        isSponsored: c.isSponsored,
        rating: c.rating,
        reviewCount: c.reviewCount,
        imageUrl: c.imageUrl,
      }));

    return {
      keyword,
      sponsoredRank: sponsored?.position ?? null,
      organicRank: organic?.organicPosition ?? organic?.position ?? null,
      myAsin: sponsored?.asin ?? organic?.asin ?? null,
      topCompetitors,
      scrapedAt: myResults[0]?.scrapedAt ?? competitorResults[0]?.scrapedAt ?? null,
    };
  });
}

function computeSnapshot(processed) {
  const withSponsoredRank = processed.filter((k) => k.sponsoredRank != null);
  const withOrganicRank = processed.filter((k) => k.organicRank != null);
  const avgSponsored =
    withSponsoredRank.length
      ? withSponsoredRank.reduce((s, k) => s + k.sponsoredRank, 0) / withSponsoredRank.length
      : null;
  const avgOrganic =
    withOrganicRank.length
      ? withOrganicRank.reduce((s, k) => s + k.organicRank, 0) / withOrganicRank.length
      : null;
  const top3Sponsored = withSponsoredRank.filter((k) => k.sponsoredRank <= 3).length;
  return { avgSponsored, avgOrganic, top3Sponsored };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function RankBadge({ rank }) {
  if (!rank) return <span className="tw:text-zinc-600 tw:text-sm">—</span>;
  const color =
    rank <= 3
      ? "tw:text-emerald-400"
      : rank <= 10
      ? "tw:text-yellow-400"
      : "tw:text-zinc-400";
  return <span className={`tw:text-sm tw:font-bold ${color}`}>#{rank}</span>;
}

function TrendIcon({ change }) {
  if (!change) return <Minus size={12} className="tw:text-zinc-600" />;
  if (change > 0) return <TrendingUp size={12} className="tw:text-emerald-400" />;
  return <TrendingDown size={12} className="tw:text-red-400" />;
}

function StatusBadge({ status }) {
  if (!status) return null;
  const map = {
    RUNNING: { label: "Running…", color: "tw:text-yellow-400", icon: <Loader2 size={12} className="tw:animate-spin" /> },
    READY: { label: "Starting…", color: "tw:text-yellow-400", icon: <Loader2 size={12} className="tw:animate-spin" /> },
    SUCCEEDED: { label: "Complete", color: "tw:text-emerald-400", icon: <CheckCircle2 size={12} /> },
    FAILED: { label: "Failed", color: "tw:text-red-400", icon: <XCircle size={12} /> },
    ABORTED: { label: "Aborted", color: "tw:text-red-400", icon: <XCircle size={12} /> },
  };
  const cfg = map[status] ?? { label: status, color: "tw:text-zinc-400", icon: null };
  return (
    <span className={`tw:flex tw:items-center tw:gap-1 tw:text-xs tw:font-medium ${cfg.color}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

function CompetitorRow({ c }) {
  return (
    <div className="tw:flex tw:items-center tw:gap-3 tw:py-1.5 tw:border-b tw:border-white/[0.04] last:tw:border-0">
      {c.imageUrl && (
        <img src={c.imageUrl} alt="" className="tw:w-8 tw:h-8 tw:object-contain tw:rounded tw:bg-zinc-800 tw:flex-shrink-0" />
      )}
      <div className="tw:flex-1 tw:min-w-0">
        <p className="tw:text-xs tw:text-zinc-300 tw:truncate">{c.title || c.asin}</p>
        <p className="tw:text-[10px] tw:text-zinc-600 tw:font-mono">{c.asin}</p>
      </div>
      <div className="tw:flex tw:items-center tw:gap-2 tw:flex-shrink-0">
        <span className={`tw:text-[10px] tw:px-1.5 tw:py-0.5 tw:rounded tw:font-medium ${c.isSponsored ? "tw:bg-cyan-500/20 tw:text-cyan-400" : "tw:bg-zinc-700 tw:text-zinc-400"}`}>
          {c.isSponsored ? "Sponsored" : "Organic"}
        </span>
        <span className="tw:text-xs tw:font-bold tw:text-zinc-300 tw:w-8 tw:text-right">#{c.position}</span>
      </div>
    </div>
  );
}

function KeywordRow({ kw }) {
  const [open, setOpen] = useState(false);
  return (
    <tr className="tw:border-b tw:border-white/[0.03] hover:tw:bg-white/[0.02] tw:transition-colors">
      <td className="tw:px-5 tw:py-3 tw:text-zinc-200 tw:font-medium tw:text-sm">{kw.keyword}</td>
      <td className="tw:px-5 tw:py-3"><RankBadge rank={kw.sponsoredRank} /></td>
      <td className="tw:px-5 tw:py-3"><RankBadge rank={kw.organicRank} /></td>
      <td className="tw:px-5 tw:py-3 tw:text-zinc-500 tw:text-xs tw:font-mono">{kw.myAsin ?? "—"}</td>
      <td className="tw:px-5 tw:py-3">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="tw:flex tw:items-center tw:gap-1 tw:text-xs tw:text-zinc-400 hover:tw:text-zinc-200 tw:transition-colors"
        >
          {kw.topCompetitors.length} rivals
          {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
        {open && kw.topCompetitors.length > 0 && (
          <div className="tw:mt-2 tw:border tw:border-white/[0.08] tw:rounded-xl tw:p-3 tw:bg-zinc-950 tw:max-w-sm">
            {kw.topCompetitors.map((c, i) => (
              <CompetitorRow key={c.asin ?? i} c={c} />
            ))}
          </div>
        )}
      </td>
    </tr>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="tw:bg-zinc-900 tw:border tw:border-white/10 tw:rounded-xl tw:px-4 tw:py-3 tw:text-sm tw:shadow-xl">
      <p className="tw:font-semibold tw:text-white tw:mb-2">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="tw:text-xs">
          {p.name}: {typeof p.value === "number" ? p.value.toFixed(1) : p.value}
        </p>
      ))}
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ShareOfVoicePage() {
  const { companyId } = useFilters();

  // Cube: top 30 keywords by cost
  const { data: keywordsRaw } = useData(
    {
      dimensions: ["AdsKeywordReports.keyword_text"],
      measures: ["AdsKeywordReports.cost", "AdsKeywordReports.clicks"],
      order: { "AdsKeywordReports.cost": "desc" },
      limit: 30,
    },
    (rows) =>
      [...new Set(rows.map((r) => r["AdsKeywordReports.keyword_text"]).filter(Boolean))],
    "apify_sov_keywords",
    "AdsKeywordReports.report_date",
    false
  );

  // Cube: top 15 advertised ASINs by impressions
  const { data: asinsRaw } = useData(
    {
      dimensions: ["AdsProductReports.advertised_asin"],
      measures: ["AdsProductReports.impressions"],
      order: { "AdsProductReports.impressions": "desc" },
      limit: 15,
    },
    (rows) =>
      [...new Set(rows.map((r) => r["AdsProductReports.advertised_asin"]).filter(Boolean))],
    "apify_sov_asins",
    "AdsProductReports.report_date",
    false
  );

  const keywords = keywordsRaw ?? [];
  const asins = asinsRaw ?? [];

  // Run state
  const [runState, setRunState] = useState(null); // { runId, datasetId, status, scrapedAt }
  const [results, setResults] = useState(null);   // processed keyword summaries
  const [trend, setTrend] = useState([]);          // historical snapshots for chart
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState(null);
  const pollRef = useRef(null);

  // Restore from localStorage on mount / company change
  useEffect(() => {
    if (!companyId) return;
    const saved = loadSavedState(companyId);
    if (!saved) return;
    if (saved.runState) setRunState(saved.runState);
    if (saved.trend) setTrend(saved.trend);
  }, [companyId]);

  // Polling logic
  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    setPolling(false);
  }, []);

  const fetchResults = useCallback(
    async (runId) => {
      try {
        const res = await fetch(`/api/apify/results?runId=${runId}`);
        const data = await res.json();

        setRunState((prev) => ({ ...prev, status: data.status }));
        persistState(companyId, { runState: { ...runState, status: data.status } });

        if (data.status === "SUCCEEDED") {
          stopPolling();
          const processed = processItems(data.items ?? []);
          setResults(processed);
          const snap = computeSnapshot(processed);
          const newTrend = [
            ...trend.slice(-7),
            {
              label: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
              avgSponsored: snap.avgSponsored ? +snap.avgSponsored.toFixed(1) : null,
              avgOrganic: snap.avgOrganic ? +snap.avgOrganic.toFixed(1) : null,
            },
          ];
          setTrend(newTrend);
          persistState(companyId, {
            runState: { ...runState, status: "SUCCEEDED" },
            trend: newTrend,
          });
        } else if (["FAILED", "ABORTED", "TIMED-OUT"].includes(data.status)) {
          stopPolling();
          setError(`Apify run ${data.status.toLowerCase()}. Try running again.`);
        }
      } catch (err) {
        stopPolling();
        setError(err.message);
      }
    },
    [companyId, runState, trend, stopPolling]
  );

  // Start a new Apify run
  const handleRun = useCallback(async () => {
    if (!keywords.length) return;
    setError(null);
    setResults(null);

    try {
      const res = await fetch("/api/apify/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords, asins, domain: "amazon.com" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to start run");

      const newRunState = {
        runId: data.runId,
        datasetId: data.datasetId,
        status: data.status,
        scrapedAt: new Date().toISOString(),
      };
      setRunState(newRunState);
      setPolling(true);
      persistState(companyId, { runState: newRunState });

      pollRef.current = setInterval(() => fetchResults(data.runId), 15_000);
    } catch (err) {
      setError(err.message);
    }
  }, [keywords, asins, companyId, fetchResults]);

  // Resume polling if we have an in-progress run on mount
  useEffect(() => {
    if (
      runState?.runId &&
      runState?.status &&
      !["SUCCEEDED", "FAILED", "ABORTED"].includes(runState.status)
    ) {
      setPolling(true);
      pollRef.current = setInterval(() => fetchResults(runState.runId), 15_000);
    }
    return () => stopPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const processed = useMemo(() => results ?? [], [results]);
  const snapshot = useMemo(() => computeSnapshot(processed), [processed]);

  const isRunning = polling || (runState?.status && !["SUCCEEDED", "FAILED", "ABORTED"].includes(runState.status));
  const hasResults = processed.length > 0;

  return (
    <div className="tw:space-y-6">
      {/* Header */}
      <div className="tw:flex tw:items-start tw:justify-between tw:gap-4">
        <div>
          <div className="tw:flex tw:items-center tw:gap-2 tw:mb-1">
            <Sparkles size={18} className="tw:text-zinc-500" />
            <h2 className="tw:text-xl tw:font-semibold tw:text-white">Share of Voice</h2>
          </div>
          <p className="tw:text-zinc-500 tw:text-sm tw:flex tw:items-center tw:gap-1.5">
            Keyword-level visibility — sponsored and organic rank from live Amazon SERP data.
            <span className="tw:flex tw:items-center tw:gap-1 tw:text-zinc-600 tw:text-xs">
              <Info size={11} /> Powered by Apify
            </span>
          </p>
        </div>

        {/* Run controls */}
        <div className="tw:flex tw:items-center tw:gap-3 tw:flex-shrink-0">
          {runState?.status && <StatusBadge status={runState.status} />}
          {runState?.scrapedAt && runState.status === "SUCCEEDED" && (
            <span className="tw:text-xs tw:text-zinc-600">
              Last run {new Date(runState.scrapedAt).toLocaleDateString()}
            </span>
          )}
          <button
            type="button"
            onClick={handleRun}
            disabled={isRunning || keywords.length === 0}
            className="tw:flex tw:items-center tw:gap-2 tw:px-4 tw:py-2 tw:rounded-xl tw:bg-cyan-500 hover:tw:bg-cyan-400 tw:text-zinc-950 tw:text-sm tw:font-semibold tw:transition-colors disabled:tw:opacity-50 disabled:tw:cursor-not-allowed"
          >
            {isRunning ? (
              <><Loader2 size={14} className="tw:animate-spin" /> Scanning…</>
            ) : hasResults ? (
              <><RefreshCw size={14} /> Re-scan</>
            ) : (
              <><Play size={14} /> Run Rank Scan</>
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="tw:rounded-xl tw:border tw:border-red-500/30 tw:bg-red-500/10 tw:px-4 tw:py-3 tw:text-sm tw:text-red-400">
          {error}
        </div>
      )}

      {/* Keywords/ASINs preview when no results yet */}
      {!hasResults && !isRunning && (
        <div className="tw:grid tw:grid-cols-2 tw:gap-4">
          <div className="tw:rounded-2xl tw:border tw:border-white/[0.07] tw:bg-zinc-900 tw:p-5">
            <p className="tw:text-[11px] tw:uppercase tw:tracking-widest tw:text-zinc-600 tw:mb-3">
              Keywords to scan ({keywords.length})
            </p>
            {keywords.length === 0 ? (
              <p className="tw:text-zinc-600 tw:text-xs">Loading from Cube…</p>
            ) : (
              <div className="tw:flex tw:flex-wrap tw:gap-1.5">
                {keywords.slice(0, 20).map((kw) => (
                  <span
                    key={kw}
                    className="tw:text-xs tw:px-2 tw:py-1 tw:rounded-lg tw:bg-zinc-800 tw:text-zinc-300"
                  >
                    {kw}
                  </span>
                ))}
                {keywords.length > 20 && (
                  <span className="tw:text-xs tw:text-zinc-600">+{keywords.length - 20} more</span>
                )}
              </div>
            )}
          </div>
          <div className="tw:rounded-2xl tw:border tw:border-white/[0.07] tw:bg-zinc-900 tw:p-5">
            <p className="tw:text-[11px] tw:uppercase tw:tracking-widest tw:text-zinc-600 tw:mb-3">
              Your ASINs tracked ({asins.length})
            </p>
            {asins.length === 0 ? (
              <p className="tw:text-zinc-600 tw:text-xs">Loading from Cube…</p>
            ) : (
              <div className="tw:flex tw:flex-wrap tw:gap-1.5">
                {asins.map((asin) => (
                  <span
                    key={asin}
                    className="tw:text-xs tw:px-2 tw:py-1 tw:rounded-lg tw:bg-zinc-800 tw:text-zinc-400 tw:font-mono"
                  >
                    {asin}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Running skeleton */}
      {isRunning && !hasResults && (
        <div className="tw:rounded-2xl tw:border tw:border-white/[0.07] tw:bg-zinc-900 tw:p-8 tw:flex tw:flex-col tw:items-center tw:gap-3">
          <Loader2 size={28} className="tw:animate-spin tw:text-cyan-400" />
          <p className="tw:text-zinc-400 tw:text-sm">Scanning Amazon SERPs for {keywords.length} keywords…</p>
          <p className="tw:text-zinc-600 tw:text-xs">This typically takes 2–8 minutes. Results appear automatically.</p>
        </div>
      )}

      {/* KPI strip */}
      {hasResults && (
        <div className="tw:grid tw:grid-cols-3 tw:gap-4">
          {[
            {
              label: "Keywords Tracked",
              value: `${processed.length}`,
              note: `of ${keywords.length} scanned`,
            },
            {
              label: "Avg Sponsored Rank",
              value: snapshot.avgSponsored != null ? `#${snapshot.avgSponsored.toFixed(1)}` : "—",
              note: "weighted avg position",
            },
            {
              label: "Top-3 Sponsored",
              value: `${snapshot.top3Sponsored}`,
              note: "keywords holding position 1–3",
            },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="tw:rounded-2xl tw:border tw:border-white/[0.07] tw:bg-zinc-900 tw:p-5"
            >
              <p className="tw:text-[11px] tw:uppercase tw:tracking-widest tw:text-zinc-600 tw:mb-2">
                {kpi.label}
              </p>
              <p className="tw:text-2xl tw:font-bold tw:text-white">{kpi.value}</p>
              <p className="tw:text-xs tw:text-zinc-600 tw:mt-1">{kpi.note}</p>
            </div>
          ))}
        </div>
      )}

      {/* Trend chart */}
      {trend.length > 1 && (
        <div className="tw:rounded-2xl tw:border tw:border-white/[0.07] tw:bg-zinc-900 tw:p-6">
          <h3 className="tw:text-sm tw:font-semibold tw:text-white tw:mb-5">
            Average Rank Trend (last {trend.length} scans)
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="sponsoredGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="organicGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="label" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis
                reversed
                tick={{ fill: "#6b7280", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                label={{ value: "Rank (lower = better)", angle: -90, position: "insideLeft", fill: "#6b7280", fontSize: 10 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="avgSponsored"
                name="Avg Sponsored Rank"
                stroke="#00d4ff"
                fill="url(#sponsoredGrad)"
                strokeWidth={2}
                dot={{ fill: "#00d4ff", r: 3 }}
                connectNulls
              />
              <Area
                type="monotone"
                dataKey="avgOrganic"
                name="Avg Organic Rank"
                stroke="#a78bfa"
                fill="url(#organicGrad)"
                strokeWidth={2}
                dot={{ fill: "#a78bfa", r: 3 }}
                connectNulls
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Keyword rank table */}
      {hasResults && (
        <div className="tw:rounded-2xl tw:border tw:border-white/[0.07] tw:bg-zinc-900 tw:overflow-hidden">
          <div className="tw:px-5 tw:py-4 tw:border-b tw:border-white/[0.05]">
            <h3 className="tw:text-sm tw:font-semibold tw:text-white">Keyword Rank Tracker</h3>
            <p className="tw:text-xs tw:text-zinc-600 tw:mt-0.5">
              Sponsored and organic positions for your tracked ASINs. Expand each row to see page-1 competitors.
            </p>
          </div>
          <div className="tw:overflow-x-auto">
            <table className="tw:w-full tw:text-sm">
              <thead>
                <tr className="tw:border-b tw:border-white/[0.05]">
                  {["Keyword", "Sponsored", "Organic", "Your ASIN", "Competitors"].map((h) => (
                    <th
                      key={h}
                      className="tw:text-left tw:px-5 tw:py-3 tw:text-[10px] tw:uppercase tw:tracking-widest tw:text-zinc-600 tw:font-semibold"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {processed.map((kw, i) => (
                  <KeywordRow key={kw.keyword ?? i} kw={kw} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
