"use client";

import { useState, useCallback } from "react";
import { Sparkles, ChevronDown, ChevronUp, Loader2, MinusCircle, ArrowUpCircle, TrendingDown } from "lucide-react";
import { useFilters } from "@/lib/FiltersContext";
import { useShell } from "@/lib/ShellContext";
import { format } from "date-fns";

const CATEGORIES = [
  {
    key: "negatives",
    label: "Add as Negative",
    icon: MinusCircle,
    color: "tw:text-red-400",
    bg: "tw:bg-red-500/10 tw:border-red-500/20",
    dot: "tw:bg-red-500",
    description: "High spend, zero or near-zero orders",
  },
  {
    key: "promotions",
    label: "Promote to Exact",
    icon: ArrowUpCircle,
    color: "tw:text-emerald-400",
    bg: "tw:bg-emerald-500/10 tw:border-emerald-500/20",
    dot: "tw:bg-emerald-500",
    description: "Good conversion — create exact match targets",
  },
  {
    key: "bidAdjust",
    label: "Lower Bid",
    icon: TrendingDown,
    color: "tw:text-yellow-400",
    bg: "tw:bg-yellow-500/10 tw:border-yellow-500/20",
    dot: "tw:bg-yellow-500",
    description: "High spend with below-average ROAS",
  },
];

/**
 * KeywordHarvestPanel — AI-powered search term action suggestions.
 * Placed at the bottom of the Keywords page Search Terms view.
 *
 * Props:
 *   searchTerms - array of search term rows from Cube.js
 */
