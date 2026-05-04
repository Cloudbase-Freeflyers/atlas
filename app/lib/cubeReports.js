import createCubeApi from "./cube.js";
import { cookies } from "next/headers";
import {
  differenceInCalendarDays,
  format,
  parseISO,
  subDays,
} from "date-fns";
import {
  ADS_DAILY_GRAPH_MEASURES,
  mapAdsCampaignDailyGraphRow,
} from "./mapAdsDailyGraphRow.js";
import {
  mapKeywordDailyRow,
  mapCampaignDailyRow,
} from "./mapAdsEntityDaily.js";
import {
  buildSearchTermDetailPayload,
  buildMatchTypeRollupPayload,
} from "./searchTermQuery.js";
import {
  parseSearchTermCubeResponse,
  mapMatchTypeRollupRow,
} from "./searchTermAggregate.js";

/**
 * Executes a Cube.js query on the server using the auth token from cookies.
 */
export async function fetchCubeData(query) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value || "";
  
  if (!token) {
    throw new Error("Unauthorized: No auth_token found");
  }

  const cubeApi = createCubeApi(token);
  return await cubeApi.load(query).then(res => res.rawData());
}

/**
 * Fetches data for the Overall KPIs report.
 */
export async function getOverallKpisData(companyId, startDate, endDate) {
  if (!companyId) return null;

  const filters = [
    {
      member: "Companies.id",
      operator: "equals",
      values: [companyId]
    }
  ];

  const timeDimensions = startDate && endDate ? [
    {
      dimension: "AdsCampaignReports.report_date",
      dateRange: [startDate, endDate],
      granularity: "day"
    }
  ] : [];

  // Metrics Graph Query
  const graphQuery = {
    measures: [...ADS_DAILY_GRAPH_MEASURES],
    dimensions: ["AdsCampaignReports.report_date"],
    filters,
    timeDimensions: timeDimensions.map(td => ({...td, dimension: "AdsCampaignReports.report_date"}))
  };

  // Sales KPIs Query
  const salesKpisQuery = {
    measures: [
      "SellerOrderReports.sale",
      "SellerOrderReports.unique_order_count"
    ],
    filters,
    timeDimensions: timeDimensions.map(td => ({...td, dimension: "SellerOrderReports.purchase_date"}))
  };

  // Ads KPIs Query
  const adsKpisQuery = {
    measures: [
      "AdsCampaignReports.spend",
      "AdsCampaignReports.purchases14d",
      "AdsCampaignReports.acos",
      "AdsCampaignReports.roas"
    ],
    filters,
    timeDimensions: timeDimensions.map(td => ({...td, dimension: "AdsCampaignReports.report_date"}))
  };

  try {
    const [graphData, salesKpis, adsKpis] = await Promise.all([
      fetchCubeData(graphQuery),
      fetchCubeData(salesKpisQuery),
      fetchCubeData(adsKpisQuery)
    ]);

    return {
      graphData: graphData.map(mapAdsCampaignDailyGraphRow),
      kpis: [
        ...(salesKpis[0] ? [
          { label: "Total Orders", value: salesKpis[0]['SellerOrderReports.unique_order_count'], formatter: "compact" },
          { label: "Total Sales ($)", value: salesKpis[0]['SellerOrderReports.sale'], formatter: "currency" }
        ] : []),
        ...(adsKpis[0] ? [
          { label: "Amount Spent ($)", value: adsKpis[0]['AdsCampaignReports.spend'], formatter: "currency" },
          { label: "Total Ad Orders", value: adsKpis[0]['AdsCampaignReports.purchases14d'], formatter: "compact" },
          { label: "Total ACOS", value: adsKpis[0]['AdsCampaignReports.acos'], formatter: "percent" },
          { label: "Total ROAS", value: adsKpis[0]['AdsCampaignReports.roas'], formatter: "percent" }
        ] : [])
      ]
    };
  } catch (error) {
    console.error("Error fetching Overall KPIs data:", error);
    return null;
  }
}

/**
 * Fetches data for the Ads Overview report.
 */
