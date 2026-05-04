"use client";

import { useMemo, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useFilters } from "@/lib/FiltersContext.js";
import { useData } from "@/hooks/useData.js";
import { formatValue } from "@/lib/formatters.js";
import {
  mergeAccountWeeklyRows,
  mergeAsinWeeklyRows,
  metricsFromWeeks,
} from "@/lib/salesTrendMerge.js";
import ReportsConnectMessage from "../ReportsConnectMessage";

const PNL_MEASURES = [
  "PnlDistribution.adCost",
  "PnlDistribution.adSales",
  "PnlDistribution.adUnits",
  "PnlDistribution.organicSales",
  "PnlDistribution.organicUnits",
  "PnlDistribution.profit",
  "PnlDistribution.totalSales",
  "PnlDistribution.totalUnits",
];

const ASIN_MEASURES = [
  "ProductStats.sales",
  "ProductStats.profit",
  "ProductStats.orders",
  "ProductStats.units",
  "ProductStats.organicUnits",
  "ProductStats.adSales",
  "ProductStats.adCost",
  "ProductStats.adUnits",
  "ProductStats.sessions",
  "ProductStats.conversions",
  "ProductStats.tacos",
  "ProductStats.acos",
];

function heatClass(value, series, { invertHeat, higherIsBetter }) {
  const nums = series.filter((v) => v != null && Number.isFinite(v));
  if (nums.length < 2 || value == null || !Number.isFinite(value)) return "";
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  if (max === min) return "";
  let t = (value - min) / (max - min);
  if (invertHeat || higherIsBetter === false) t = 1 - t;
  const bucket = Math.min(4, Math.max(1, Math.ceil(t * 4)));
  return `heat-${bucket}`;
}

function SparklineBars({ values, bipolar, costTone }) {
  const w = 80;
  const h = 32;
  const pad = 2;
  const n = values.length;
  if (n === 0) return null;
  const nums = values.map((v) =>
    v != null && Number.isFinite(v) ? Number(v) : null
  );
  const fill = costTone ? "#c0392b" : "#4a6fa5";

  if (bipolar) {
    const abs = nums.map((v) => (v == null ? 0 : Math.abs(v)));
    const maxAbs = Math.max(...abs, 1e-9);
    const mid = h / 2;
    const bw = (w - pad * 2) / n;
    return (
      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        className="trend-sparkline-svg"
        aria-hidden
      >
        <line
          x1={pad}
          y1={mid}
          x2={w - pad}
          y2={mid}
          stroke="#e6ebf7"
          strokeWidth={1}
        />
        {nums.map((v, i) => {
          if (v == null) return null;
          const bh = (Math.abs(v) / maxAbs) * (mid - pad);
          const x = pad + i * bw + bw * 0.15;
          const barW = bw * 0.7;
          if (v >= 0) {
            return (
              <rect
                key={i}
                x={x}
                y={mid - bh}
                width={barW}
                height={Math.max(bh, 0.5)}
                fill={fill}
                rx={1}
              />
            );
          }
          return (
            <rect
              key={i}
              x={x}
              y={mid}
              width={barW}
              height={Math.max(bh, 0.5)}
              fill="#8c1b28"
              rx={1}
            />
          );
        })}
      </svg>
    );
  }

  const pos = nums.map((v) => (v == null || v < 0 ? 0 : v));
  const max = Math.max(...pos, 1e-9);
  const bw = (w - pad * 2) / n;
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className="trend-sparkline-svg"
      aria-hidden
    >
      {nums.map((v, i) => {
        if (v == null) return null;
        const height = (Math.max(0, v) / max) * (h - pad * 2);
        const x = pad + i * bw + bw * 0.15;
        return (
          <rect
            key={i}
            x={x}
            y={h - pad - height}
            width={bw * 0.7}
            height={Math.max(height, v === 0 ? 1 : 0.5)}
            fill={fill}
            rx={1}
          />
        );
      })}
    </svg>
  );
}

