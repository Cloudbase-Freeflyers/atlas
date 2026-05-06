"use client";

import { useEffect, useState } from "react";
import { useFilters } from "@/lib/FiltersContext";
import { severityColor } from "@/lib/anomalyDetection";
import { BellRing, RefreshCw, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Info, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useShell } from "@/lib/ShellContext";

function MetricBadge({ current, baseline, changePct }) {
  const isUp = changePct > 0;
  return (
    <div className="tw:flex tw:items-center tw:gap-1.5">
      {isUp ? <TrendingUp size={13} className="tw:text-red-400" /> : <TrendingDown size={13} className="tw:text-green-400" />}
      <span className={`tw:text-sm tw:font-semibold ${isUp ? "tw:text-red-400" : "tw:text-green-400"}`}>
        {isUp ? "+" : ""}{changePct?.toFixed(1)}%
      </span>
    </div>
  );
}

function AlertCard({ alert }) {
  const colors = severityColor(alert.severity);
  const [expanded, setExpanded] = useState(false);
  const { setChatOpen, setChatPrefill } = useShell();

  function handleAskAI() {
    const currentVal = typeof alert.current === "number" ? alert.current.toFixed(3) : alert.current;
    const baselineVal = typeof alert.baseline === "number" ? alert.baseline.toFixed(3) : alert.baseline;
    const msg = `I have a ${alert.severity} "${alert.label}" alert. My ${alert.metric} moved from ${baselineVal} (baseline) to ${currentVal} (recent) — a ${alert.changePct?.toFixed(1)}% change. Explain what likely caused this and give me 3 specific actions to fix it.`;
    setChatPrefill(msg);
    setChatOpen(true);
  }

  return (
    <div className={`tw:rounded-2xl tw:border tw:p-5 ${colors.bg} ${colors.border} tw:transition-all`}>
      <div className="tw:flex tw:items-start tw:gap-4">
        <div className={`tw:w-2 tw:h-2 tw:rounded-full tw:mt-2 tw:shrink-0 ${colors.dot}`} />
        <div className="tw:flex-1 tw:min-w-0">
          <div className="tw:flex tw:items-center tw:justify-between tw:gap-3 tw:flex-wrap">
            <div className="tw:flex tw:items-center tw:gap-2">
              <span className={`tw:text-sm tw:font-semibold ${colors.text}`}>{alert.label}</span>
              <span className="tw:text-[10px] tw:font-semibold tw:uppercase tw:tracking-wider tw:text-zinc-600 tw:bg-white/5 tw:px-1.5 tw:py-0.5 tw:rounded">
                {alert.severity}
              </span>
            </div>
            <MetricBadge current={alert.current} baseline={alert.baseline} changePct={alert.changePct} />
          </div>

          <div className="tw:mt-2 tw:flex tw:items-center tw:gap-6 tw:text-xs tw:text-zinc-500">
            <span>Metric: <span className="tw:text-zinc-300 tw:font-medium">{alert.metric}</span></span>
            <span>Recent: <span className="tw:text-zinc-300 tw:font-medium">{typeof alert.current === 'number' ? alert.current.toFixed(3) : alert.current}</span></span>
            <span>Baseline: <span className="tw:text-zinc-300 tw:font-medium">{typeof alert.baseline === 'number' ? alert.baseline.toFixed(3) : alert.baseline}</span></span>
          </div>

          <div className="tw:mt-3 tw:flex tw:items-center tw:gap-3">
            <button
              onClick={() => setExpanded(!expanded)}
              className="tw:flex tw:items-center tw:gap-1.5 tw:text-xs tw:text-zinc-500 hover:tw:text-zinc-300 tw:transition-colors"
            >
              <Info size={12} />
              {expanded ? "Hide suggestion" : "View suggestion"}
            </button>

            <button
              onClick={handleAskAI}
              className="tw:flex tw:items-center tw:gap-1.5 tw:text-xs tw:text-violet-400 hover:tw:text-violet-300 tw:transition-colors tw:px-2.5 tw:py-1 tw:rounded-lg tw:bg-violet-500/10 hover:tw:bg-violet-500/20 tw:border tw:border-violet-500/20"
            >
              <Wand2 size={11} />
              Ask AI
            </button>
          </div>

          {expanded && (
            <div className="tw:mt-3 tw:p-3 tw:rounded-xl tw:bg-black/20 tw:border tw:border-white/5 tw:text-sm tw:text-zinc-400 tw:leading-relaxed">
              {alert.suggestion}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyAlerts() {
  return (
    <div className="tw:flex tw:flex-col tw:items-center tw:justify-center tw:py-20 tw:text-center tw:gap-4">
      <div className="tw:w-16 tw:h-16 tw:rounded-2xl tw:bg-green-500/10 tw:border tw:border-green-500/20 tw:flex tw:items-center tw:justify-center">
        <CheckCircle2 size={28} className="tw:text-green-400" />
      </div>
      <div>
        <p className="tw:text-white tw:font-semibold tw:mb-1">No anomalies detected</p>
        <p className="tw:text-zinc-500 tw:text-sm">All key metrics are within normal ranges compared to the previous 7-day baseline.</p>
      </div>
    </div>
  );
}

const SEVERITY_ORDER = { high: 0, medium: 1, low: 2 };

export default function AlertsPage() {
  const { companyId } = useFilters();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (companyId) params.set("companyId", companyId);
      const res = await fetch(`/api/alerts?${params}`);
      const json = await res.json();
      setData(json);
    } catch {
      setData({ alerts: [], recentMetrics: {}, baselineMetrics: {} });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [companyId]);

  const alerts = data?.alerts ?? [];
  const filtered = filter === "all" ? alerts : alerts.filter((a) => a.severity === filter);
  const counts = { high: alerts.filter((a) => a.severity === "high").length, medium: alerts.filter((a) => a.severity === "medium").length, low: alerts.filter((a) => a.severity === "low").length };

  return (
    <div className="tw:space-y-6">
      {/* Header */}
      <div className="tw:flex tw:items-start tw:justify-between tw:gap-4 tw:flex-wrap">
        <div>
          <div className="tw:flex tw:items-center tw:gap-2 tw:mb-1">
            <BellRing size={18} className="tw:text-zinc-500" />
            <h2 className="tw:text-xl tw:font-semibold tw:text-white">Smart Alerts</h2>
          </div>
          <p className="tw:text-zinc-500 tw:text-sm">
            Anomaly detection comparing the last 7 days vs the prior 7-day baseline.
            {data?.recentWindow && (
              <span className="tw:text-zinc-600"> ({data.recentWindow.start} → {data.recentWindow.end})</span>
            )}
          </p>
        </div>
        <Button onClick={load} variant="outline" className="tw:gap-2 tw:text-sm">
          <RefreshCw size={13} className={loading ? "tw:animate-spin" : ""} />
          Refresh
        </Button>
      </div>

      {/* Severity filter */}
      <div className="tw:flex tw:items-center tw:gap-2 tw:flex-wrap">
        {[["all", "All", alerts.length], ["high", "Critical", counts.high], ["medium", "Warning", counts.medium], ["low", "Info", counts.low]].map(([val, label, count]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={[
              "tw:flex tw:items-center tw:gap-1.5 tw:px-3 tw:py-1.5 tw:rounded-full tw:text-sm tw:font-medium tw:border tw:transition-colors",
              filter === val
                ? "tw:bg-white/10 tw:text-white tw:border-white/20"
                : "tw:text-zinc-500 tw:border-white/[0.07] hover:tw:text-white hover:tw:border-white/15",
            ].join(" ")}
          >
            {label}
            <span className="tw:text-xs tw:bg-white/10 tw:px-1.5 tw:py-0.5 tw:rounded-full">{count}</span>
          </button>
        ))}
      </div>

      {/* Alert cards */}
      {loading ? (
        <div className="tw:space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="tw:h-24 tw:rounded-2xl tw:bg-white/[0.03] tw:border tw:border-white/[0.05] tw:animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyAlerts />
      ) : (
        <div className="tw:space-y-3">
          {filtered.map((alert) => <AlertCard key={alert.id} alert={alert} />)}
        </div>
      )}

      {/* Metrics comparison table */}
      {data && !loading && (
        <div className="tw:rounded-2xl tw:border tw:border-white/[0.07] tw:bg-zinc-900 tw:p-5">
          <h3 className="tw:text-sm tw:font-semibold tw:text-white tw:mb-4">Metric Comparison</h3>
          <div className="tw:grid tw:grid-cols-2 sm:tw:grid-cols-3 md:tw:grid-cols-6 tw:gap-4">
            {Object.entries(data.recentMetrics ?? {}).map(([key, val]) => {
              const baseline = data.baselineMetrics?.[key] ?? 0;
              const change = baseline !== 0 ? ((val - baseline) / Math.abs(baseline)) * 100 : 0;
              const isUp = change > 0;
              return (
                <div key={key} className="tw:text-center">
                  <p className="tw:text-[10px] tw:text-zinc-600 tw:uppercase tw:tracking-widest tw:mb-1">{key}</p>
                  <p className="tw:text-base tw:font-bold tw:text-white">{typeof val === 'number' ? val.toFixed(3) : val}</p>
                  <p className={`tw:text-xs tw:font-medium ${isUp ? "tw:text-red-400" : "tw:text-green-400"}`}>
                    {isUp ? "+" : ""}{change.toFixed(1)}%
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
