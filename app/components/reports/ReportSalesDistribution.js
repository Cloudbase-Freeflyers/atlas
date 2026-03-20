"use client";

import TabBar from "../../components/TabBar";
import AreaChart from "../../components/AreaChart";
import DataTable from "../../components/DataTable";
import { useData } from "@/hooks/useData.js";
import { TooltipContent, TooltipTrigger, Tooltip } from "@/components/ui/tooltip.jsx";

const tabs = [
  { label: "Sales distribution", href: "/reports/seller-central/sales-distribution" },
  { label: "P&L distribution", href: "/reports/seller-central" },
  { label: "Units", href: "/reports/seller-central/units" },
  { label: "Sessions", href: "/reports/seller-central/sessions" },
  { label: "PPC", href: "/reports/seller-central/ppc" },
];

const columns = [
  { key: "product", label: "Product", maxWidth: "250px",
    render: (row) => (<Tooltip>
        <TooltipTrigger>{row.asin}</TooltipTrigger>
        <TooltipContent>
            <p>{row.product}</p>
        </TooltipContent>
    </Tooltip>)},
  { key: "sales", label: "Sales", formatter: "currency" },
  { key: "orders", label: "Orders", formatter: "compact" },
  { key: "units", label: "Units", formatter: "compact" },
  { key: "margin", label: "Margin" },
  { key: "refunds", label: "Refunds" },
];

export default function ReportSalesDistribution({ initialData }) {
    const { data: graphData, isLoading } = useData({
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
        ], "order": {
            "PnlDistribution.report_date": "asc"
        },
    }, (data) => data.map(item => ({
        date: new Date(item['PnlDistribution.report_date']).toLocaleDateString(),
        adCost: item['PnlDistribution.adCost'],
        adUnits: item['PnlDistribution.adUnits'],
        adSales: item['PnlDistribution.adSales'],
        organicSales: item['PnlDistribution.organicSales'],
        organicUnits: item['PnlDistribution.organicUnits'],
        profit: item['PnlDistribution.profit'],
        totalSales: item['PnlDistribution.totalSales'],
        totalUnits: item['PnlDistribution.totalUnits'],
    })), "sellercenteroverview", "PnlDistribution.report_date", true, { initialData: initialData?.graphData })
    
    const { data: asisData } = useData({
        "dimensions": [
            "ProductStats.asin",
            "SellerListingReports.item_name"
        ],
        "measures": [
            "ProductStats.acos",
            "ProductStats.adCost",
            "ProductStats.adSales",
            "ProductStats.adUnits",
            "ProductStats.conversions",
            "ProductStats.orders",
            "ProductStats.profit",
            "ProductStats.sales",
            "ProductStats.sessions",
            "ProductStats.tacos",
            "ProductStats.units"
        ],
        "order": {
            "ProductStats.sales": "desc"
        }
    }, (data) => data.map(item => ({
        product: item['SellerListingReports.item_name'],
        asin: item['ProductStats.asin'],
        orders: item['ProductStats.orders'],
        units: item['ProductStats.units'],
        sales: item['ProductStats.sales'],
        profits: item['ProductStats.profit'],
        ACOS: item['ProductStats.acos'],
        ads: item['ProductStats.adSales'],
    })), "asisData2", "ProductStats.report_date", false, { initialData: initialData?.productData })


  if (isLoading) {
    return (
      <div className="grid" style={{ gap: 20 }}>
        <TabBar tabs={tabs} active="Sales distribution" />
        <div className="card"><div className="card-inner"><p className="reports-loading">Loading…</p></div></div>
      </div>
    );
  }

  return (
    <div className="grid" style={{ gap: 20 }}>
      <TabBar tabs={tabs} active="Sales distribution" />
      <p className="reports-api-badge" aria-hidden>Live data from Amazon Seller Central</p>
        <AreaChart title="Sales distribution" xKey={'date'} data={graphData} config={{
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
      <div className="card">
        <div className="card-inner">
          <DataTable columns={columns} rows={asisData} />
        </div>
      </div>
    </div>
  );
}
