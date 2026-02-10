const reportCardTemplates = [
  { href: "/reports/overall-kpis", tag: "Overview", title: "Overall KPIs", description: "Account-wide KPIs across ads + seller central.", statLabels: ["ROAS", "ACOS"] },
  { href: "/reports/ads-overview", tag: "Advertising", title: "Ads Overview", description: "Daily ad sales, spend, CPC, and CTR trends.", statLabels: ["Ad Sales", "CPC"] },
  { href: "/reports/seller-central", tag: "Seller Central", title: "Seller Central Overview", description: "P&L distribution with product-level performance.", statLabels: ["Units", "Profit"] },
  { href: "/reports/keywords", tag: "Search", title: "Keywords & Search Terms", description: "Top queries, ROAS, and target term performance.", statLabels: ["Terms", "ROAS"] },
  { href: "/reports/campaigns", tag: "Campaigns", title: "Campaigns", description: "Campaign health, spend, and conversions.", statLabels: ["Campaigns", "Spend"] },
  { href: "/reports/inventory-forecast", tag: "Inventory", title: "Inventory Forecast", description: "Restock profiles, stock health, and lead time.", statLabels: ["SKUs", "Restock"] },
  { href: "/reports/product-details", tag: "Catalog", title: "Product Details", description: "Editable catalog details and production costs.", statLabels: ["Active", "Inactive"] },
  { href: "/reports/sales-trend", tag: "Trends", title: "Sales Trend", description: "Weekly sales and margin heatmap.", statLabels: ["Weeks", "Orders"] },
];

/** Cards for /reports landing page – placeholder values (—) so no static data is shown. */
export const dashboardCards = reportCardTemplates.map((t) => ({
  ...t,
  stats: t.statLabels.map((label) => ({ label, value: "—" })),
}));

/** Labels only – use with value "—" for placeholder layout. */
export const kpiMetricLabels = [
  "Total Sales ($)",
  "Total Ad Sales ($)",
  "Amount Spent ($)",
  "Total Orders",
  "Total Ad Orders",
  "Total ROAS",
  "Total ACOS",
];

export const kpiMetrics = kpiMetricLabels.map((label) => ({ label, value: "—" }));

/** One series with zeros so chart layout renders without real data. */
export const placeholderChartSeries = [
  { name: "—", data: [0, 0, 0, 0, 0, 0], color: "var(--c-ink-muted)" },
];

const adsMetricLabels = [
  "Total Ad Sales",
  "Amount Spent",
  "Total Ad Orders",
  "ACOS",
  "ROAS",
  "Impressions",
  "Clicks",
  "CPC",
  "CTR",
  "Conversion Rate",
];

/** Placeholder metrics (—) for Ads layout when no API data. */
export const placeholderAdsMetrics = adsMetricLabels.map((label) => ({ label, value: "—" }));

export const adsMetrics = adsMetricLabels.map((label) => ({ label, value: "—" }));

export const pAndlSeries = [
  {
    name: "Sales",
    data: [40, 64, 52, 48, 60, 62, 50, 58, 64, 72, 60, 58, 68, 74, 62],
    color: "#2f5bff",
    fill: "#dfe8ff"
  },
  {
    name: "Profit",
    data: [22, 36, 30, 26, 34, 32, 28, 30, 36, 40, 30, 32, 38, 44, 36],
    color: "#22b8cf",
    fill: "#c9f1f5"
  },
  {
    name: "FBA Fees",
    data: [16, 28, 22, 20, 26, 24, 18, 20, 24, 28, 22, 18, 24, 30, 22],
    color: "#f7b955",
    fill: "#fbe7c4"
  },
  {
    name: "PPC Cost",
    data: [12, 18, 14, 12, 16, 15, 10, 12, 14, 18, 12, 14, 16, 20, 12],
    color: "#f07c6c",
    fill: "#ffd6cf"
  }
];

export const adsSeries = [
  {
    name: "Spend",
    data: [6, 9, 7, 5, 8, 6, 7, 5, 6, 7, 6, 8, 7, 6],
    color: "#2f5bff",
    fill: "#dfe8ff"
  },
  {
    name: "Sales",
    data: [12, 16, 14, 11, 15, 13, 14, 12, 15, 16, 13, 14, 15, 14],
    color: "#22b8cf",
    fill: "#c9f1f5"
  }
];

