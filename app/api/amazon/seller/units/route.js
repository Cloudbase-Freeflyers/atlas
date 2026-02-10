import { getUnitsData } from "../../../../lib/reportsData.js";

/**
 * GET /api/amazon/seller/units
 * Returns units by product and daily series (from SP-API order report).
 */
export async function GET() {
  const result = await getUnitsData();
  return Response.json(result);
}
