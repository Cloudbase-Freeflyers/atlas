"use client";

import { useData } from "@/hooks/useData.js";
import { formatValue } from "@/lib/formatters.js";
import { PieChart, TrendingDown, TrendingUp, DollarSign, Info } from "lucide-react";
import AIPageBrief from "@/components/ai/AIPageBrief";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer, ReferenceLine,
} from "recharts";

/* ── Waterfall helpers ──────────────────────────────────────── */

function buildWaterfallData(revenue, adCost, organicSales, totalUnits) {
  const fbaFeeRate = 0.15;       // ~15% of revenue estimate
  const cogsRate   = 0.30;       // ~30% of revenue estimate
  const fbaFees    = revenue * fbaFeeRate;
  const cogs       = revenue * cogsRate;
  const refunds    = revenue * 0.02;
  const netProfit  = revenue - adCost - fbaFees - cogs - refunds;

  const steps = [
    { name: "Revenue",     value: revenue,          cumulative: revenue,                       isBase: true },
    { name: "− Ad Spend",  value: -adCost,           cumulative: revenue - adCost,             isNeg: true },
    { name: "− FBA Fees",  value: -fbaFees,          cumulative: revenue - adCost - fbaFees,   isNeg: true },
    { name: "− COGS",      value: -cogs,             cumulative: revenue - adCost - fbaFees - cogs, isNeg: true },
    { name: "− Refunds",   value: -refunds,          cumulative: revenue - adCost - fbaFees - cogs - refunds, isNeg: true },
    { name: "Net Profit",  value: netProfit,          cumulative: netProfit,                    isResult: true },
  ];

  // Build waterfall: base = start y position, size = bar length
  let running = 0;
  return steps.map((s) => {
    if (s.isBase) {
      const out = { ...s, base: 0, size: s.value };
      running = s.value;
      return out;
    }
    if (s.isResult) {
      return { ...s, base: 0, size: s.value };
    }
    const start = running + s.value;
    const out = { ...s, base: Math.min(start, running), size: Math.abs(s.value) };
    running = running + s.value;
    return out;
  });
}

const CustomWaterfallTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="tw:bg-zinc-900 tw:border tw:border-white/10 tw:rounded-xl tw:px-4 tw:py-3 tw:text-sm tw:shadow-xl">
      <p className="tw:font-semibold tw:text-white tw:mb-1">{d.name}</p>
      <p className={d.isNeg ? "tw:text-red-400" : "tw:text-emerald-400"}>
        {d.isNeg ? "-" : "+"}{formatValue(Math.abs(d.value), "currency")}
      </p>
      {!d.isBase && !d.isResult && (
        <p className="tw:text-zinc-500 tw:text-xs tw:mt-0.5">Running: {formatValue(d.cumulative, "currency")}</p>
      )}
    </div>
  );
};

