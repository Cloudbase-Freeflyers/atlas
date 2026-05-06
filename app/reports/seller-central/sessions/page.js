"use client";

import { useEffect, useState } from "react";

import LineChart from "../../../components/LineChart";
import DataTable from "../../../components/DataTable";
import ReportsConnectMessage from "../../../components/ReportsConnectMessage";
import { placeholderChartSeries } from "../../../lib/sampleData";
import {useData} from "@/hooks/useData.js";



const columns = [
  { key: "asin", label: "ASIN" },
  { key: "sessions", label: "Sessions" },
  { key: "pageViews", label: "Page Views" },
  { key: "unitSessionPct", label: "Unit Session %" },
  { key: "unitsOrdered", label: "Units Ordered" },
];

export default function SessionsPage() {

  const {data,isLoading} = useData({
    "measures": [
      "SellerSalesTrafficReports.sessions",
      "SellerSalesTrafficReports.unit_session_percentage",
      "SellerSalesTrafficReports.page_views",
    ],
    "dimensions": [
      "SellerSalesTrafficReports.report_date"
    ],
    "order": {
      "SellerSalesTrafficReports.report_date": "asc"
    }
  },(data)=>data.map(item=>({
    date: new Date(item['SellerSalesTrafficReports.report_date']).toLocaleDateString(),
      sessions:item['SellerSalesTrafficReports.sessions'],
    unit_session_percentage:item['SellerSalesTrafficReports.unit_session_percentage'],
    page_views: item['SellerSalesTrafficReports.page_views'],
  })),'sessiongraph','SellerSalesTrafficReports.report_date')


  const {data:tableData} = useData({
    "measures": [
      "SellerSalesTrafficReports.sessions",
      "SellerSalesTrafficReports.unit_session_percentage",
      "SellerSalesTrafficReports.units_ordered",
      "SellerSalesTrafficReports.page_views"
    ],
    "dimensions": [
      "SellerSalesTrafficReports.child_asin",
    ],
    "order": {
      "SellerSalesTrafficReports.report_date": "asc"
    }
  },(data)=>data.map(item=>({
    asin: item['SellerSalesTrafficReports.child_asin'],
    sessions:item['SellerSalesTrafficReports.sessions'],
    unitSessionPct:item['SellerSalesTrafficReports.unit_session_percentage'],
    unitsOrdered:item['SellerSalesTrafficReports.units_ordered'],
    pageViews:item['SellerSalesTrafficReports.page_views'],
  })),'sessiontable','SellerSalesTrafficReports.report_date')

  if (isLoading) {
    return (
        <div className="grid" style={{ gap: 20 }}>

          <div className="card"><div className="card-inner"><p className="reports-loading">Loading…</p></div></div>
        </div>
    );
  }
  return (
    <div className="grid" style={{ gap: 20 }}>

      <p className="reports-api-badge" aria-hidden>Live data from Amazon Seller Central</p>
      <div className={"tw:grid tw:grid-cols-2 tw:gap-2"}>
        <LineChart title="Sessions + Unit Session %" xKey={'date'} data={data} config={{
          unit_session_percentage:{
            key:'unit_session_percentage',
            label: "Unit Session %",
            color: "#98f06c",
            formatter: "percent",
          },
          sessions:{
            key:'sessions',
            label: "Sessions",
            color: "#f0e96c",
            formatter: "compact",
          },
        }} />
        <LineChart title="Sessions + Page views" xKey={'date'} data={data} config={{
          sessions:{
            key:'sessions',
            label: "Sessions",
            color: "#f0e96c",
            formatter: "compact",
          },
          pageViews:{
            key:'page_views',
            label: "Page views",
            color: "#6caaf0",
            formatter: "compact",
          },
        }} />
      </div>
      <div className="card">
        <div className="card-inner">
          <DataTable columns={columns} rows={tableData} />
        </div>
      </div>
    </div>
  );
}
