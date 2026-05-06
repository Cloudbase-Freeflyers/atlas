import { cookies } from "next/headers";
import { fetchCalloutMetricsBundle } from "@/lib/calloutMetrics.js";
import { buildCalloutUserPrompt } from "@/lib/calloutPrompts.js";
import { generateCalloutJson } from "@/lib/calloutOpenAI.js";

/**
 * POST /api/reports/callouts
 * Body: { companyId, companyName?, startDate, endDate, mode?: "snapshot"|"daily"|"weekly" }
 * Requires auth_token cookie and OPENAI_API_KEY.
 */
export async function POST(request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.OPENAI_API_KEY?.trim()) {
    return Response.json(
      {
        error:
          "OpenAI is not configured. Set OPENAI_API_KEY in .env.local and restart the dev server.",
        code: "OPENAI_NOT_CONFIGURED",
      },
      { status: 503 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { companyId, companyName, startDate, endDate, mode } = body;
  if (!companyId || !startDate || !endDate) {
    return Response.json(
      { error: "companyId, startDate, and endDate are required" },
      { status: 400 }
    );
  }

  const runMode =
    mode === "weekly" ? "weekly" : mode === "daily" ? "daily" : "snapshot";

  const bundle = await fetchCalloutMetricsBundle(
    companyId,
    startDate,
    endDate
  );
  console.log("[callouts] bundle:", JSON.stringify({ ok: bundle.ok, errors: bundle.errors, adsCurrent: bundle.adsCurrent, pnlCurrent: bundle.pnlCurrent }, null, 2));
  const userPrompt = buildCalloutUserPrompt({
    companyName: companyName || `Company ${companyId}`,
    bundle,
    mode: runMode,
  });

  try {
    const callout = await generateCalloutJson(
      userPrompt,
      runMode === "weekly" ? "weekly" : "snapshot"
    );
    return Response.json({
      callout,
      metrics: bundle,
      mode: runMode,
      range: { startDate, endDate },
    });
  } catch (e) {
    console.error("Callouts API error:", e);
    return Response.json(
      { error: e.message || "Failed to generate callouts" },
      { status: 500 }
    );
  }
}
