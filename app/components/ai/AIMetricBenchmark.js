"use client";

import { useState } from "react";
import { getBenchmarkStatus } from "@/lib/aiInsightPrompts";

const STATUS_COLORS = {
  good: { dot: "tw:bg-emerald-500", text: "tw:text-emerald-400", label: "On target" },
  ok:   { dot: "tw:bg-yellow-500",  text: "tw:text-yellow-400",  label: "Watch" },
  bad:  { dot: "tw:bg-red-500",     text: "tw:text-red-400",     label: "Below target" },
};

/**
 * AIMetricBenchmark — wraps a metric value with a colored status dot and tooltip.
 *
 * Props:
 *  metric  - label string (e.g. "ACOS", "ROAS", "CTR")
 *  value   - raw numeric value
 *  children - the formatted display node
 */
export default function AIMetricBenchmark({ metric, value, children }) {
  const [open, setOpen] = useState(false);
  const result = getBenchmarkStatus(metric, value);

  if (!result) return <>{children}</>;

  const { status, display, bench } = result;
  const colors = STATUS_COLORS[status] ?? STATUS_COLORS.ok;

  return (
    <span className="tw:relative tw:inline-flex tw:items-center tw:gap-1.5">
      {children}

      {/* Status dot */}
      <button
        type="button"
        aria-label={`${metric} benchmark: ${colors.label}`}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className={`tw:w-1.5 tw:h-1.5 tw:rounded-full tw:shrink-0 tw:outline-none tw:border-0 tw:p-0 tw:cursor-default ${colors.dot}`}
      />

      {/* Tooltip */}
      {open && (
        <span
          role="tooltip"
          className="tw:absolute tw:bottom-full tw:left-1/2 -tw:translate-x-1/2 tw:mb-2 tw:z-50 tw:w-52 tw:rounded-xl tw:bg-zinc-900 tw:border tw:border-white/10 tw:shadow-2xl tw:p-3 tw:pointer-events-none"
        >
          <span className="tw:flex tw:items-center tw:justify-between tw:mb-1.5">
            <span className="tw:text-xs tw:font-semibold tw:text-white">{bench.label}</span>
            <span className={`tw:text-[10px] tw:font-bold tw:px-1.5 tw:py-0.5 tw:rounded tw:bg-white/5 ${colors.text}`}>
              {colors.label}
            </span>
          </span>
          <span className="tw:text-[11px] tw:text-zinc-400 tw:leading-snug tw:block tw:mb-1.5">
            {bench.description}
          </span>
          {(bench.good?.min != null || bench.good?.max != null) && (
            <span className="tw:text-[10px] tw:text-zinc-600 tw:block tw:mb-1">
              Target: {bench.good?.max != null ? `<${bench.good.max}${bench.unit}` : `>${bench.good?.min}${bench.unit}`}
            </span>
          )}
          <span className="tw:text-[10px] tw:text-zinc-500 tw:italic tw:block tw:leading-snug">{bench.tip}</span>
        </span>
      )}
    </span>
  );
}