export const organicSeries = [
  {
    name: "Organic",
    data: [4, 6, 6, 7, 8, 6, 3, 4, 5, 5, 4, 5, 6, 4],
    color: "#2f5bff",
    fill: "#dfe8ff"
  },
  {
    name: "PPC",
    data: [6, 8, 9, 10, 10, 8, 2, 3, 5, 6, 5, 6, 7, 3],
    color: "#22b8cf",
    fill: "#c9f1f5"
  }
];

export const trendSeries = [
  {
    name: "Organic",
    data: [60, 50, 40, 30, 28, 26, 24, 22, 24],
    color: "#2f5bff",
    fill: "#dfe8ff"
  },
  {
    name: "Promotion",
    data: [24, 20, 14, 12, 10, 8, 9, 10, 12],
    color: "#22b8cf",
    fill: "#c9f1f5"
  },
  {
    name: "PPC",
    data: [18, 16, 10, 8, 7, 6, 8, 9, 10],
    color: "#f7b955",
    fill: "#fbe7c4"
  }
];

export const keywordRows = [
  {
    id: 1,
    term: "studio monitor speakers",
    match: "EXACT",
    spend: "$28.98",
    clicks: "22",
    orders: "0",
    sales: "$0",
    conversion: "0%",
    roas: "0",
    ctr: "0.22%"
  },
  {
    id: 2,
    term: "portable system",
    match: "BROAD",
    spend: "$18.88",
    clicks: "41",
    orders: "2",
    sales: "$289.40",
    conversion: "4.8%",
    roas: "15.3",
    ctr: "0.55%"
  },
  {
    id: 3,
    term: "irig hd",
    match: "PHRASE",
    spend: "$70.57",
    clicks: "55",
    orders: "1",
    sales: "$499.20",
    conversion: "1.8%",
    roas: "7.1",
    ctr: "0.33%"
  }
];

export const campaignRows = [
  {
    id: 1,
    name: "IKM | Views Remarketing",
    spend: "$839.77",
    impressions: "340,677",
    clicks: "698",
    orders: "23",
    sales: "$14,882",
    conversion: "3.30%",
    roas: "17.73",
    ctr: "0.20%",
    acos: "5.64%"
  },
  {
    id: 2,
    name: "IKM | Category | Studio Monitors",
    spend: "$502.48",
    impressions: "269,297",
    clicks: "194",
    orders: "3",
    sales: "$4,949",
    conversion: "1.55%",
    roas: "9.85",
    ctr: "0.07%",
    acos: "10.15%"
  }
];

export const forecastRows = [
  {
    id: 1,
    product: "Sand",
    parent: "B0CXFFMDZ3",
    asin: "B0CJ1FCCG",
    sku: "P29-1U",
    title: "Sand",
    stock: "0%",
    reorder: "02-Feb-26",
    restock: "237",
    cost: "$1,896.00",
    fba: "69",
    velocity: "1",
    supply: "48",
    stockout: "22-Mar-26"
  },
  {
    id: 2,
    product: "Charcoal",
    parent: "B0CXFFMDZ3",
    asin: "B0CJTFW8GT",
    sku: "P179-12U",
    title: "Charcoal",
    stock: "0%",
    reorder: "02-Feb-26",
    restock: "355",
    cost: "$2,840.00",
    fba: "114",
    velocity: "2",
    supply: "53",
    stockout: "27-Mar-26"
  }
];

export const productRows = [
  {
    id: 1,
    status: "Active",
    product: "Birch Small Desktop Whiteboard",
    price: "$27.49",
    asin: "B0FTT66915",
    sku: "P01-1U-2-BCAL1",
    shortName: "Set short name",
    cost: "$6.00",
    freight: "$2.50",
    lead: "90",
    note: "Add note"
  },
  {
    id: 2,
    status: "Active",
    product: "Birch Small Desktop Whiteboard - Moss",
    price: "$26.15",
    asin: "B0FTT4XW62",
    sku: "P153-10U-BCAL1",
    shortName: "Set short name",
    cost: "$6.00",
    freight: "Add cost",
    lead: "90",
    note: "Add note"
  }
];

export const salesTableRows = [
  { label: "Sales", values: ["$17,361", "$4,810", "$5,382", "$1,399", "$859", "$1,204"] },
  { label: "Profit", values: ["($2,314)", "($363)", "($550)", "($374)", "($236)", "($324)"] },
  { label: "Orders", values: ["644", "181", "190", "60", "30", "47"] },
  { label: "Units", values: ["696", "189", "211", "61", "35", "52"] },
  { label: "Refunds", values: ["67", "7", "5", "7", "13", "13"] }
];
