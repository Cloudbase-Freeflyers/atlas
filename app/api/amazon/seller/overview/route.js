import { getSellerCentralData } from "../../../../lib/reportsData.js";

/**
 * GET /api/amazon/seller/overview
 * Returns Seller Central P&L data (charts + table) for the Seller Central report page.
 */
export async function GET() {
  const result = await getSellerCentralData();
  return Response.json(result);
}