export default function ReportSalesTrend({ initialData = null, initialAsin = "" }) {
  const { companyId } = useFilters();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [asin, setAsin] = useState(initialAsin || "");

  useEffect(() => {
    setAsin(initialAsin || "");
  }, [initialAsin]);

  const pnlPayload = useMemo(
    () => ({
      dimensions: ["PnlDistribution.report_date"],
      measures: PNL_MEASURES,
      order: { "PnlDistribution.report_date": "asc" },
    }),
    []
  );

  const adsPayload = useMemo(
    () => ({
      measures: [
        "AdsCampaignReports.spend",
        "AdsCampaignReports.sales",
        "AdsCampaignReports.purchases14d",
        "AdsCampaignReports.impressions",
        "AdsCampaignReports.clicks",
        "AdsCampaignReports.acos",
        "AdsCampaignReports.roas",
        "AdsCampaignReports.ctr",
        "AdsCampaignReports.cpc",
      ],
      dimensions: ["AdsCampaignReports.report_date"],
      order: { "AdsCampaignReports.report_date": "asc" },
    }),
    []
  );

  const sessionsPayload = useMemo(
    () => ({
      dimensions: ["ProductStats.report_date"],
      measures: ["ProductStats.sessions", "ProductStats.conversions"],
      order: { "ProductStats.report_date": "asc" },
    }),
    []
  );

  const asinPayload = useMemo(
    () => ({
      dimensions: ["ProductStats.report_date"],
      measures: ASIN_MEASURES,
      order: { "ProductStats.report_date": "asc" },
      filters: asin
        ? [
            {
              member: "ProductStats.asin",
              operator: "equals",
              values: [asin],
            },
          ]
        : [],
    }),
    [asin]
  );

  const { data: pnl, isLoading: loadPnl } = useData(
    pnlPayload,
    undefined,
    "salesTrendPnl",
    "PnlDistribution.report_date",
    true,
    {
      timeGranularity: "week",
      enabled: !asin,
      initialData: initialData?.pnl,
    }
  );

  const { data: ads, isLoading: loadAds } = useData(
    adsPayload,
    undefined,
    "salesTrendAds",
    "AdsCampaignReports.report_date",
    true,
    {
      timeGranularity: "week",
      enabled: !asin,
      initialData: initialData?.ads,
    }
  );

  const { data: sessions, isLoading: loadSess } = useData(
    sessionsPayload,
    undefined,
    "salesTrendSessions",
    "ProductStats.report_date",
    true,
    {
      timeGranularity: "week",
      enabled: !asin,
      initialData: initialData?.sessions,
    }
  );

  const { data: asinRows, isLoading: loadAsin } = useData(
    asinPayload,
    undefined,
    "salesTrendAsin",
    "ProductStats.report_date",
    true,
    {
      timeGranularity: "week",
      enabled: !!asin,
      initialData: asin && initialData?.asinWeeks ? initialData.asinWeeks : undefined,
    }
  );

  const catalogPayload = useMemo(
    () => ({
      dimensions: ["ProductStats.asin", "SellerListingReports.item_name"],
      measures: ["ProductStats.sales"],
      order: { "ProductStats.sales": "desc" },
    }),
    []
  );

  const { data: catalogLive } = useData(
    catalogPayload,
    undefined,
    "salesTrendCatalog",
    "ProductStats.report_date",
    false,
    { initialData: initialData?.catalog }
  );

  const accountWeeks = useMemo(
    () => mergeAccountWeeklyRows(pnl, ads, sessions),
    [pnl, ads, sessions]
  );

  const asinWeeks = useMemo(() => mergeAsinWeeklyRows(asinRows), [asinRows]);

  const weeks = asin ? asinWeeks : accountWeeks;
  const accountScope = !asin;

  const metricRows = useMemo(() => {
    const raw = metricsFromWeeks(weeks, accountScope);
    return raw.filter(
      (row) =>
        row.summary != null ||
        row.values.some((v) => v != null && Number.isFinite(v))
    );
  }, [weeks, accountScope]);

  const loading = asin
    ? loadAsin
    : loadPnl || loadAds || loadSess;

  const catalog = catalogLive?.length ? catalogLive : initialData?.catalog || [];

  function onAsinChange(next) {
    setAsin(next);
    const params = new URLSearchParams(searchParams.toString());
    if (next) params.set("asin", next);
    else params.delete("asin");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  if (!companyId) {
    return (
      <ReportsConnectMessage
        title="Select a company"
        description="Choose a company in the top bar to load sales trend data."
      />
    );
  }

  const periodLabels = weeks.map((w) => w.weekLabel || w.weekStart);

  return (
    <div className="grid" style={{ gap: 20 }}>
      <div className="card">
        <div className="card-inner">
          <div className="filter-row tw:flex tw:flex-col tw:items-stretch tw:gap-3 md:tw:flex-row md:tw:items-center md:tw:justify-between">
            <h2 className="tw:m-0 tw:text-lg tw:font-bold md:tw:flex-1">
              Sales trend
            </h2>
            <label className="reports-muted tw:flex tw:min-w-0 tw:flex-col tw:gap-1 sm:tw:flex-row sm:tw:items-center sm:tw:gap-2">
              <span className="tw:shrink-0">Scope</span>
              <select
                className="button tw:min-h-9 tw:w-full tw:min-w-0 tw:max-w-full md:tw:w-auto md:tw:min-w-[200px] md:tw:max-w-md"
                value={asin}
                onChange={(e) => onAsinChange(e.target.value)}
              >
                <option value="">Entire account</option>
                {catalog.map((row) => {
                  const id = row["ProductStats.asin"];
                  const name = row["SellerListingReports.item_name"] || id;
                  return (
                    <option key={id} value={id}>
                      {name} ({id})
                    </option>
                  );
                })}
              </select>
            </label>
          </div>
          <p className="reports-muted" style={{ marginTop: 8, fontSize: 12 }}>
            Weekly columns match your selected date range. Summary column aggregates across those weeks
            (sums for volume metrics, simple averages for rates).
          </p>
        </div>
      </div>

      {loading && (
        <div className="card">
          <div className="card-inner reports-muted">Loading trend data…</div>
        </div>
      )}

      {!loading && weeks.length === 0 && (
        <ReportsConnectMessage
          title="No weekly rows in this range"
          description="Try widening the date range, or confirm Seller Central and Ads data are connected for this company."
        />
      )}

      {!loading && weeks.length > 0 && (
        <div className="card">
          <div className="card-inner">
            <div className="table-scroll">
              <table className="table heatmap">
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th className="trend-summary-cell">Summary</th>
                    {periodLabels.map((label, i) => (
                      <th key={i}>{label}</th>
                    ))}
                    <th>Analysis</th>
                  </tr>
                </thead>
                <tbody>
                  {metricRows.map((row) => (
                    <tr key={row.id}>
                      <td style={{ textAlign: "left", fontWeight: 600 }}>
                        {row.label}
                      </td>
                      <td
                        className={`trend-summary-cell ${row.format === "currency" && row.summary != null && row.summary < 0 ? "negative" : ""} ${row.format === "percent" && row.summary != null && row.summary < 0 ? "negative" : ""}`}
                      >
                        {row.summary != null && Number.isFinite(row.summary)
                          ? formatValue(row.summary, row.format)
                          : "—"}
                      </td>
                      {row.values.map((v, i) => {
                        const hc = heatClass(v, row.values, {
                          invertHeat: row.invertHeat,
                          higherIsBetter: row.higherIsBetter,
                        });
                        const neg =
                          row.format === "currency" ||
                          row.format === "percent"
                            ? v != null && v < 0
                            : false;
                        return (
                          <td
                            key={i}
                            className={`${hc} ${neg ? "negative" : ""}`}
                          >
                            {v != null && Number.isFinite(v)
                              ? formatValue(v, row.format)
                              : "—"}
                          </td>
                        );
                      })}
                      <td className="trend-sparkline-cell">
                        <SparklineBars
                          values={row.values}
                          bipolar={row.bipolarSpark}
                          costTone={row.costSpark}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
