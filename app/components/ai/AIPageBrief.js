"use client";

import { useState, useEffect } from "react";
import { useAIInsight } from "@/hooks/useAIInsight";
import { Sparkles, ChevronDown, ChevronUp, RefreshCw, Zap, Lightbulb, ArrowRight } from "lucide-react";

/**
 * AIPageBrief — collapsible AI analysis banner for report pages.
 *
 * Props:
 *  page    - page slug (e.g. "campaigns", "ads-overview")
 *  metrics - plain object of current metric values to send to the AI
 *  title   - optional custom header label (defaults to "AI Brief")
 */
export default function AIPageBrief({ page, metrics = {}, title }) {
  const storageKey = `atlas_brief_open__${page}`;
  const [open, setOpen] = useState(() => {
    try { return localStorage.getItem(storageKey) !== "false"; } catch { return true; }
  });

  const { brief, tips, topAction, loading, error, refresh } = useAIInsight(page, metrics);

  useEffect(() => {
    try { localStorage.setItem(storageKey, open); } catch { /* ignore */ }
  }, [open, storageKey]);

  // Don't render anything until we have data or are loading
  const hasContent = brief || tips?.length || topAction || loading;

  if (!hasContent && !error) return null;

  return (
    <div className="tw:rounded-2xl tw:border tw:border-cyan-500/20 tw:bg-gradient-to-r tw:from-cyan-500/[0.06] tw:to-violet-500/[0.04] tw:mb-5 tw:overflow-hidden">
      {/* Header */}
      <div className="tw:flex tw:items-center tw:gap-3 tw:px-5 tw:py-3 tw:border-b tw:border-cyan-500/10">
        <div className="tw:w-6 tw:h-6 tw:rounded-lg tw:bg-gradient-to-br tw:from-cyan-500 tw:to-violet-600 tw:flex tw:items-center tw:justify-center tw:shrink-0">
          <Sparkles size={12} className="tw:text-white" />
        </div>
        <span className="tw:text-sm tw:font-semibold tw:text-cyan-400">{title ?? "AI Brief"}</span>
        <span className="tw:text-xs tw:text-zinc-600 tw:ml-1">— Atlas AI analysis</span>

        <div className="tw:ml-auto tw:flex tw:items-center tw:gap-1.5">
          {!loading && (
            <button
              onClick={refresh}
              className="tw:p-1.5 tw:rounded-lg tw:text-zinc-600 hover:tw:text-cyan-400 hover:tw:bg-cyan-500/10 tw:transition-colors"
              title="Regenerate"
            >
              <RefreshCw size={12} />
            </button>
          )}
          <button
            onClick={() => setOpen(!open)}
            className="tw:p-1.5 tw:rounded-lg tw:text-zinc-600 hover:tw:text-white hover:tw:bg-white/5 tw:transition-colors"
            title={open ? "Collapse" : "Expand"}
          >
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Body */}
      {open && (
        <div className="tw:px-5 tw:py-4">
          {loading && (
            <div className="tw:space-y-2 tw:animate-pulse">
              <div className="tw:h-3.5 tw:w-full tw:rounded tw:bg-white/5" />
              <div className="tw:h-3.5 tw:w-4/5 tw:rounded tw:bg-white/5" />
              <div className="tw:h-3 tw:w-3/5 tw:rounded tw:bg-white/5 tw:mt-3" />
            </div>
          )}

          {error && !loading && (
            <p className="tw:text-xs tw:text-zinc-600 tw:italic">Unable to generate brief. <button onClick={refresh} className="tw:text-cyan-500 hover:tw:underline">Retry</button></p>
          )}

          {!loading && !error && (
            <div className="tw:space-y-3">
              {/* Brief text */}
              {brief && (
                <p className="tw:text-sm tw:text-zinc-300 tw:leading-relaxed">{brief}</p>
              )}

              {/* Tips row */}
              {tips?.length > 0 && (
                <div className="tw:flex tw:flex-wrap tw:gap-2 tw:pt-1">
                  {tips.map((tip, i) => (
                    <span
                      key={i}
                      className="tw:flex tw:items-center tw:gap-1.5 tw:text-xs tw:text-zinc-400 tw:bg-white/[0.04] tw:border tw:border-white/[0.08] tw:px-3 tw:py-1.5 tw:rounded-full"
                    >
                      <Lightbulb size={10} className="tw:text-yellow-400 tw:shrink-0" />
                      {tip}
                    </span>
                  ))}
                </div>
              )}

              {/* Top action */}
              {topAction && (
                <div className="tw:flex tw:items-center tw:gap-2 tw:pt-1">
                  <Zap size={12} className="tw:text-cyan-400 tw:shrink-0" />
                  <p className="tw:text-xs tw:font-semibold tw:text-cyan-400">{topAction}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