export async function getAdsOverviewData(companyId, startDate, endDate) {
  if (!companyId) return null;

  const filters = [
    {
      member: "Companies.id",
      operator: "equals",
      values: [companyId]
    }
  ];

  const timeDimensions = startDate && endDate ? [
    {
      dimension: "AdsCampaignReports.report_date",
      dateRange: [startDate, endDate],
      granularity: "day"
    }
  ] : [];

  const graphQuery = {
    measures: [...ADS_DAILY_GRAPH_MEASURES],
    dimensions: ["AdsCampaignReports.report_date"],
    filters,
    timeDimensions
  };

  const metricsQuery = {
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
    filters,
    timeDimensions
  };

  try {
    const [graphData, metricsData] = await Promise.all([
      fetchCubeData(graphQuery),
      fetchCubeData(metricsQuery)
    ]);

    return {
      graphData: graphData.map(mapAdsCampaignDailyGraphRow),
      metrics: metricsData[0] ? [
        { label: "Total Ad Sales", value: metricsData[0]['AdsCampaignReports.sales'], formatter: "currency" },
        { label: "Amount Spent", value: metricsData[0]['AdsCampaignReports.spend'], formatter: "currency" },
        { label: "Total Ad Orders", value: metricsData[0]['AdsCampaignReports.purchases14d'], formatter: "compact" },
        { label: "ACOS", value: metricsData[0]['AdsCampaignReports.acos'], formatter: "percent" },
        { label: "ROAS", value: metricsData[0]['AdsCampaignReports.roas'], formatter: "percent" },
        { label: "Impressions", value: metricsData[0]['AdsCampaignReports.impressions'], formatter: "compact" },
        { label: "Clicks", value: metricsData[0]['AdsCampaignReports.clicks'], formatter: "compact" },
        { label: "CPC", value: metricsData[0]['AdsCampaignReports.cpc'], formatter: "percent" },
        { label: "CTR", value: metricsData[0]['AdsCampaignReports.ctr'], formatter: "percent" },
        { label: "Conversion Rate", value: "-", formatter: "default" }
      ] : []
    };
  } catch (error) {
    console.error("Error fetching Ads Overview data:", error);
    return null;
  }
}

/**
 * Fetches data for the Keywords report.
 */
export async function getKeywordsData(companyId, startDate, endDate) {
  if (!companyId) return null;

  const filters = [
    {
      member: "Companies.id",
      operator: "equals",
      values: [companyId]
    }
  ];

  const timeDimensions = startDate && endDate ? [
    {
      dimension: "AdsKeywordReports.report_date",
      dateRange: [startDate, endDate],
      granularity: "day"
    }
  ] : [];

  const keywordsQuery = {
    dimensions: [
      "AdsKeywordReports.keyword_id",
      "AdsKeywordReports.keyword_text",
      "AdsKeywordReports.match_type"
    ],
    measures: [
      "AdsKeywordReports.clicks",
      "AdsKeywordReports.cost",
      "AdsKeywordReports.purchases14d",
      "AdsKeywordReports.sales14d",
      "AdsKeywordReports.roas",
      "AdsKeywordReports.ctr",
      "AdsKeywordReports.cpc",
      "AdsKeywordReports.acos",
    ],
    filters,
    timeDimensions
  };

  const graphQuery = {
    measures: [...ADS_DAILY_GRAPH_MEASURES],
    dimensions: ["AdsCampaignReports.report_date"],
    filters,
    timeDimensions: timeDimensions.map(td => ({...td, dimension: "AdsCampaignReports.report_date"}))
  };

  const keywordDailyQuery = {
    dimensions: [
      "AdsKeywordReports.keyword_id",
      "AdsKeywordReports.keyword_text",
    ],
    measures: [
      "AdsKeywordReports.cost",
      "AdsKeywordReports.clicks",
      "AdsKeywordReports.sales14d",
      "AdsKeywordReports.purchases14d",
      "AdsKeywordReports.ctr",
      "AdsKeywordReports.cpc",
      "AdsKeywordReports.acos",
      "AdsKeywordReports.roas",
    ],
    filters,
    timeDimensions,
  };

  const searchTermTimeDimensions =
    startDate && endDate
      ? [
          {
            dimension: "AdsSearchTermReports.report_date",
            dateRange: [startDate, endDate],
          },
        ]
      : [];

  const searchTermQuery = buildSearchTermDetailPayload({
    filters,
    timeDimensions: searchTermTimeDimensions,
  });

  const matchTypeQuery = buildMatchTypeRollupPayload({
    filters,
    timeDimensions: searchTermTimeDimensions,
  });

  try {
    const [keywords, graphData, keywordDailyRaw, searchTermRaw, matchTypeRaw] =
      await Promise.all([
        fetchCubeData(keywordsQuery),
        fetchCubeData(graphQuery),
        fetchCubeData(keywordDailyQuery),
        fetchCubeData(searchTermQuery),
        fetchCubeData(matchTypeQuery),
      ]);

    return {
      keywords: keywords.map((item) => ({
        id: item["AdsKeywordReports.keyword_id"],
        term: item["AdsKeywordReports.keyword_text"],
        match: item["AdsKeywordReports.match_type"],
        spend: item["AdsKeywordReports.cost"],
        clicks: item["AdsKeywordReports.clicks"],
        orders: item["AdsKeywordReports.purchases14d"],
        sales: item["AdsKeywordReports.sales14d"],
        roas: item["AdsKeywordReports.roas"],
        ctr: item["AdsKeywordReports.ctr"],
      })),
      graphData: graphData.map(mapAdsCampaignDailyGraphRow),
      keywordDaily: keywordDailyRaw.map(mapKeywordDailyRow),
      searchTerms: parseSearchTermCubeResponse(searchTermRaw),
      matchTypeRollup: matchTypeRaw.map(mapMatchTypeRollupRow),
    };
  } catch (error) {
    console.error("Error fetching Keywords data:", error);
    return null;
  }
}

