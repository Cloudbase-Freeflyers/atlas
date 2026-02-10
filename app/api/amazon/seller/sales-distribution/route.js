import { getSalesDistributionData } from "../../../../lib/reportsData.js";

/**
 * GET /api/amazon/seller/sales-distribution
 * Returns sales distribution by product (from SP-API order report).
 */
export async function GET() {
  const result = await getSalesDistributionData();
  return Response.json(result);
}
