import { NextResponse } from "next/server";
import createCubeApi from "@/lib/cube";
import { detectAnomalies } from "@/lib/anomalyDetection";
import { cookies } from "next/headers";
import { subDays, format } from "date-fns";

async function fetchWindow(cubeApi, companyId, startDate, endDate) {
  const fmt = (d) => format(d, "yyyy-MM-dd");
  try {
    const result = await cubeApi.load({
      measures: [
        "ProductStats.sales",
        "ProductStats.adCost",
        "ProductStats.adSales",
        "ProductStats.tacos",
        "ProductStats.acos",
        "ProductStats.roas",
        "AdsCampaignReports.spend",
        "AdsCampaignReports.ctr",
      ],
      timeDimensions: [
        {
          dimension: "ProductStats.report_date",
          dateRange: [fmt(startDate), fmt(endDate)],
        },
      ],
      filters: companyId
        ? [{ member: "Companies.id", operator: "equals", values: [String(companyId)] }]
        : [],
    });

    const row = result.loadResponse?.results?.[0]?.data?.[0] ?? {};
    return {
      revenue: parseFloat(row["ProductStats.sales"] ?? 0),
      spend:   parseFloat(row["AdsCampaignReports.spend"] ?? row["ProductStats.adCost"] ?? 0),
      tacos:   parseFloat(row["ProductStats.tacos"] ?? 0),
      acos:    parseFloat(row["ProductStats.acos"] ?? 0),
      roas:    parseFloat(row["ProductStats.roas"] ?? 0),
      ctr:     parseFloat(row["AdsCampaignReports.ctr"] ?? 0),
    };
  } catch {
    return { revenue: 0, spend: 0, tacos: 0, acos: 0, roas: 0, ctr: 0 };
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  const cubeApi = createCubeApi(token);

  const now = new Date();
  const [recentMetrics, baselineMetrics] = await Promise.all([
    fetchWindow(cubeApi, companyId, subDays(now, 7), now),
    fetchWindow(cubeApi, companyId, subDays(now, 14), subDays(now, 7)),
  ]);

  const alerts = detectAnomalies(recentMetrics, baselineMetrics);

  return NextResponse.json({
    alerts,
    recentWindow: { start: format(subDays(now, 7), "yyyy-MM-dd"), end: format(now, "yyyy-MM-dd") },
    baselineWindow: { start: format(subDays(now, 14), "yyyy-MM-dd"), end: format(subDays(now, 7), "yyyy-MM-dd") },
    recentMetrics,
    baselineMetrics,
  });
}