/**
 * Fetches data for the Campaigns report.
 */
export async function getCampaignsData(companyId, startDate, endDate) {
  if (!companyId) return null;

  const filters = [
    {
      member: "Companies.id",
      operator: "equals",
      values: [companyId]
    }
  ];

  const timeDimensions = startDate && endDate ? [
    {
      dimension: "AdsCampaignReports.report_date",
      dateRange: [startDate, endDate],
      granularity: "day"
    }
  ] : [];

  const campaignsQuery = {
    dimensions: [
      "AdsCampaignReports.campaign_name",
      "AdsCampaignReports.campaign_id",
    ],
    measures: [
      "AdsCampaignReports.clicks",
      "AdsCampaignReports.cost",
      "AdsCampaignReports.impressions",
      "AdsCampaignReports.sales14d",
      "AdsCampaignReports.purchases14d",
      "AdsCampaignReports.roas",
      "AdsCampaignReports.ctr",
      "AdsCampaignReports.cpc",
      "AdsCampaignReports.acos",
    ],
    filters,
    timeDimensions
  };

  const graphQuery = {
    measures: [...ADS_DAILY_GRAPH_MEASURES],
    dimensions: ["AdsCampaignReports.report_date"],
    filters,
    timeDimensions
  };

  const campaignDailyQuery = {
    dimensions: [
      "AdsCampaignReports.campaign_id",
      "AdsCampaignReports.campaign_name",
    ],
    measures: [
      "AdsCampaignReports.cost",
      "AdsCampaignReports.clicks",
      "AdsCampaignReports.impressions",
      "AdsCampaignReports.sales14d",
      "AdsCampaignReports.purchases14d",
      "AdsCampaignReports.ctr",
      "AdsCampaignReports.cpc",
      "AdsCampaignReports.acos",
      "AdsCampaignReports.roas",
    ],
    filters,
    timeDimensions,
  };

  try {
    const [campaigns, graphData, campaignDailyRaw] = await Promise.all([
      fetchCubeData(campaignsQuery),
      fetchCubeData(graphQuery),
      fetchCubeData(campaignDailyQuery),
    ]);

    return {
      campaigns: campaigns.map(item => ({
        name: item['AdsCampaignReports.campaign_name'],
        id: item['AdsCampaignReports.campaign_id'],
        clicks: item['AdsCampaignReports.clicks'],
        impressions: item['AdsCampaignReports.impressions'],
        spend: item['AdsCampaignReports.cost'],
        sales: item['AdsCampaignReports.sales14d'],
        orders: item['AdsCampaignReports.purchases14d'],
        roas: item['AdsCampaignReports.roas'],
        ctr: item['AdsCampaignReports.ctr'],
        acos: item['AdsCampaignReports.acos'],
      })),
      graphData: graphData.map(mapAdsCampaignDailyGraphRow),
      campaignDaily: campaignDailyRaw.map(mapCampaignDailyRow),
    };
  } catch (error) {
    console.error("Error fetching Campaigns data:", error);
    return null;
  }
}

