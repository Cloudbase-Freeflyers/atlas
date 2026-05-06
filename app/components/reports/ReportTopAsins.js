"use client";

import { useMemo } from "react";

import DataTable from "../DataTable";
import { useData } from "@/hooks/useData.js";

const navTabs = [
  { label: "Overall KPIs", href: "/reports/overall-kpis" },
  { label: "Ads Overview", href: "/reports/ads-overview" },
  { label: "Seller Central Overview", href: "/reports/seller-central" },
  { label: "Keywords And Search Terms", href: "/reports/keywords" },
  { label: "Campaigns", href: "/reports/campaigns" },
  { label: "Top ASINs", href: "/reports/top-asins" },
  { label: "Insights", href: "/reports/callouts" },
];

const columns = [
  { key: "asin", label: "ASIN" },
  { key: "sku", label: "SKU" },
  { key: "impressions", label: "Impressions", formatter: "compact" },
  { key: "clicks", label: "Clicks", formatter: "compact" },
  { key: "ctr", label: "CTR", formatter: "percent" },
  { key: "spend", label: "Spend", formatter: "currency" },
  { key: "cpc", label: "CPC", formatter: "currency" },
  { key: "orders", label: "Orders", formatter: "compact" },
  { key: "sales", label: "Sales (14d)", formatter: "currency" },
  { key: "roas", label: "ROAS", formatter: "decimal" },
  { key: "acos", label: "ACOS", formatter: "percent" },
];

export default function ReportTopAsins({ initialData }) {
  const { data: asins, isLoading } = useData(
    {
      dimensions: [
        "AdsProductReports.advertised_asin",
        "AdsProductReports.advertised_sku",
      ],
      measures: [
        "AdsProductReports.impressions",
        "AdsProductReports.clicks",
        "AdsProductReports.cost",
        "AdsProductReports.sales14d",
        "AdsProductReports.purchases14d",
        "AdsProductReports.roas",
        "AdsProductReports.acos",
        "AdsProductReports.ctr",
        "AdsProductReports.cpc",
      ],
      order: { "AdsProductReports.sales14d": "desc" },
    },
    (rows) =>
      rows.map((item) => ({
        asin: item["AdsProductReports.advertised_asin"] || "",
        sku: item["AdsProductReports.advertised_sku"] || "",
        impressions: item["AdsProductReports.impressions"],
        clicks: item["AdsProductReports.clicks"],
        spend: item["AdsProductReports.cost"],
        sales: item["AdsProductReports.sales14d"],
        orders: item["AdsProductReports.purchases14d"],
        roas: item["AdsProductReports.roas"],
        acos: item["AdsProductReports.acos"],
        ctr: item["AdsProductReports.ctr"],
        cpc: item["AdsProductReports.cpc"],
      })),
    "topasinreport",
    "AdsProductReports.report_date",
    false,
    { initialData: initialData?.asins }
  );

  const top50 = useMemo(() => (asins ?? []).slice(0, 50), [asins]);

  if (isLoading) {
    return (
      <div className="grid" style={{ gap: 20 }}>

        <div className="card">
          <div className="card-inner">
            <p className="reports-loading">Loading…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid" style={{ gap: 20 }}>


      <div className="card">
        <div className="card-inner">
          <h2
            className="tw:text-lg tw:font-semibold tw:mb-1"
            style={{ color: "var(--color-primary, #1F3864)" }}
          >
            Top Advertised ASINs
          </h2>
          <p className="tw:text-sm tw:text-muted-foreground tw:mb-4">
            Sponsored Products advertised-product performance sorted by 14-day ad
            sales. Top 50 shown.
          </p>

          {top50.length === 0 ? (
            <p className="tw:text-sm tw:text-muted-foreground tw:italic">
              No advertised-product data found for this date range. Ensure your
              Amazon Ads account has Sponsored Products campaigns and that the{" "}
              <code>AdsProductReports</code> cube is populated.
            </p>
          ) : (
            <DataTable columns={columns} rows={top50} initialPageSize={50} />
          )}
        </div>
      </div>
    </div>
  );
}
