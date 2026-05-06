"use client";

import { useState } from "react";
import { useData } from "@/hooks/useData.js";
import {
  Wallet, Sparkles, TrendingUp, TrendingDown, Minus,
  Loader2, AlertCircle, CheckCircle2, Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const ACTION_STYLES = {
  increase: { icon: TrendingUp,   cls: "tw:text-emerald-400", bg: "tw:bg-emerald-500/10 tw:border-emerald-500/20" },
  decrease: { icon: TrendingDown, cls: "tw:text-red-400",     bg: "tw:bg-red-500/10 tw:border-red-500/20" },
  maintain: { icon: Minus,        cls: "tw:text-zinc-400",    bg: "tw:bg-white/[0.04] tw:border-white/[0.07]" },
};

const PIE_COLORS = ["#00d4ff", "#7c3aed", "#10b981", "#f59e0b", "#ef4444", "#6366f1"];

function CampaignCard({ c, totalSpend }) {
  const pct = totalSpend > 0 ? (c.spend / totalSpend) * 100 : 0;
  return (
    <div className="tw:rounded-xl tw:border tw:border-white/[0.06] tw:bg-white/[0.02] tw:p-3 tw:space-y-2">
      <div className="tw:flex tw:items-center tw:justify-between tw:gap-1">
        <p className="tw:text-xs tw:text-zinc-300 tw:truncate tw:font-medium">{c.name}</p>
        <span className="tw:text-[10px] tw:text-zinc-500 tw:bg-white/5 tw:px-1.5 tw:rounded tw:shrink-0">{c.type}</span>
      </div>
      <div className="tw:grid tw:grid-cols-3 tw:gap-1 tw:pt-1 tw:border-t tw:border-white/[0.05]">
        <div>
          <p className="tw:text-[9px] tw:uppercase tw:tracking-widest tw:text-zinc-600 tw:mb-0.5">Daily Budget</p>
          <p className="tw:text-xs tw:font-semibold tw:text-white">${c.currentBudget.toFixed(0)}</p>
        </div>
        <div>
          <p className="tw:text-[9px] tw:uppercase tw:tracking-widest tw:text-zinc-600 tw:mb-0.5">Avg/Day</p>
          <p className="tw:text-xs tw:font-semibold tw:text-cyan-400">${(c.spend / 30).toFixed(0)}</p>
        </div>
        <div>
          <p className="tw:text-[9px] tw:uppercase tw:tracking-widest tw:text-zinc-600 tw:mb-0.5">% Spend</p>
          <p className="tw:text-xs tw:font-semibold tw:text-violet-400">{pct.toFixed(1)}%</p>
        </div>
      </div>
      <div className="tw:flex tw:items-center tw:justify-between">
        <span className="tw:text-[10px] tw:text-zinc-600">ROAS</span>
        <span className="tw:text-xs tw:font-semibold tw:text-emerald-400">{c.roas?.toFixed(2)}x</span>
      </div>
    </div>
  );
}

function RecommendationRow({ rec, suggestedBudget, onBudgetChange, applied }) {
  const style = ACTION_STYLES[rec.action] ?? ACTION_STYLES.maintain;
  const Icon = style.icon;
  const change = rec.currentBudget > 0
    ? ((suggestedBudget - rec.currentBudget) / rec.currentBudget) * 100
    : 0;

  return (
    <div className={`tw:rounded-2xl tw:border tw:p-5 ${style.bg} tw:transition-all`}>
      <div className="tw:flex tw:items-start tw:gap-3 tw:flex-wrap">

        {/* Left: name + rationale */}
        <div className="tw:flex-1 tw:min-w-0">
          <div className="tw:flex tw:items-center tw:gap-2 tw:mb-1 tw:flex-wrap">
            <span className="tw:text-[10px] tw:font-bold tw:uppercase tw:tracking-widest tw:text-zinc-600 tw:bg-white/5 tw:px-1.5 tw:py-0.5 tw:rounded">
              {rec.campaignType}
            </span>
            <h3 className="tw:text-sm tw:font-semibold tw:text-white tw:truncate">{rec.campaignName}</h3>
            {applied && (
              <span className="tw:flex tw:items-center tw:gap-1 tw:text-[10px] tw:font-semibold tw:text-emerald-400">
                <CheckCircle2 size={11} /> Applied
              </span>
            )}
          </div>
          <p className="tw:text-xs tw:text-zinc-500 tw:leading-relaxed">{rec.rationale}</p>
        </div>

        {/* Right: action badge */}
        <div className={`tw:flex tw:items-center tw:gap-1 tw:shrink-0 ${style.cls}`}>
          <Icon size={14} />
          <span className="tw:text-sm tw:font-semibold">{change > 0 ? "+" : ""}{change.toFixed(0)}%</span>
        </div>
      </div>

      {/* Stats row + editable budget input */}
      <div className="tw:mt-4 tw:grid tw:grid-cols-2 sm:tw:grid-cols-4 tw:gap-4 tw:items-end">
        <div>
          <p className="tw:text-[10px] tw:uppercase tw:tracking-widest tw:text-zinc-600 tw:mb-1">Current Daily</p>
          <p className="tw:text-sm tw:font-semibold tw:text-zinc-400">${rec.currentBudget?.toFixed(0)}/day</p>
        </div>

        {/* Editable suggested budget */}
        <div>
          <p className="tw:text-[10px] tw:uppercase tw:tracking-widest tw:text-zinc-600 tw:mb-1">
            Suggested Budget
          </p>
          <div className="tw:relative tw:w-28">
            <span className="tw:absolute tw:left-2.5 tw:top-1/2 tw:-translate-y-1/2 tw:text-zinc-500 tw:text-xs tw:pointer-events-none">$</span>
            <input
              type="number"
              value={suggestedBudget}
              onChange={(e) => onBudgetChange(+e.target.value)}
              min={5}
              step={1}
              className={`tw:w-full tw:pl-5 tw:pr-2 tw:py-1.5 tw:rounded-lg tw:border tw:text-sm tw:font-semibold tw:bg-black/40 tw:text-white focus:tw:outline-none focus:tw:border-cyan-500/50 ${style.cls} tw:border-white/10`}
            />
          </div>
        </div>

        <div>
          <p className="tw:text-[10px] tw:uppercase tw:tracking-widest tw:text-zinc-600 tw:mb-1">Proj. ROAS</p>
          <p className="tw:text-sm tw:font-semibold tw:text-zinc-300">{rec.projectedROAS?.toFixed(2)}x</p>
        </div>

        <div>
          <p className="tw:text-[10px] tw:uppercase tw:tracking-widest tw:text-zinc-600 tw:mb-1">Action</p>
          <p className={`tw:text-sm tw:font-semibold ${style.cls}`}>
            {rec.action.charAt(0).toUpperCase() + rec.action.slice(1)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function BudgetOptimizerPage() {
  const [totalBudget, setTotalBudget] = useState(10000);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [applyResult, setApplyResult] = useState(null);
  // editable budgets: { [campaignName]: number }
  const [editedBudgets, setEditedBudgets] = useState({});

  const { data: campaignData, isLoading: campaignsLoading } = useData(
    {
      measures: [
        "AdsCampaignReports.spend",
        "AdsCampaignReports.sales14d",
        "AdsCampaignReports.roas",
        "AdsCampaignReports.acos",
        "AdsCampaignReports.purchases14d",
        "AdsCampaignReports.count",
      ],
      dimensions: ["AdsCampaignReports.campaign_name", "AdsCampaignReports.ad_type"],
      limit: 20,
    },
    (d) =>
      d.map((r) => ({
        name:          r["AdsCampaignReports.campaign_name"] ?? "Campaign",
        type:          (r["AdsCampaignReports.ad_type"] ?? "SP").toUpperCase().slice(0, 2),
        spend:         parseFloat(r["AdsCampaignReports.spend"] ?? 0),
        sales:         parseFloat(r["AdsCampaignReports.sales14d"] ?? 0),
        roas:          parseFloat(r["AdsCampaignReports.roas"] ?? 0),
        acos:          parseFloat(r["AdsCampaignReports.acos"] ?? 0),
        conversions:   parseInt(r["AdsCampaignReports.purchases14d"] ?? 0),
        currentBudget: parseFloat(r["AdsCampaignReports.spend"] ?? 0) / 30,
      })),
    "budgetopt",
    "AdsCampaignReports.report_date",
    false
  );

  const campaigns = campaignData ?? [];
  const totalSpend = campaigns.reduce((sum, c) => sum + c.spend, 0);

  async function runOptimizer() {
    if (!campaigns.length) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setApplyResult(null);
    setEditedBudgets({});
    try {
      const res = await fetch("/api/budget-optimizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ totalBudget, campaigns }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setResult(json);
      // pre-fill edited budgets with AI suggestions
      const initial = {};
      json.recommendations?.forEach((r) => {
        initial[r.campaignName] = r.recommendedBudget;
      });
      setEditedBudgets(initial);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function setBudget(name, value) {
    setEditedBudgets((prev) => ({ ...prev, [name]: value }));
  }

  // total of all editable budgets
  const editedTotal = Object.values(editedBudgets).reduce((s, v) => s + (v || 0), 0);
  const dailyCap = totalBudget / 30;
  const budgetDiff = editedTotal - dailyCap;

  async function submitBudgets() {
    if (!result?.recommendations?.length) return;
    setApplying(true);
    setApplyResult(null);
    try {
      const recommendations = result.recommendations.map((r) => ({
        ...r,
        recommendedBudget: editedBudgets[r.campaignName] ?? r.recommendedBudget,
      }));
      const res = await fetch("/api/budget-optimizer/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recommendations }),
      });
      const json = await res.json();
      setApplyResult(json);
    } catch (err) {
      setApplyResult({ error: err.message });
    } finally {
      setApplying(false);
    }
  }

  const appliedNames = new Set(applyResult?.applied?.map((a) => a.campaignName) ?? []);

  const pieData = result?.recommendations?.map((r) => ({
    name: r.campaignName?.length > 20 ? r.campaignName.slice(0, 20) + "…" : r.campaignName,
    value: editedBudgets[r.campaignName] ?? r.recommendedBudget,
  }));

  return (
    <div className="tw:space-y-6">

      {/* Header */}
      <div>
        <div className="tw:flex tw:items-center tw:gap-2 tw:mb-1">
          <Wallet size={18} className="tw:text-zinc-500" />
          <h2 className="tw:text-xl tw:font-semibold tw:text-white">AI Budget Optimizer</h2>
        </div>
        <p className="tw:text-zinc-500 tw:text-sm">
          Enter your total monthly budget. The AI analyzes your active campaigns and recommends daily budget allocation — you can edit any number before submitting.
        </p>
      </div>

      {/* Config Panel */}
      <div className="tw:rounded-2xl tw:border tw:border-white/[0.07] tw:bg-zinc-900 tw:p-6">
        <div className="tw:flex tw:items-end tw:gap-4 tw:flex-wrap">
          <div>
            <label className="tw:block tw:text-xs tw:text-zinc-500 tw:uppercase tw:tracking-widest tw:mb-2">Monthly Budget ($)</label>
            <div className="tw:relative">
              <span className="tw:absolute tw:left-3 tw:top-1/2 tw:-translate-y-1/2 tw:text-zinc-500 tw:text-sm">$</span>
              <input
                type="number"
                value={totalBudget}
                onChange={(e) => setTotalBudget(+e.target.value)}
                className="tw:pl-7 tw:pr-4 tw:py-2.5 tw:rounded-xl tw:border tw:border-white/10 tw:bg-black/30 tw:text-white tw:text-sm tw:w-40 focus:tw:outline-none focus:tw:border-cyan-500/40"
                min={0}
                step={1000}
              />
            </div>
          </div>
          <div>
            <label className="tw:block tw:text-xs tw:text-zinc-500 tw:uppercase tw:tracking-widest tw:mb-2">Campaigns</label>
            <p className="tw:text-white tw:font-semibold tw:text-2xl">{campaignsLoading ? "—" : campaigns.length}</p>
          </div>
          <div>
            <label className="tw:block tw:text-xs tw:text-zinc-500 tw:uppercase tw:tracking-widest tw:mb-2">Total Spend</label>
            <p className="tw:text-white tw:font-semibold tw:text-2xl">
              {campaignsLoading ? "—" : `$${totalSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            </p>
          </div>
          <Button
            onClick={runOptimizer}
            disabled={loading || campaignsLoading || !campaigns.length}
            className="tw:gap-2 tw:bg-cyan-500 tw:text-black hover:tw:bg-cyan-400 tw:font-semibold"
          >
            {loading ? <Loader2 size={14} className="tw:animate-spin" /> : <Sparkles size={14} />}
            {loading ? "Analyzing…" : "Optimize with AI"}
          </Button>
        </div>

        {/* Current campaign overview cards */}
        {campaigns.length > 0 && !loading && (
          <div className="tw:mt-5 tw:border-t tw:border-white/[0.06] tw:pt-5">
            <p className="tw:text-xs tw:text-zinc-600 tw:uppercase tw:tracking-widest tw:mb-3">Current Campaign Overview</p>
            <div className="tw:grid tw:grid-cols-2 sm:tw:grid-cols-3 md:tw:grid-cols-4 tw:gap-3">
              {campaigns.slice(0, 8).map((c, i) => (
                <CampaignCard key={i} c={c} totalSpend={totalSpend} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="tw:flex tw:items-center tw:gap-3 tw:p-4 tw:rounded-2xl tw:border tw:border-red-500/20 tw:bg-red-500/10">
          <AlertCircle size={16} className="tw:text-red-400 tw:shrink-0" />
          <p className="tw:text-red-400 tw:text-sm">{error}</p>
        </div>
      )}

      {/* Skeleton */}
      {loading && (
        <div className="tw:space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="tw:h-32 tw:rounded-2xl tw:bg-white/[0.03] tw:animate-pulse tw:border tw:border-white/[0.05]" />
          ))}
        </div>
      )}

      {/* ── Results ── */}
      {result && !loading && (
        <div className="tw:space-y-6">

          {/* AI Strategy Summary */}
          <div className="tw:rounded-2xl tw:border tw:border-cyan-500/20 tw:bg-cyan-500/5 tw:p-5">
            <div className="tw:flex tw:items-center tw:gap-2 tw:mb-2">
              <Sparkles size={14} className="tw:text-cyan-400" />
              <p className="tw:text-sm tw:font-semibold tw:text-cyan-400">AI Strategy Summary</p>
            </div>
            <p className="tw:text-sm tw:text-zinc-300 tw:leading-relaxed">{result.summary}</p>
            {result.allocationStrategy && (
              <p className="tw:text-xs tw:text-zinc-500 tw:mt-2 tw:leading-relaxed">{result.allocationStrategy}</p>
            )}
            <div className="tw:mt-4 tw:flex tw:flex-wrap tw:gap-2">
              {result.keyInsights?.map((insight, i) => (
                <span key={i} className="tw:text-xs tw:text-zinc-400 tw:bg-white/5 tw:border tw:border-white/[0.07] tw:px-3 tw:py-1.5 tw:rounded-full">
                  {insight}
                </span>
              ))}
            </div>
          </div>

          {/* Projections */}
          <div className="tw:grid tw:grid-cols-2 sm:tw:grid-cols-4 tw:gap-4">
            <div className="tw:rounded-2xl tw:border tw:border-white/[0.07] tw:bg-zinc-900 tw:p-5 tw:text-center">
              <p className="tw:text-xs tw:uppercase tw:tracking-widest tw:text-zinc-600 tw:mb-2">Proj. ROAS</p>
              <p className="tw:text-3xl tw:font-bold tw:text-emerald-400">{result.projectedTotalROAS?.toFixed(2)}x</p>
            </div>
            <div className="tw:rounded-2xl tw:border tw:border-white/[0.07] tw:bg-zinc-900 tw:p-5 tw:text-center">
              <p className="tw:text-xs tw:uppercase tw:tracking-widest tw:text-zinc-600 tw:mb-2">Proj. ACOS</p>
              <p className="tw:text-3xl tw:font-bold tw:text-cyan-400">{result.projectedTotalAcos?.toFixed(1)}%</p>
            </div>
            <div className="tw:rounded-2xl tw:border tw:border-white/[0.07] tw:bg-zinc-900 tw:p-5 tw:text-center">
              <p className="tw:text-xs tw:uppercase tw:tracking-widest tw:text-zinc-600 tw:mb-2">Daily Cap</p>
              <p className="tw:text-3xl tw:font-bold tw:text-white">${dailyCap.toFixed(0)}</p>
            </div>
            <div className="tw:rounded-2xl tw:border tw:border-white/[0.07] tw:bg-zinc-900 tw:p-5 tw:text-center">
              <p className="tw:text-xs tw:uppercase tw:tracking-widest tw:text-zinc-600 tw:mb-2">Campaigns</p>
              <p className="tw:text-3xl tw:font-bold tw:text-violet-400">{result.recommendations?.length ?? 0}</p>
            </div>
          </div>

          {/* Chart + Recommendation rows */}
          <div className="tw:grid tw:grid-cols-1 lg:tw:grid-cols-3 tw:gap-6">
            {/* Pie: live-updates as user edits */}
            {pieData?.length > 0 && (
              <div className="tw:rounded-2xl tw:border tw:border-white/[0.07] tw:bg-zinc-900 tw:p-5 tw:self-start">
                <h3 className="tw:text-sm tw:font-semibold tw:text-white tw:mb-1">Budget Allocation</h3>
                <p className="tw:text-xs tw:text-zinc-600 tw:mb-4">Updates as you edit</p>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v) => `$${v?.toFixed(0)}/day`}
                      contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: "12px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Recommendation cards with editable inputs */}
            <div className={`tw:space-y-3 ${pieData?.length > 0 ? "lg:tw:col-span-2" : "lg:tw:col-span-3"}`}>
              {result.recommendations?.map((rec, i) => (
                <RecommendationRow
                  key={i}
                  rec={rec}
                  suggestedBudget={editedBudgets[rec.campaignName] ?? rec.recommendedBudget}
                  onBudgetChange={(v) => setBudget(rec.campaignName, v)}
                  applied={appliedNames.has(rec.campaignName)}
                />
              ))}
            </div>
          </div>

          {/* Submit bar */}
          <div className="tw:rounded-2xl tw:border tw:border-white/[0.07] tw:bg-zinc-900 tw:p-5">
            <div className="tw:flex tw:items-center tw:justify-between tw:gap-4 tw:flex-wrap">
              {/* Budget total vs cap */}
              <div className="tw:flex tw:items-center tw:gap-6">
                <div>
                  <p className="tw:text-xs tw:text-zinc-500 tw:uppercase tw:tracking-widest tw:mb-0.5">Total Allocated</p>
                  <p className="tw:text-xl tw:font-bold tw:text-white">${editedTotal.toFixed(0)}<span className="tw:text-zinc-600 tw:text-sm tw:font-normal">/day</span></p>
                </div>
                <div>
                  <p className="tw:text-xs tw:text-zinc-500 tw:uppercase tw:tracking-widest tw:mb-0.5">Daily Cap</p>
                  <p className="tw:text-xl tw:font-bold tw:text-zinc-400">${dailyCap.toFixed(0)}<span className="tw:text-zinc-600 tw:text-sm tw:font-normal">/day</span></p>
                </div>
                {Math.abs(budgetDiff) > 1 && (
                  <div className={budgetDiff > 0 ? "tw:text-amber-400" : "tw:text-cyan-400"}>
                    <p className="tw:text-xs tw:uppercase tw:tracking-widest tw:mb-0.5">Difference</p>
                    <p className="tw:text-sm tw:font-semibold">
                      {budgetDiff > 0 ? "+" : ""}{budgetDiff.toFixed(0)}/day
                    </p>
                  </div>
                )}
              </div>

              <Button
                onClick={submitBudgets}
                disabled={applying || !!applyResult?.applied?.length}
                className="tw:gap-2 tw:bg-violet-600 hover:tw:bg-violet-500 tw:text-white tw:font-semibold tw:shrink-0 tw:px-6"
              >
                {applying ? <Loader2 size={14} className="tw:animate-spin" /> : <Send size={14} />}
                {applying ? "Submitting…" : applyResult?.applied?.length ? "Budgets Submitted" : "Submit Budgets"}
              </Button>
            </div>

            {/* Apply feedback */}
            {applyResult && (
              <div className="tw:mt-4 tw:pt-4 tw:border-t tw:border-white/[0.06]">
                {applyResult.error ? (
                  <div className="tw:flex tw:items-center tw:gap-2 tw:text-red-400 tw:text-sm">
                    <AlertCircle size={14} />
                    <span>{applyResult.error}</span>
                  </div>
                ) : (
                  <>
                    {applyResult.simulated && (
                      <div className="tw:flex tw:items-center tw:gap-2 tw:text-amber-400 tw:text-xs tw:mb-3">
                        <AlertCircle size={12} />
                        <span>Simulated — Amazon Ads API not configured. Set <code className="tw:bg-white/5 tw:px-1 tw:rounded">AMAZON_ADS_*</code> env vars to push live budgets.</span>
                      </div>
                    )}
                    <div className="tw:grid tw:grid-cols-2 sm:tw:grid-cols-3 tw:gap-2">
                      {applyResult.applied?.map((a, i) => (
                        <div key={i} className="tw:flex tw:items-center tw:gap-2 tw:text-xs tw:text-zinc-400">
                          <CheckCircle2 size={12} className="tw:text-emerald-400 tw:shrink-0" />
                          <span className="tw:truncate">{a.campaignName}</span>
                          <span className="tw:text-emerald-400 tw:shrink-0 tw:font-semibold">${a.dailyBudget}/day</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
