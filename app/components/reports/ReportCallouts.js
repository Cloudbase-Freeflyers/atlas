"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format, subDays } from "date-fns";

import { Button } from "../ui/button.jsx";
import { useFilters } from "@/lib/FiltersContext.js";
import { useMyCompanies } from "@/hooks/useUsers";
import {
  Sparkles,
  Target,
  CheckCircle2,
  AlertTriangle,
  ListTree,
  CalendarClock,
  ClipboardList,
} from "lucide-react";

const navTabs = [
  { label: "Overall KPIs", href: "/reports/overall-kpis" },
  { label: "Ads Overview", href: "/reports/ads-overview" },
  { label: "Seller Central Overview", href: "/reports/seller-central" },
  { label: "Keywords And Search Terms", href: "/reports/keywords" },
  { label: "Campaigns", href: "/reports/campaigns" },
  { label: "Top ASINs", href: "/reports/top-asins" },
  { label: "Insights", href: "/reports/callouts" },
];

const DAILY_WINDOW_DAYS = 7;
const WEEKLY_AUDIT_DAYS = 28;

function priorityClass(p) {
  switch (p) {
    case "HIGH":
      return "tw:bg-amber-500/25 tw:text-amber-200 tw:border-amber-500/40";
    case "LOW":
      return "tw:bg-emerald-500/15 tw:text-emerald-200 tw:border-emerald-500/35";
    default:
      return "tw:bg-yellow-500/20 tw:text-yellow-100 tw:border-yellow-500/35";
  }
}

function trendBadge(trend) {
  const base =
    "tw:inline-flex tw:items-center tw:rounded-full tw:px-2 tw:py-0.5 tw:text-xs tw:font-medium";
  if (trend === "up") return `${base} tw:bg-emerald-500/20 tw:text-emerald-200`;
  if (trend === "down")
    return `${base} tw:bg-red-500/20 tw:text-red-200`;
  if (trend === "flat") return `${base} tw:bg-zinc-500/20 tw:text-zinc-300`;
  return `${base} tw:bg-zinc-600/30 tw:text-zinc-400`;
}

