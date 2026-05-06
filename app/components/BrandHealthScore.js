"use client";

import { useData } from "@/hooks/useData.js";
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { Shield, TrendingUp, TrendingDown, Info } from "lucide-react";
import { useState } from "react";

function getScoreColor(score) {
  if (score >= 75) return { text: "tw:text-emerald-400", ring: "#10b981", label: "Strong" };
  if (score >= 50) return { text: "tw:text-yellow-400", ring: "#f59e0b", label: "Fair" };
  return { text: "tw:text-red-400", ring: "#ef4444", label: "At Risk" };
}

function componentScore(value, target, invert = false) {
  if (!value) return 50;
  const ratio = value / target;
  const raw = invert ? (1 - Math.min(ratio, 1)) * 100 : Math.min(ratio, 1) * 100;
  return Math.round(Math.max(0, Math.min(100, raw)));
}

export default function BrandHealthScore() {
  const [showDetails, setShowDetails] = useState(false);

  const { data: perfData } = useData(
    {
      measures: [
        "ProductStats.tacos",
        "ProductStats.roas",
        "ProductStats.sales",
        "ProductStats.inventoryTotal",
        "ProductStats.totalQuantity",
      ],
    },
    (d) => d.map((r) => ({
      tacos:     parseFloat(r["ProductStats.tacos"] ?? 0),
      roas:      parseFloat(r["ProductStats.roas"] ?? 0),
      sales:     parseFloat(r["ProductStats.sales"] ?? 0),
      inventory: parseFloat(r["ProductStats.inventoryTotal"] ?? 0),
      units:     parseFloat(r["ProductStats.totalQuantity"] ?? 0),
    })),
    "brandhealth",
    "ProductStats.report_date",
    false
  );

  const row = perfData?.[0] ?? {};

  const components = [
    { label: "Ad Efficiency",     score: componentScore(row.tacos, 0.15, true), weight: 0.30, note: `TACOS: ${(row.tacos * 100)?.toFixed(1) ?? "--"}%` },
    { label: "ROAS",              score: componentScore(row.roas, 5),            weight: 0.25, note: `${row.roas?.toFixed(2) ?? "--"}x (target: 5x)` },
    { label: "Revenue Velocity",  score: row.sales > 0 ? 70 : 40,               weight: 0.20, note: row.sales > 0 ? "Active sales" : "No recent sales" },
    { label: "Inventory Health",  score: row.inventory > 100 ? 85 : row.inventory > 30 ? 60 : 30, weight: 0.15, note: `${Math.round(row.inventory ?? 0)} units in FBA` },
    { label: "Sales Velocity",    score: row.units > 0 ? 75 : 45,               weight: 0.10, note: `${Math.round(row.units ?? 0)} units sold` },
  ];

  const overall = Math.round(
    components.reduce((sum, c) => sum + c.score * c.weight, 0)
  );

  const { text: scoreColor, ring: ringColor, label: scoreLabel } = getScoreColor(overall);

  const chartData = [{ value: overall }];

  return (
    <div className="tw:rounded-2xl tw:border tw:border-white/[0.07] tw:bg-zinc-900 tw:p-5">
      <div className="tw:flex tw:items-center tw:justify-between tw:mb-4">
        <div className="tw:flex tw:items-center tw:gap-2">
          <Shield size={15} className="tw:text-zinc-500" />
          <h3 className="tw:text-sm tw:font-semibold tw:text-white">Brand Health Score</h3>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="tw:flex tw:items-center tw:gap-1 tw:text-xs tw:text-zinc-600 hover:tw:text-zinc-400 tw:transition-colors"
        >
          <Info size={11} />
          {showDetails ? "Hide" : "Details"}
        </button>
      </div>

      <div className="tw:flex tw:items-center tw:gap-5">
        {/* Gauge */}
        <div className="tw:relative tw:w-24 tw:h-24 tw:shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              innerRadius="70%"
              outerRadius="100%"
              data={chartData}
              startAngle={220}
              endAngle={-40}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
              <RadialBar
                background={{ fill: "rgba(255,255,255,0.04)" }}
                dataKey="value"
                angleAxisId={0}
                fill={ringColor}
                cornerRadius={4}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="tw:absolute tw:inset-0 tw:flex tw:flex-col tw:items-center tw:justify-center">
            <span className={`tw:text-xl tw:font-bold ${scoreColor}`}>{overall}</span>
            <span className="tw:text-[10px] tw:text-zinc-600">/100</span>
          </div>
        </div>

        {/* Label + quick summary */}
        <div className="tw:flex-1 tw:min-w-0">
          <p className={`tw:text-base tw:font-semibold tw:mb-1 ${scoreColor}`}>{scoreLabel}</p>
          <p className="tw:text-xs tw:text-zinc-500 tw:leading-relaxed">
            Composite score from ad efficiency, ROAS, revenue velocity, inventory health, and sales volume.
          </p>
        </div>
      </div>

      {/* Breakdown */}
      {showDetails && (
        <div className="tw:mt-4 tw:pt-4 tw:border-t tw:border-white/[0.05] tw:space-y-2.5">
          {components.map((comp) => {
            const { text, ring } = getScoreColor(comp.score);
            return (
              <div key={comp.label}>
                <div className="tw:flex tw:justify-between tw:items-center tw:mb-1">
                  <span className="tw:text-xs tw:text-zinc-500">{comp.label}</span>
                  <span className={`tw:text-xs tw:font-semibold ${text}`}>{comp.score}</span>
                </div>
                <div className="tw:h-1 tw:rounded-full tw:bg-white/[0.05]">
                  <div className="tw:h-1 tw:rounded-full tw:transition-all" style={{ width: `${comp.score}%`, background: ring }} />
                </div>
                <p className="tw:text-[10px] tw:text-zinc-700 tw:mt-0.5">{comp.note}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
