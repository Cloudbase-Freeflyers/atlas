import { getSessionsData } from "../../../../lib/reportsData.js";

/**
 * GET /api/amazon/seller/sessions
 * Returns sessions and unit session % (from SP-API GET_SALES_AND_TRAFFIC_REPORT).
 */
export async function GET() {
  const result = await getSessionsData();
  return Response.json(result);
}