export default function ReportCallouts() {
  const { companyId, dateTimePeriod } = useFilters();
  const { data: companies } = useMyCompanies();
  const [callout, setCallout] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  /** @type {"idle"|"daily"|"snapshot"|"weekly"} */
  const [runKind, setRunKind] = useState("idle");
  const [rangeLabel, setRangeLabel] = useState("");

  const companyName = useMemo(() => {
    const c = companies?.find((x) => String(x.id) === String(companyId));
    return c?.name || "Selected account";
  }, [companies, companyId]);

  const startDate = format(dateTimePeriod.startDate, "yyyy-MM-dd");
  const endDate = format(dateTimePeriod.endDate, "yyyy-MM-dd");

  const postInsights = useCallback(
    async ({
      start,
      end,
      mode,
      kind,
    }) => {
      if (!companyId) {
        setError("Select a company in the header.");
        return null;
      }
      setLoading(true);
      setError(null);
      setRunKind(kind);
      setRangeLabel(`${start} → ${end}`);
      try {
        const res = await fetch("/api/reports/callouts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            companyId: String(companyId),
            companyName,
            startDate: start,
            endDate: end,
            mode,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || `Request failed (${res.status})`);
        }
        setCallout(data.callout);
        setMetrics(data.metrics);
        return data;
      } catch (e) {
        setCallout(null);
        setMetrics(null);
        setError(e.message || "Something went wrong");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [companyId, companyName]
  );

  const generateInsightsHeaderRange = useCallback(() => {
    postInsights({
      start: startDate,
      end: endDate,
      mode: "snapshot",
      kind: "snapshot",
    });
  }, [postInsights, startDate, endDate]);

  const runWeeklyAudit = useCallback(() => {
    const end = format(new Date(), "yyyy-MM-dd");
    const start = format(subDays(new Date(), WEEKLY_AUDIT_DAYS - 1), "yyyy-MM-dd");
    postInsights({ start, end, mode: "weekly", kind: "weekly" });
  }, [postInsights]);

  /** Once per calendar day per company: restore cache or auto-run rolling 7-day insight. */
  useEffect(() => {
    if (!companyId || !companyName) return;

    const today = format(new Date(), "yyyy-MM-dd");
    const cacheKey = `atlas-insights-daily-cache:${companyId}`;

    try {
      const raw = localStorage.getItem(cacheKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.calendarDay === today && parsed.callout) {
          setCallout(parsed.callout);
          setMetrics(parsed.metrics);
          setRunKind("daily");
          setRangeLabel(
            `${parsed.startDate || "?"} → ${parsed.endDate || "?"} · Daily snapshot`
          );
          return;
        }
      }
    } catch {
      /* ignore */
    }

    const lockKey = `atlas-insights-autoload:${companyId}:${today}`;
    if (sessionStorage.getItem(lockKey)) return;
    sessionStorage.setItem(lockKey, "1");

    const start = format(subDays(new Date(), DAILY_WINDOW_DAYS - 1), "yyyy-MM-dd");
    const end = format(new Date(), "yyyy-MM-dd");

    (async () => {
      setLoading(true);
      setError(null);
      setRunKind("daily");
      setRangeLabel(`${start} → ${end} · Daily snapshot`);
      try {
        const res = await fetch("/api/reports/callouts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            companyId: String(companyId),
            companyName,
            startDate: start,
            endDate: end,
            mode: "daily",
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || `Request failed (${res.status})`);
        }
        setCallout(data.callout);
        setMetrics(data.metrics);
        try {
          localStorage.setItem(
            cacheKey,
            JSON.stringify({
              calendarDay: today,
              startDate: start,
              endDate: end,
              callout: data.callout,
              metrics: data.metrics,
            })
          );
        } catch {
          /* quota */
        }
      } catch (e) {
        sessionStorage.removeItem(lockKey);
        setError(e.message || "Daily insight could not load.");
      } finally {
        setLoading(false);
      }
    })();
  }, [companyId, companyName]);

  const bannerKind = useMemo(() => {
    if (runKind === "weekly") return "Weekly full audit";
    if (runKind === "daily") return "Daily snapshot";
    if (runKind === "snapshot") return "Custom range (header)";
    return "Insights";
  }, [runKind]);

  return (
    <div className="grid" style={{ gap: 20 }}>


      <div className="card">
        <div className="card-inner">
          <div className="tw:flex tw:flex-wrap tw:items-start tw:justify-between tw:gap-4 tw:mb-6">
            <div>
              <div className="section-title tw:mb-1 tw:flex tw:items-center tw:gap-2">
                <span>Insights &amp; callouts</span>
              </div>
              <p className="tw:text-sm tw:text-zinc-400 tw:max-w-2xl">
                A <strong className="tw:text-zinc-300">daily</strong> snapshot runs
                automatically once per calendar day (rolling {DAILY_WINDOW_DAYS} days vs the
                prior period).{" "}
                <strong className="tw:text-zinc-300">Generate insights</strong> uses the
                dates in the header;{" "}
                <strong className="tw:text-zinc-300">Weekly full audit</strong> runs a{" "}
                {WEEKLY_AUDIT_DAYS}-day review.
              </p>
              <p className="tw:text-xs tw:text-zinc-500 tw:mt-2">
                {rangeLabel || `${startDate} → ${endDate}`} · {companyName}
              </p>
            </div>
            <div className="tw:flex tw:flex-wrap tw:gap-2 tw:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={generateInsightsHeaderRange}
                disabled={loading || !companyId}
                className="tw:gap-2 tw:border-zinc-600 tw:text-zinc-200"
              >
                <Sparkles className="tw:h-4 tw:w-4" />
                {loading && runKind === "snapshot"
                  ? "Generating…"
                  : "Generate insights"}
              </Button>
              <Button
                type="button"
                onClick={runWeeklyAudit}
                disabled={loading || !companyId}
                className="tw:gap-2 tw:bg-violet-700 hover:tw:bg-violet-600 tw:text-white"
              >
                <ClipboardList className="tw:h-4 tw:w-4" />
                {loading && runKind === "weekly"
                  ? "Auditing…"
                  : "Weekly full audit"}
              </Button>
            </div>
          </div>

          <div className="tw:flex tw:items-center tw:gap-2 tw:mb-4 tw:text-xs tw:text-zinc-500">
            <CalendarClock className="tw:h-3.5 tw:w-3.5" />
            <span>
              The daily snapshot refreshes once per calendar day per account (cached in
              this browser).
            </span>
          </div>

          {error && (
            <div className="tw:rounded-lg tw:border tw:border-red-500/40 tw:bg-red-500/10 tw:px-4 tw:py-3 tw:text-sm tw:text-red-200 tw:mb-4">
              {error}
            </div>
          )}

          {!callout && !loading && !error && (
            <p className="tw:text-zinc-500 tw:text-sm tw:italic">
              Loading insights…
            </p>
          )}

          {callout && (
            <div className="tw:space-y-5">
              <div className="tw:flex tw:flex-wrap tw:items-start tw:justify-between tw:gap-3">
                <h1 className="tw:text-xl tw:font-semibold tw:text-white tw:leading-snug tw:max-w-3xl">
                  {callout.headline}
                </h1>
                <span
                  className={`tw:shrink-0 tw:rounded-full tw:border tw:px-3 tw:py-1 tw:text-xs tw:font-semibold tw:uppercase tw:tracking-wide ${priorityClass(callout.priority)}`}
                >
                  {callout.priority}
                </span>
              </div>

              <div className="tw:rounded-xl tw:border tw:border-cyan-500/25 tw:bg-gradient-to-br tw:from-cyan-950/80 tw:to-zinc-900/90 tw:px-5 tw:py-4 tw:text-sm tw:text-cyan-50/95">
                <p className="tw:font-medium tw:tracking-wide tw:text-cyan-100/90 tw:uppercase tw:text-xs tw:mb-1">
                  {bannerKind}
                </p>
                <p>{callout.greeting}</p>
              </div>

              {callout.executiveSummary && (
                <p className="tw:text-zinc-300 tw:text-sm tw:leading-relaxed tw:border-l-4 tw:border-cyan-600 tw:pl-4">
                  {callout.executiveSummary}
                </p>
              )}

              {callout.bullets?.length > 0 && (
                <ul className="tw:list-disc tw:list-inside tw:text-sm tw:text-zinc-400 tw:space-y-1">
                  {callout.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              )}

              <div className="tw:flex tw:items-center tw:justify-between tw:pt-2">
                <h2 className="chart-title tw:mb-0">Story breakdown</h2>
                <span className="tw:text-xs tw:text-zinc-500 tw:uppercase">
                  Detail view
                </span>
              </div>

              {callout.scoreboard?.length > 0 && (
                <div>
                  <h3 className="tw:text-xs tw:font-semibold tw:tracking-wider tw:text-zinc-500 tw:uppercase tw:mb-3">
                    Scoreboard
                  </h3>
                  <div className="tw:grid tw:grid-cols-1 sm:tw:grid-cols-2 lg:tw:grid-cols-3 tw:gap-3">
                    {callout.scoreboard.map((s, i) => (
                      <div
                        key={i}
                        className="tw:rounded-lg tw:border tw:border-zinc-700 tw:bg-zinc-900/50 tw:p-4"
                      >
                        <div className="tw:text-xs tw:text-zinc-500 tw:mb-1">
                          {s.label}
                        </div>
                        <div className="tw:text-lg tw:font-semibold tw:text-white">
                          {s.value}
                        </div>
                        <div className="tw:flex tw:flex-wrap tw:items-center tw:gap-2 tw:mt-2">
                          <span className={trendBadge(s.trend)}>{s.trend}</span>
                          <span className="tw:text-xs tw:text-zinc-500">
                            {s.context}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="tw:grid tw:gap-3 md:tw:grid-cols-1">
                <div className="tw:rounded-lg tw:border tw:border-sky-500/20 tw:bg-sky-950/25 tw:p-4">
                  <div className="tw:flex tw:items-center tw:gap-2 tw:mb-2 tw:text-sky-200">
                    <ListTree className="tw:h-4 tw:w-4" />
                    <span className="tw:text-xs tw:font-semibold tw:uppercase tw:tracking-wide">
                      What moved
                    </span>
                  </div>
                  <ul className="tw:space-y-1.5 tw:text-sm tw:text-zinc-300">
                    {(callout.whatMoved || []).map((t, i) => (
                      <li key={i} className="tw:flex tw:gap-2">
                        <span className="tw:text-sky-500">•</span>
                        <span>{t}</span>
                      </li>
                    ))}
                    {(!callout.whatMoved || callout.whatMoved.length === 0) && (
                      <li className="tw:text-zinc-600 tw:text-sm">No items.</li>
                    )}
                  </ul>
                </div>

                <div className="tw:rounded-lg tw:border tw:border-emerald-500/20 tw:bg-emerald-950/20 tw:p-4">
                  <div className="tw:flex tw:items-center tw:gap-2 tw:mb-2 tw:text-emerald-200">
                    <CheckCircle2 className="tw:h-4 tw:w-4" />
                    <span className="tw:text-xs tw:font-semibold tw:uppercase tw:tracking-wide">
                      Shout-outs
                    </span>
                  </div>
                  <ul className="tw:space-y-1.5 tw:text-sm tw:text-zinc-300">
                    {(callout.shoutOuts || []).map((t, i) => (
                      <li key={i} className="tw:flex tw:gap-2">
                        <span className="tw:text-emerald-500">•</span>
                        <span>{t}</span>
                      </li>
                    ))}
                    {(!callout.shoutOuts || callout.shoutOuts.length === 0) && (
                      <li className="tw:text-zinc-600 tw:text-sm">None highlighted.</li>
                    )}
                  </ul>
                </div>

                <div className="tw:rounded-lg tw:border tw:border-amber-500/25 tw:bg-amber-950/20 tw:p-4">
                  <div className="tw:flex tw:items-center tw:gap-2 tw:mb-2 tw:text-amber-200">
                    <AlertTriangle className="tw:h-4 tw:w-4" />
                    <span className="tw:text-xs tw:font-semibold tw:uppercase tw:tracking-wide">
                      Watch-outs
                    </span>
                  </div>
                  <ul className="tw:space-y-1.5 tw:text-sm tw:text-zinc-300">
                    {(callout.watchOuts || []).map((t, i) => (
                      <li key={i} className="tw:flex tw:gap-2">
                        <span className="tw:text-amber-500">•</span>
                        <span>{t}</span>
                      </li>
                    ))}
                    {(!callout.watchOuts || callout.watchOuts.length === 0) && (
                      <li className="tw:text-zinc-600 tw:text-sm">None flagged.</li>
                    )}
                  </ul>
                </div>

                {callout.nextAction && (
                  <div className="tw:rounded-lg tw:border tw:border-violet-500/30 tw:bg-violet-950/30 tw:p-4 tw:flex tw:gap-3 tw:items-start">
                    <Target className="tw:h-5 tw:w-5 tw:text-violet-300 tw:shrink-0 tw:mt-0.5" />
                    <div>
                      <div className="tw:text-xs tw:font-semibold tw:uppercase tw:tracking-wide tw:text-violet-200 tw:mb-1">
                        Next action
                      </div>
                      <p className="tw:text-sm tw:text-zinc-200 tw:leading-relaxed">
                        {callout.nextAction}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {metrics && process.env.NODE_ENV === "development" && (
                <details className="tw:text-xs tw:text-zinc-600">
                  <summary className="tw:cursor-pointer tw:text-zinc-500">
                    Raw metrics bundle (dev)
                  </summary>
                  <pre className="tw:mt-2 tw:overflow-auto tw:rounded tw:bg-black/40 tw:p-2 tw:max-h-48">
                    {JSON.stringify(metrics, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
