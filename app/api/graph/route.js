import cubeApi from "../../lib/cube.js";


/**
 * GET /api/amazon/seller/kpis
 * Returns KPIs for Overall KPIs and Seller Central reports.
 * Uses live SP-API when configured; otherwise returns sample data.
 */
export async function GET(request) {
  const params=request.nextUrl.searchParams.get('data');

  const data =  await cubeApi.load( JSON.parse(params)).then(response => {
    return response.rawData()
  });
  return Response.json(data);

}
