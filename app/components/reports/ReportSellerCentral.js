"use client";

import { useEffect, useState } from "react";
import TabBar from "../TabBar";
import AreaChart from "../AreaChart";
import LineChart from "../LineChart";
import DataTable from "../DataTable";
import ReportsConnectMessage from "../ReportsConnectMessage";
import { placeholderChartSeries } from "../../lib/sampleData";
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
  { key: "product", label: "Product",maxWidth: "250px",
    render: (row) => (<Tooltip>
      <TooltipTrigger>{row.asin}</TooltipTrigger>
      <TooltipContent>
        <p>{row.product}</p>
      </TooltipContent>
    </Tooltip>)},
  { key: "orders", label: "Orders",formatter:"compact" },
  { key: "units", label: "Units",formatter:"compact" },
  { key: "sales", label: "Sales",formatter:"currency" },
  { key: "profits", label: "Profits" ,formatter:"currency"},
  { key: "ads", label: "Ads",formatter:"currency" },
  { key: "acos", label: "ACOS" ,formatter:"percent"},
  { key: "tacos", label: "TACOS" },
  { key: "sessions", label: "Sessions" },
  { key: "conversion", label: "Conversion" },
];

export default function ReportSellerCentral() {
  const {data:graphData,isLoading} = useData({
    "dimensions": [
      "PnlDistribution.report_date",
      "PnlDistribution.company_id"
    ],
    "measures": [
      "PnlDistribution.adCost",
      "PnlDistribution.adSales",
      "PnlDistribution.adUnits",
      "PnlDistribution.organicSales",
      "PnlDistribution.organicUnits",
      "PnlDistribution.profit",
      "PnlDistribution.totalSales",
      "PnlDistribution.totalUnits"
    ],"order": {
      "PnlDistribution.report_date": "asc"
    },
  },(data)=>data.map(item=>({
    date: new Date(item['PnlDistribution.report_date']).toLocaleDateString(),
    adCost:item['PnlDistribution.adCost'],
    adUnits:item['PnlDistribution.adUnits'],
    adSales:item['PnlDistribution.adSales'],
    organicSales:item['PnlDistribution.organicSales'],
    organicUnits:item['PnlDistribution.organicUnits'],
    profit:item['PnlDistribution.profit'],
    totalSales:item['PnlDistribution.totalSales'],
    totalUnits:item['PnlDistribution.totalUnits'],
  })),"sellercenteroverview","PnlDistribution.report_date")



  const {data:asisData} = useData({
    "dimensions": [
      "AsinPerformance.asin",
      "SellerListingReports.item_name"
    ],
    "measures": [
      "AsinPerformance.adCost",
      "AsinPerformance.adSales",
      "AsinPerformance.sales",
      "AsinPerformance.organicSales",
      "AsinPerformance.profit",
      "AsinPerformance.totalQuantity",
      "AsinPerformance.acos",
      "AsinPerformance.order_count"
    ],
    "order": {
      "AsinPerformance.sales": "desc"
    }
  },(data)=>data.map(item=>({
    product:item['SellerListingReports.item_name'],
    asin:item['AsinPerformance.asin'],
    orders:item['AsinPerformance.order_count'],

    units:item['AsinPerformance.totalQuantity'],
    sales:item['AsinPerformance.sales'],
    profits:item['AsinPerformance.profit'],
    acos:item['AsinPerformance.acos'],
    // conversion:item['AsinPerformance.acos'],
    // sessions:item['AsinPerformance.acos'],
    // tacos:item['AsinPerformance.acos'],
    ads:item['AsinPerformance.adSales'],
    // orders:item['PnlDistribution.order'],
  })),"asisData","AsinPerformance.report_date")

  if (isLoading) {
    return (
      <div className="grid" style={{ gap: 20 }}>
        <TabBar tabs={tabs} active="P&L distribution" />
        <div className="card"><div className="card-inner"><p className="reports-loading">Loading…</p></div></div>
      </div>
    );
  }



  return (
    <div className="grid" style={{ gap: 20 }}>
      <TabBar tabs={tabs} active="P&L distribution" />
      <AreaChart title="P&L Distribution" xKey={'date'} data={graphData} config={{
        adCost:{
          key:'adCost',
          label: "Cost",
          color: "#f07c6c",
        },
        totalSales:{
          key:'totalSales',
          label: "Sales",
          color: "#f0e96c",
        },
        profit: {
          key:'profit',
          label: "Profit",
          color: "#6cf096",
        }
      }} />
      <LineChart title="Units: Organic vs PPC" xKey={'date'} data={graphData} config={{
        organicUnits:{
          key:'organicUnits',
          label: "Organic Units",
          color: "#98f06c",
        },
        adUnits:{
          key:'adUnits',
          label: "Ad Units",
          color: "#f0e96c",
        },
      }} />
      {/*{organicSeries.length > 0 && <LineChart title="Units: Organic vs PPC" series={organicSeries} />}*/}
      <div className="card">
        <div className="card-inner">
          <div className="filter-row">
            <span className="toggle">
              <span className="toggle-pill active"><span /></span>
              Child ASINS
            </span>
            <input className="input" placeholder="Instant search" />
            <button className="button">Columns</button>
            <button className="button primary">Download</button>
          </div>
          <DataTable columns={columns} rows={asisData} />
        </div>
      </div>
    </div>
  );
}
