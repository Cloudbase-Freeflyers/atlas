"use client";

import Link from "next/link";
import { formatValue } from "../lib/formatters.js";
import { ArrowRight } from "lucide-react";

const TAG_COLORS = {
  "Overview":       "tw:bg-cyan-500/10 tw:text-cyan-400 tw:border-cyan-500/20",
  "Advertising":    "tw:bg-violet-500/10 tw:text-violet-400 tw:border-violet-500/20",
  "Seller Central": "tw:bg-emerald-500/10 tw:text-emerald-400 tw:border-emerald-500/20",
  "Search":         "tw:bg-blue-500/10 tw:text-blue-400 tw:border-blue-500/20",
  "Campaigns":      "tw:bg-orange-500/10 tw:text-orange-400 tw:border-orange-500/20",
  "Inventory":      "tw:bg-yellow-500/10 tw:text-yellow-400 tw:border-yellow-500/20",
  "Catalog":        "tw:bg-pink-500/10 tw:text-pink-400 tw:border-pink-500/20",
  "Trends":         "tw:bg-teal-500/10 tw:text-teal-400 tw:border-teal-500/20",
  "Insights":       "tw:bg-amber-500/10 tw:text-amber-400 tw:border-amber-500/20",
  "New":            "tw:bg-cyan-500/10 tw:text-cyan-400 tw:border-cyan-500/20",
};

export default function DashboardCard({ href, title, description, stats, tag, isLoading, isNew }) {
  const tagClass = TAG_COLORS[tag] ?? "tw:bg-white/5 tw:text-zinc-400 tw:border-white/10";

  return (
    <Link
      href={href}
      className="tw:group tw:relative tw:flex tw:flex-col tw:gap-3.5 tw:p-5 tw:rounded-2xl tw:border tw:border-white/[0.07] tw:bg-zinc-900 hover:tw:border-white/20 hover:tw:bg-zinc-800/60 tw:transition-all tw:duration-200 tw:overflow-hidden"
    >
      {/* Hover glow */}
      <span className="tw:absolute tw:inset-x-0 tw:bottom-0 tw:h-px tw:bg-gradient-to-r tw:from-transparent tw:via-cyan-500/40 tw:to-transparent tw:opacity-0 group-hover:tw:opacity-100 tw:transition-opacity" />

      {/* Header */}
      <div className="tw:flex tw:items-start tw:justify-between tw:gap-2">
        <span className={`tw:inline-flex tw:items-center tw:text-[11px] tw:font-semibold tw:uppercase tw:tracking-wider tw:px-2 tw:py-0.5 tw:rounded-full tw:border ${tagClass}`}>
          {tag}
        </span>
        {isNew && (
          <span className="tw:text-[10px] tw:font-semibold tw:px-1.5 tw:py-0.5 tw:rounded tw:bg-cyan-500/15 tw:text-cyan-400 tw:border tw:border-cyan-500/25">
            New
          </span>
        )}
      </div>

      {/* Title + description */}
      <div>
        <h3 className="tw:text-white tw:font-semibold tw:text-[15px] tw:mb-1 tw:leading-snug">{title}</h3>
        <p className="tw:text-zinc-500 tw:text-xs tw:leading-relaxed tw:line-clamp-2">{description}</p>
      </div>

      {/* Stats */}
      <div className="tw:flex tw:items-center tw:gap-4 tw:mt-auto">
        {isLoading ? (
          <div className="tw:flex tw:gap-3">
            <div className="tw:h-3 tw:w-16 tw:rounded tw:bg-white/5 tw:animate-pulse" />
            <div className="tw:h-3 tw:w-12 tw:rounded tw:bg-white/5 tw:animate-pulse" />
          </div>
        ) : (
          stats?.map((item) => (
            <div key={item.label} className="tw:flex tw:flex-col tw:gap-0.5">
              <span className="tw:text-[11px] tw:text-zinc-600 tw:uppercase tw:tracking-wider tw:font-medium">{item.label}</span>
              <span className="tw:text-sm tw:font-semibold tw:text-zinc-300">
                {item.value && item.value !== "--" ? formatValue(item.value, item.formatter) : "—"}
              </span>
            </div>
          ))
        )}
        <ArrowRight size={14} className="tw:ml-auto tw:text-zinc-700 group-hover:tw:text-zinc-400 tw:transition-colors tw:shrink-0" />
      </div>
    </Link>
  );
}