/**
 * Fetches data for the Seller Central reports (P&L and Sales Distribution).
 */
export async function getSellerCentralData(companyId, startDate, endDate) {
  if (!companyId) return null;

  const filters = [
    {
      member: "Companies.id",
      operator: "equals",
      values: [companyId]
    }
  ];

  const timeDimensionsPnl = startDate && endDate ? [
    {
      dimension: "PnlDistribution.report_date",
      dateRange: [startDate, endDate],
      granularity: "day"
    }
  ] : [];

  const timeDimensionsProduct = startDate && endDate ? [
    {
      dimension: "ProductStats.report_date",
      dateRange: [startDate, endDate],
      granularity: "day"
    }
  ] : [];

  const pnlQuery = {
    dimensions: [
      "PnlDistribution.report_date",
      "PnlDistribution.company_id"
    ],
    measures: [
      "PnlDistribution.adCost",
      "PnlDistribution.adSales",
      "PnlDistribution.adUnits",
      "PnlDistribution.organicSales",
      "PnlDistribution.organicUnits",
      "PnlDistribution.profit",
      "PnlDistribution.totalSales",
      "PnlDistribution.totalUnits"
    ],
    order: {
      "PnlDistribution.report_date": "asc"
    },
    filters,
    timeDimensions: timeDimensionsPnl
  };

  const productQuery = {
    dimensions: [
      "ProductStats.asin",
      "SellerListingReports.item_name"
    ],
    measures: [
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
    order: {
      "ProductStats.sales": "desc"
    },
    filters,
    timeDimensions: timeDimensionsProduct
  };

  try {
    const [pnlData, productData] = await Promise.all([
      fetchCubeData(pnlQuery),
      fetchCubeData(productQuery)
    ]);

    return {
      graphData: pnlData.map(item => ({
        date: new Date(item['PnlDistribution.report_date']).toLocaleDateString(),
        adCost: item['PnlDistribution.adCost'],
        adUnits: item['PnlDistribution.adUnits'],
        adSales: item['PnlDistribution.adSales'],
        organicSales: item['PnlDistribution.organicSales'],
        organicUnits: item['PnlDistribution.organicUnits'],
        profit: item['PnlDistribution.profit'],
        totalSales: item['PnlDistribution.totalSales'],
        totalUnits: item['PnlDistribution.totalUnits'],
      })),
      productData: productData.map(item => ({
        product: item['SellerListingReports.item_name'],
        asin: item['ProductStats.asin'],
        orders: item['ProductStats.orders'],
        units: item['ProductStats.units'],
        sales: item['ProductStats.sales'],
        profits: item['ProductStats.profit'],
        acos: item['ProductStats.acos'],
        conversion: item['ProductStats.conversions'],
        sessions: item['ProductStats.sessions'],
        tacos: item['ProductStats.tacos'],
        ads: item['ProductStats.adSales'],
      }))
    };
  } catch (error) {
    console.error("Error fetching Seller Central data:", error);
    return null;
  }
}

const weekTimeDimensions = (dimension, startDate, endDate) => [
  {
    dimension,
    dateRange: [startDate, endDate],
    granularity: "week",
  },
];

/**
 * Raw Cube rows for the Sales Trend report (weekly). Client merges PNL + ads + sessions;
 * optional ASIN weekly series when `asin` is set.
 */
export async function getSalesTrendPageData(companyId, startDate, endDate, asin) {
  if (!companyId || !startDate || !endDate) return null;

  const filters = [
    {
      member: "Companies.id",
      operator: "equals",
      values: [companyId],
    },
  ];

  const pnlQuery = {
    dimensions: ["PnlDistribution.report_date"],
    measures: [
      "PnlDistribution.adCost",
      "PnlDistribution.adSales",
      "PnlDistribution.adUnits",
      "PnlDistribution.organicSales",
      "PnlDistribution.organicUnits",
      "PnlDistribution.profit",
      "PnlDistribution.totalSales",
      "PnlDistribution.totalUnits",
    ],
    order: { "PnlDistribution.report_date": "asc" },
    filters,
    timeDimensions: weekTimeDimensions(
      "PnlDistribution.report_date",
      startDate,
      endDate
    ),
  };

  const adsQuery = {
    measures: [...ADS_DAILY_GRAPH_MEASURES],
    dimensions: ["AdsCampaignReports.report_date"],
    order: { "AdsCampaignReports.report_date": "asc" },
    filters,
    timeDimensions: weekTimeDimensions(
      "AdsCampaignReports.report_date",
      startDate,
      endDate
    ),
  };

  const sessionsQuery = {
    dimensions: ["ProductStats.report_date"],
    measures: ["ProductStats.sessions", "ProductStats.conversions"],
    order: { "ProductStats.report_date": "asc" },
    filters,
    timeDimensions: weekTimeDimensions(
      "ProductStats.report_date",
      startDate,
      endDate
    ),
  };

  const catalogQuery = {
    dimensions: ["ProductStats.asin", "SellerListingReports.item_name"],
    measures: ["ProductStats.sales"],
    order: { "ProductStats.sales": "desc" },
    filters,
    timeDimensions: [
      {
        dimension: "ProductStats.report_date",
        dateRange: [startDate, endDate],
      },
    ],
  };

  const asinQuery =
    asin &&
    ({
      dimensions: ["ProductStats.report_date"],
      measures: [
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
      ],
      order: { "ProductStats.report_date": "asc" },
      filters: [
        ...filters,
        { member: "ProductStats.asin", operator: "equals", values: [asin] },
      ],
      timeDimensions: weekTimeDimensions(
        "ProductStats.report_date",
        startDate,
        endDate
      ),
    });

  try {
    const [pnl, ads, sessions, catalog, asinWeeks] = await Promise.all([
      fetchCubeData(pnlQuery),
      fetchCubeData(adsQuery),
      fetchCubeData(sessionsQuery),
      fetchCubeData(catalogQuery),
      asinQuery ? fetchCubeData(asinQuery) : Promise.resolve(null),
    ]);

    return { pnl, ads, sessions, catalog, asinWeeks };
  } catch (error) {
    console.error("Error fetching Sales Trend data:", error);
    return null;
  }
}

/**
 * Inventory forecast grid: FBA snapshot (latest per ASIN/SKU) + units sold in the selected range.
 */
export async function getInventoryForecastPageData(
  companyId,
  startDate,
  endDate
) {
  if (!companyId || !startDate || !endDate) return null;

  const filters = [
    {
      member: "Companies.id",
      operator: "equals",
      values: [companyId],
    },
  ];

  const invEnd = endDate;
  const invStart = format(subDays(parseISO(endDate), 89), "yyyy-MM-dd");

  const inventoryQuery = {
    dimensions: [
      "SellerInventoryReports.asin",
      "SellerInventoryReports.sku",
      "SellerInventoryReports.report_date",
    ],
    measures: [
      "SellerInventoryReports.afn_total_quantity",
      "SellerInventoryReports.afn_fulfillable_quantity",
    ],
    order: { "SellerInventoryReports.report_date": "desc" },
    filters,
    timeDimensions: [
      {
        dimension: "SellerInventoryReports.report_date",
        dateRange: [invStart, invEnd],
      },
    ],
  };

  const velocityQuery = {
    dimensions: ["ProductStats.asin", "SellerListingReports.item_name"],
    measures: ["ProductStats.units"],
    order: { "ProductStats.units": "desc" },
    filters,
    timeDimensions: [
      {
        dimension: "ProductStats.report_date",
        dateRange: [startDate, endDate],
      },
    ],
  };

  const dayCount =
    differenceInCalendarDays(parseISO(endDate), parseISO(startDate)) + 1;

  const [invResult, velResult] = await Promise.allSettled([
    fetchCubeData(inventoryQuery),
    fetchCubeData(velocityQuery),
  ]);

  const inventory =
    invResult.status === "fulfilled" ? invResult.value : [];
  const velocity =
    velResult.status === "fulfilled" ? velResult.value : [];

  if (invResult.status === "rejected") {
    console.error("Inventory forecast: SellerInventoryReports query failed", invResult.reason);
  }
  if (velResult.status === "rejected") {
    console.error("Inventory forecast: ProductStats velocity query failed", velResult.reason);
  }

  if (inventory.length === 0 && velocity.length === 0) {
    return null;
  }

  return {
    inventory,
    velocity,
    dayCount,
    inventoryRange: [invStart, invEnd],
  };
}