export default function KeywordHarvestPanel({ searchTerms = [] }) {
  const { companyId, dateTimePeriod } = useFilters();
  const { setChatOpen, setChatPrefill } = useShell();
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const dateRange = dateTimePeriod
    ? `${format(dateTimePeriod.startDate, "MMM d")} – ${format(dateTimePeriod.endDate, "MMM d, yyyy")}`
    : "recent period";

  const runHarvest = useCallback(async () => {
    if (!searchTerms?.length) return;
    setLoading(true);
    setError(null);
    setResult(null);

    // Build a compact metric payload — top 40 by spend with zero/low orders
    const ranked = [...searchTerms]
      .sort((a, b) => (b.spend ?? 0) - (a.spend ?? 0))
      .slice(0, 40)
      .map((t) => ({
        term: t.term,
        spend: parseFloat(t.spend ?? 0).toFixed(2),
        clicks: t.clicks ?? 0,
        orders: t.orders ?? 0,
        acos: t.acosPct != null ? (t.acosPct * 100).toFixed(1) : null,
        roas: t.roas != null ? parseFloat(t.roas).toFixed(2) : null,
      }));

    try {
      const res = await fetch("/api/ai-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page: "keywords",
          mode: "harvest",
          metrics: { searchTermCount: searchTerms.length },
          companyId,
          dateRange,
          searchTerms: ranked,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult({ negatives: data.negatives ?? [], promotions: data.promotions ?? [], bidAdjust: data.bidAdjust ?? [] });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [searchTerms, companyId, dateRange]);

  function askAI(term, action) {
    const msg = `For search term "${term}" — the AI recommended: "${action}". Can you give me step-by-step instructions to implement this in Amazon Ads?`;
    setChatPrefill(msg);
    setChatOpen(true);
  }

  const hasData = searchTerms?.length > 0;

  return (
    <div className="tw:rounded-2xl tw:border tw:border-violet-500/20 tw:bg-gradient-to-r tw:from-violet-500/[0.05] tw:to-transparent tw:mt-4 tw:overflow-hidden">
      {/* Header */}
      <div className="tw:flex tw:items-center tw:gap-3 tw:px-5 tw:py-3 tw:border-b tw:border-violet-500/10">
        <div className="tw:w-6 tw:h-6 tw:rounded-lg tw:bg-gradient-to-br tw:from-violet-500 tw:to-pink-600 tw:flex tw:items-center tw:justify-center tw:shrink-0">
          <Sparkles size={12} className="tw:text-white" />
        </div>
        <span className="tw:text-sm tw:font-semibold tw:text-violet-400">AI Harvest Assistant</span>
        <span className="tw:text-xs tw:text-zinc-600 tw:ml-1">— analyzes search terms for quick wins</span>
        <div className="tw:ml-auto tw:flex tw:items-center tw:gap-2">
          {hasData && !loading && (
            <button
              onClick={runHarvest}
              className="tw:text-xs tw:px-3 tw:py-1.5 tw:rounded-lg tw:bg-violet-500/20 hover:tw:bg-violet-500/30 tw:text-violet-300 tw:border tw:border-violet-500/30 tw:transition-colors"
            >
              {result ? "Refresh" : "Run AI Harvest"}
            </button>
          )}
          <button
            onClick={() => setOpen(!open)}
            className="tw:p-1.5 tw:rounded-lg tw:text-zinc-600 hover:tw:text-white hover:tw:bg-white/5 tw:transition-colors"
          >
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="tw:px-5 tw:py-4">
          {!hasData && (
            <p className="tw:text-sm tw:text-zinc-600">Load search term data to run the harvest analysis.</p>
          )}

          {hasData && !result && !loading && !error && (
            <div className="tw:flex tw:flex-col tw:items-center tw:gap-3 tw:py-4">
              <p className="tw:text-sm tw:text-zinc-500 tw:text-center tw:max-w-sm">
                Atlas AI will scan your top {Math.min(40, searchTerms.length)} search terms by spend and categorize them into actionable buckets.
              </p>
              <button
                onClick={runHarvest}
                className="tw:px-5 tw:py-2 tw:rounded-xl tw:bg-violet-600 hover:tw:bg-violet-500 tw:text-white tw:text-sm tw:font-semibold tw:transition-colors"
              >
                Run AI Harvest
              </button>
            </div>
          )}

          {loading && (
            <div className="tw:flex tw:items-center tw:gap-3 tw:py-6 tw:justify-center">
              <Loader2 size={16} className="tw:animate-spin tw:text-violet-400" />
              <span className="tw:text-sm tw:text-zinc-500">Analyzing search terms…</span>
            </div>
          )}

          {error && !loading && (
            <p className="tw:text-sm tw:text-red-400 tw:py-2">Error: {error}. <button onClick={runHarvest} className="tw:underline">Retry</button></p>
          )}

          {result && !loading && (
            <div className="tw:grid tw:grid-cols-1 md:tw:grid-cols-3 tw:gap-4">
              {CATEGORIES.map(({ key, label, icon: Icon, color, bg, dot, description }) => {
                const items = result[key] ?? [];
                return (
                  <div key={key} className={`tw:rounded-xl tw:border tw:p-4 ${bg}`}>
                    <div className="tw:flex tw:items-center tw:gap-2 tw:mb-3">
                      <Icon size={14} className={color} />
                      <span className={`tw:text-sm tw:font-semibold ${color}`}>{label}</span>
                      <span className="tw:ml-auto tw:text-xs tw:text-zinc-600 tw:bg-white/5 tw:px-1.5 tw:py-0.5 tw:rounded">{items.length}</span>
                    </div>
                    <p className="tw:text-[11px] tw:text-zinc-600 tw:mb-3">{description}</p>
                    {items.length === 0 ? (
                      <p className="tw:text-xs tw:text-zinc-700 tw:italic">None identified</p>
                    ) : (
                      <ul className="tw:space-y-2">
                        {items.map((item, i) => (
                          <li key={i} className="tw:flex tw:flex-col tw:gap-0.5">
                            <div className="tw:flex tw:items-start tw:gap-1.5">
                              <span className={`tw:w-1.5 tw:h-1.5 tw:rounded-full tw:mt-1.5 tw:shrink-0 ${dot}`} />
                              <div className="tw:flex-1 tw:min-w-0">
                                <p className="tw:text-xs tw:text-zinc-300 tw:font-medium tw:break-words">{item.term}</p>
                                {item.reason && <p className="tw:text-[10px] tw:text-zinc-600">{item.reason}</p>}
                              </div>
                              <button
                                onClick={() => askAI(item.term, label)}
                                title="Ask AI for implementation steps"
                                className="tw:shrink-0 tw:text-[10px] tw:text-violet-500 hover:tw:text-violet-300 tw:underline tw:whitespace-nowrap"
                              >
                                How?
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
