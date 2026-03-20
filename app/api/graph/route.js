import createCubeApi from "../../lib/cube.js";
import { cookies } from "next/headers";

/**
 * GET /api/graph
 * Proxies requests to Cube.js with the user's auth token.
 */
export async function GET(request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value || "";

  const params = request.nextUrl.searchParams.get('data');
  if (!params) {
    return Response.json({ error: "Missing data parameter" }, { status: 400 });
  }

  const cubeApi = createCubeApi(token);

  try {
    const data = await cubeApi.load(JSON.parse(params)).then(response => {
      return response.rawData()
    });
    return Response.json(data);
  } catch (error) {
    console.error("Cube.js load error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
