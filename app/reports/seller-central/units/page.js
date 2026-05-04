"use client";

import { useEffect, useState } from "react";
import TabBar from "../../../components/TabBar";
import LineChart from "../../../components/LineChart";
import DataTable from "../../../components/DataTable";
import ReportsConnectMessage from "../../../components/ReportsConnectMessage";
import { placeholderChartSeries } from "../../../lib/sampleData";
import {useData} from "@/hooks/useData.js";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip.jsx";

const tabs = [
  { label: "Sales distribution", href: "/reports/seller-central/sales-distribution" },
  { label: "P&L distribution", href: "/reports/seller-central" },
  { label: "Units", href: "/reports/seller-central/units" },
  { label: "Sessions", href: "/reports/seller-central/sessions" },
  { label: "PPC", href: "/reports/seller-central/ppc" },
];

const columns = [
  {
    key: "product",
    label: "Product",
    maxWidth: "320px",
    render: (row) => (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="tw:max-w-[min(320px,40vw)] tw:cursor-default tw:text-left">
            <div className="tw:line-clamp-2 tw:font-medium tw:text-foreground">
              {row.product?.trim() ? row.product : "—"}
            </div>
            {row.asin ? (
              <div className="tw:mt-0.5 tw:font-mono tw:text-[11px] tw:text-muted-foreground">
                {row.asin}
              </div>
            ) : null}
          </div>
        </TooltipTrigger>
        <TooltipContent className="tw:max-w-sm">
          <p className="tw:font-medium">{row.product || "—"}</p>
          {row.asin ? (
            <p className="tw:mt-1 tw:font-mono tw:text-xs tw:text-muted-foreground">
              {row.asin}
            </p>
          ) : null}
        </TooltipContent>
      </Tooltip>
    ),
  },
  { key: "organic", label: "Organic Units" },
  { key: "ppc", label: "PPC Units" },
  { key: "total", label: "Total Units" },
];

export default function UnitsPage() {

    const {data:graphData,isLoading} = useData({
        "dimensions": [
            "PnlDistribution.report_date",
            "PnlDistribution.company_id"
        ],
        "measures": [
            "PnlDistribution.adUnits",
            "PnlDistribution.organicUnits",
            "PnlDistribution.totalUnits"
        ],"order": {
            "PnlDistribution.report_date": "asc"
        },
    },(data)=>data.map(item=>({
        date: new Date(item['PnlDistribution.report_date']).toLocaleDateString(),
        adUnits:item['PnlDistribution.adUnits'],
        organicUnits:item['PnlDistribution.organicUnits'],
        totalUnits:item['PnlDistribution.totalUnits'],
    })),"sellercenteroverview","PnlDistribution.report_date")
    const {data:asisData} = useData(
    {
        "dimensions": [
            "ProductStats.asin",
            "SellerListingReports.item_name"
        ],
        "measures": [
            "ProductStats.adUnits",
            "ProductStats.organicUnits",
            "ProductStats.units"
        ],
        "order": {
            "ProductStats.sales": "desc"
        }
    },(data)=>data.map(item=>({
        product:item['SellerListingReports.item_name'],
        asin:item['ProductStats.asin'],
        organic:item["ProductStats.organicUnits"],
        ppc:item['ProductStats.adUnits'],
        total:item['ProductStats.units'],
    })),"asisData","ProductStats.report_date",false)

  if (isLoading) {
    return (
      <div className="grid" style={{ gap: 20 }}>
        <TabBar tabs={tabs} active="Units" />
        <div className="card"><div className="card-inner"><p className="reports-loading">Loading…</p></div></div>
      </div>
    );
  }

  return (
    <div className="grid" style={{ gap: 20 }}>
      <TabBar tabs={tabs} active="Units" />
      <p className="reports-api-badge" aria-hidden>Live data from Amazon Seller Central</p>
      {/*{series.length > 0 && <LineChart title="Units (last 30 days)" series={series} />}*/}
        <LineChart title="Units: Organic vs PPC" xKey={'date'} data={graphData} config={{
            organicUnits:{
                key:'organicUnits',
                label: "Organic Units",
                color: "#98f06c",
                formatter: "compact",
            },
            adUnits:{
                key:'adUnits',
                label: "Ad Units",
                color: "#f0e96c",
                formatter: "compact",
            },
        }} />
      <div className="card">
        <div className="card-inner">
          <DataTable columns={columns} rows={asisData} />
        </div>
      </div>
    </div>
  );
}