function KpiBox({ label, value, formatter = "currency", trend, subtitle }) {
  const isPos = trend > 0;
  return (
    <div className="tw:rounded-2xl tw:border tw:border-white/[0.07] tw:bg-zinc-900 tw:p-5">
      <p className="tw:text-[11px] tw:uppercase tw:tracking-widest tw:text-zinc-600 tw:mb-2">{label}</p>
      <p className="tw:text-2xl tw:font-bold tw:text-white">{formatValue(value, formatter)}</p>
      {trend !== undefined && (
        <div className={`tw:flex tw:items-center tw:gap-1 tw:mt-1 tw:text-xs tw:font-medium ${isPos ? "tw:text-emerald-400" : "tw:text-red-400"}`}>
          {isPos ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {isPos ? "+" : ""}{trend?.toFixed(1)}% vs prior period
        </div>
      )}
      {subtitle && <p className="tw:text-xs tw:text-zinc-600 tw:mt-1">{subtitle}</p>}
    </div>
  );
}

export default function PnlPage() {
  const { data, isLoading } = useData(
    {
      measures: [
        "PnlDistribution.adSales",
        "PnlDistribution.organicSales",
        "PnlDistribution.totalSales",
        "PnlDistribution.adCost",
        "PnlDistribution.profit",
        "PnlDistribution.totalUnits",
        "PnlDistribution.organicUnits",
      ],
    },
    (d) =>
      d.map((r) => ({
        adSales:      parseFloat(r["PnlDistribution.adSales"] ?? 0),
        organicSales: parseFloat(r["PnlDistribution.organicSales"] ?? 0),
        totalSales:   parseFloat(r["PnlDistribution.totalSales"] ?? 0),
        adCost:       parseFloat(r["PnlDistribution.adCost"] ?? 0),
        profit:       parseFloat(r["PnlDistribution.profit"] ?? 0),
        totalUnits:   parseFloat(r["PnlDistribution.totalUnits"] ?? 0),
        organicUnits: parseFloat(r["PnlDistribution.organicUnits"] ?? 0),
      })),
    "pnlpage",
    "PnlDistribution.report_date",
    false
  );

  const row = data?.[0] ?? {};
  const revenue    = row.totalSales ?? 0;
  const adCost     = row.adCost ?? 0;
  const profit     = row.profit ?? 0;
  const totalUnits = row.totalUnits ?? 0;
  const fbaFees    = revenue * 0.15;
  const cogs       = revenue * 0.30;
  const netProfit  = revenue - adCost - fbaFees - cogs - revenue * 0.02;
  const netMargin  = revenue > 0 ? (netProfit / revenue) * 100 : 0;
  const tacos      = revenue > 0 ? (adCost / revenue) * 100 : 0;

  const waterfallData = buildWaterfallData(revenue, adCost, row.organicSales ?? 0, totalUnits);

  const briefMetrics = {
    "Total Revenue": revenue,
    "Ad Spend": adCost,
    "Est. FBA Fees": fbaFees,
    "Est. COGS": cogs,
    "Est. Net Profit": netProfit,
    "Net Margin %": netMargin,
    "TACOS %": tacos,
  };

  return (
    <div className="tw:space-y-6">
      {/* Header */}
      <div>
        <div className="tw:flex tw:items-center tw:gap-2 tw:mb-1">
          <DollarSign size={18} className="tw:text-zinc-500" />
          <h2 className="tw:text-xl tw:font-semibold tw:text-white">P&L Dashboard</h2>
        </div>
        <p className="tw:text-zinc-500 tw:text-sm tw:flex tw:items-center tw:gap-1.5">
          True profitability breakdown across revenue, ad cost, FBA fees, COGS, and net margin.
          <span className="tw:flex tw:items-center tw:gap-1 tw:text-zinc-600 tw:text-xs">
            <Info size={11} /> FBA fees and COGS use estimated rates. Enter actual values in Product Details for exact figures.
          </span>
        </p>
      </div>

      <AIPageBrief page="pnl" metrics={briefMetrics} title="P&L AI Brief" />

      {/* KPI Row */}
      {isLoading ? (
        <div className="tw:grid tw:grid-cols-2 md:tw:grid-cols-5 tw:gap-4">
          {[...Array(5)].map((_, i) => <div key={i} className="tw:h-24 tw:rounded-2xl tw:bg-white/[0.03] tw:animate-pulse tw:border tw:border-white/[0.05]" />)}
        </div>
      ) : (
        <div className="tw:grid tw:grid-cols-2 md:tw:grid-cols-5 tw:gap-4">
          <KpiBox label="Revenue"     value={revenue}    formatter="currency" />
          <KpiBox label="Ad Spend"    value={adCost}     formatter="currency" subtitle={`TACOS: ${tacos.toFixed(1)}%`} />
          <KpiBox label="Est. FBA Fees" value={fbaFees}  formatter="currency" subtitle="~15% of revenue" />
          <KpiBox label="Est. COGS"   value={cogs}       formatter="currency" subtitle="~30% of revenue" />
          <KpiBox label="Net Profit"  value={netProfit}  formatter="currency" subtitle={`${netMargin.toFixed(1)}% margin`} />
        </div>
      )}

      {/* Waterfall Chart */}
      <div className="tw:rounded-2xl tw:border tw:border-white/[0.07] tw:bg-zinc-900 tw:p-6">
        <h3 className="tw:text-sm tw:font-semibold tw:text-white tw:mb-5">Revenue Waterfall — Margin Breakdown</h3>
        {isLoading ? (
          <div className="tw:h-72 tw:bg-white/[0.02] tw:rounded-xl tw:animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={waterfallData} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomWaterfallTooltip />} />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
              {/* Invisible base bar for waterfall offset */}
              <Bar dataKey="base" stackId="w" fill="transparent" />
              <Bar dataKey="size" stackId="w" radius={[4, 4, 0, 0]}>
                {waterfallData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={
                      entry.isBase    ? "#00d4ff" :
                      entry.isResult  ? (entry.value >= 0 ? "#10b981" : "#ef4444") :
                      entry.isNeg     ? "#ef4444" : "#10b981"
                    }
                    fillOpacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Sales split */}
      <div className="tw:grid tw:grid-cols-1 md:tw:grid-cols-2 tw:gap-4">
        <div className="tw:rounded-2xl tw:border tw:border-white/[0.07] tw:bg-zinc-900 tw:p-5">
          <h3 className="tw:text-sm tw:font-semibold tw:text-white tw:mb-4">Sales Channel Split</h3>
          <div className="tw:space-y-3">
            {[
              { label: "Organic Sales", value: row.organicSales ?? 0, total: revenue, color: "tw:bg-emerald-500" },
              { label: "Ad-Attributed Sales", value: row.adSales ?? 0, total: revenue, color: "tw:bg-cyan-500" },
            ].map((item) => {
              const pct = revenue > 0 ? (item.value / revenue) * 100 : 0;
              return (
                <div key={item.label}>
                  <div className="tw:flex tw:justify-between tw:text-sm tw:mb-1.5">
                    <span className="tw:text-zinc-400">{item.label}</span>
                    <span className="tw:text-white tw:font-medium">{formatValue(item.value, "currency")} <span className="tw:text-zinc-600">({pct.toFixed(0)}%)</span></span>
                  </div>
                  <div className="tw:h-1.5 tw:rounded-full tw:bg-white/[0.05]">
                    <div className={`tw:h-1.5 tw:rounded-full ${item.color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="tw:rounded-2xl tw:border tw:border-white/[0.07] tw:bg-zinc-900 tw:p-5">
          <h3 className="tw:text-sm tw:font-semibold tw:text-white tw:mb-4">Cost Breakdown</h3>
          <div className="tw:space-y-2">
            {[
              { label: "Ad Spend",     value: adCost,       pct: revenue > 0 ? adCost/revenue*100 : 0,   color: "tw:text-red-400" },
              { label: "Est. FBA Fees",value: fbaFees,      pct: 15,                                      color: "tw:text-orange-400" },
              { label: "Est. COGS",    value: cogs,         pct: 30,                                      color: "tw:text-yellow-400" },
              { label: "Refunds",      value: revenue*0.02, pct: 2,                                       color: "tw:text-zinc-500" },
            ].map((item) => (
              <div key={item.label} className="tw:flex tw:items-center tw:justify-between tw:py-2 tw:border-b tw:border-white/[0.05] last:tw:border-0">
                <span className="tw:text-zinc-400 tw:text-sm">{item.label}</span>
                <div className="tw:text-right">
                  <span className={`tw:text-sm tw:font-medium ${item.color}`}>{formatValue(item.value, "currency")}</span>
                  <span className="tw:text-zinc-600 tw:text-xs tw:ml-2">{item.pct.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
