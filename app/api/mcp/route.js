import { NextResponse } from "next/server";
import createCubeApi from "@/lib/cube";
import { detectAnomalies } from "@/lib/anomalyDetection";
import { subDays, format, parseISO } from "date-fns";

// ─── MCP Server Metadata ───────────────────────────────────────────────────
const MCP_PROTOCOL_VERSION = "2024-11-05";
const SERVER_INFO = { name: "atlas-mcp", version: "1.0.0" };
const CAPABILITIES = { tools: {} };

// ─── Tool Definitions ──────────────────────────────────────────────────────
const TOOLS = [
  {
    name: "get_performance_metrics",
    description:
      "Get Amazon advertising + sales performance for an account. Returns ROAS, ACOS, TACOS, ad spend, ad sales, and total revenue for a date range.",
    inputSchema: {
      type: "object",
      properties: {
        companyId: { type: "string", description: "Company / account ID to query." },
        startDate:  { type: "string", description: "Start date YYYY-MM-DD (default: 7 days ago)." },
        endDate:    { type: "string", description: "End date YYYY-MM-DD (default: today)." },
      },
      required: ["companyId"],
    },
  },
  {
    name: "get_alerts",
    description:
      "Detect active anomaly alerts for an account — TACOS spikes, revenue drops, spend anomalies, and CTR drops. Compares last 7 days vs prior 7-day baseline.",
    inputSchema: {
      type: "object",
      properties: {
        companyId: { type: "string", description: "Company / account ID to check." },
      },
      required: ["companyId"],
    },
  },
  {
    name: "get_top_campaigns",
    description:
      "Get top campaigns ranked by ad spend with ROAS, ACOS, sales, impressions, and clicks.",
    inputSchema: {
      type: "object",
      properties: {
        companyId: { type: "string", description: "Company / account ID." },
        startDate:  { type: "string", description: "Start date YYYY-MM-DD (default: 30 days ago)." },
        endDate:    { type: "string", description: "End date YYYY-MM-DD (default: today)." },
        limit:      { type: "number", description: "Max campaigns to return (default: 10)." },
      },
      required: ["companyId"],
    },
  },
  {
    name: "get_top_keywords",
    description:
      "Get top keywords ranked by spend with ROAS, ACOS, impressions, clicks, and match type.",
    inputSchema: {
      type: "object",
      properties: {
        companyId: { type: "string", description: "Company / account ID." },
        startDate:  { type: "string", description: "Start date YYYY-MM-DD (default: 30 days ago)." },
        endDate:    { type: "string", description: "End date YYYY-MM-DD (default: today)." },
        limit:      { type: "number", description: "Max keywords to return (default: 20)." },
      },
      required: ["companyId"],
    },
  },
  {
    name: "get_pnl_summary",
    description:
      "Get P&L summary: total sales, ad cost, ad sales, organic sales, profit, and total units for an account and date range.",
    inputSchema: {
      type: "object",
      properties: {
        companyId: { type: "string", description: "Company / account ID." },
        startDate:  { type: "string", description: "Start date YYYY-MM-DD (default: 30 days ago)." },
        endDate:    { type: "string", description: "End date YYYY-MM-DD (default: today)." },
      },
      required: ["companyId"],
    },
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────
const fmt = (d) => format(d, "yyyy-MM-dd");
const companyFilter = (id) => [{ member: "Companies.id", operator: "equals", values: [String(id)] }];
const cubeRow = (res) => res.loadResponse?.results?.[0]?.data ?? [];
const cubeFirst = (res) => cubeRow(res)[0] ?? {};

function extractToken(req) {
  const auth = req.headers.get("authorization") ?? "";
  return auth.startsWith("Bearer ") ? auth.slice(7).trim() : null;
}

function rpcResult(id, result) {
  return { jsonrpc: "2.0", id, result };
}

function rpcError(id, code, message) {
  return { jsonrpc: "2.0", id, error: { code, message } };
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, Mcp-Session-Id",
  };
}

// ─── Tool Handlers ─────────────────────────────────────────────────────────
async function runTool(name, args, cubeApi) {
  const now = new Date();

  switch (name) {
    // ── Performance metrics ────────────────────────────────────────────────
    case "get_performance_metrics": {
      const start = args.startDate ? parseISO(args.startDate) : subDays(now, 7);
      const end   = args.endDate   ? parseISO(args.endDate)   : now;
      try {
        const res = await cubeApi.load({
          measures: [
            "ProductStats.sales",
            "ProductStats.adCost",
            "ProductStats.adSales",
            "ProductStats.tacos",
            "ProductStats.acos",
            "ProductStats.roas",
          ],
          timeDimensions: [{ dimension: "ProductStats.report_date", dateRange: [fmt(start), fmt(end)] }],
          filters: companyFilter(args.companyId),
        });
        const row = cubeFirst(res);
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              companyId:  args.companyId,
              dateRange:  { start: fmt(start), end: fmt(end) },
              revenue:    parseFloat(row["ProductStats.sales"]    ?? 0),
              adSpend:    parseFloat(row["ProductStats.adCost"]   ?? 0),
              adSales:    parseFloat(row["ProductStats.adSales"]  ?? 0),
              tacos:      parseFloat(row["ProductStats.tacos"]    ?? 0),
              acos:       parseFloat(row["ProductStats.acos"]     ?? 0),
              roas:       parseFloat(row["ProductStats.roas"]     ?? 0),
            }, null, 2),
          }],
        };
      } catch (e) {
        return { content: [{ type: "text", text: `Cube error: ${e.message}` }], isError: true };
      }
    }

    // ── Alerts ─────────────────────────────────────────────────────────────
    case "get_alerts": {
      const fetchWindow = async (start, end) => {
        try {
          const res = await cubeApi.load({
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
            timeDimensions: [{ dimension: "ProductStats.report_date", dateRange: [fmt(start), fmt(end)] }],
            filters: companyFilter(args.companyId),
          });
          const row = cubeFirst(res);
          return {
            revenue: parseFloat(row["ProductStats.sales"]           ?? 0),
            spend:   parseFloat(row["AdsCampaignReports.spend"]     ?? row["ProductStats.adCost"] ?? 0),
            tacos:   parseFloat(row["ProductStats.tacos"]           ?? 0),
            acos:    parseFloat(row["ProductStats.acos"]            ?? 0),
            roas:    parseFloat(row["ProductStats.roas"]            ?? 0),
            ctr:     parseFloat(row["AdsCampaignReports.ctr"]       ?? 0),
          };
        } catch {
          return { revenue: 0, spend: 0, tacos: 0, acos: 0, roas: 0, ctr: 0 };
        }
      };

      const [recent, baseline] = await Promise.all([
        fetchWindow(subDays(now, 7), now),
        fetchWindow(subDays(now, 14), subDays(now, 7)),
      ]);
      const alerts = detectAnomalies(recent, baseline);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            companyId:       args.companyId,
            alertCount:      alerts.length,
            alerts,
            recentMetrics:   recent,
            baselineMetrics: baseline,
            windows: {
              recent:   { start: fmt(subDays(now, 7)), end: fmt(now) },
              baseline: { start: fmt(subDays(now, 14)), end: fmt(subDays(now, 7)) },
            },
          }, null, 2),
        }],
      };
    }

    // ── Top campaigns ──────────────────────────────────────────────────────
    case "get_top_campaigns": {
      const start = args.startDate ? parseISO(args.startDate) : subDays(now, 30);
      const end   = args.endDate   ? parseISO(args.endDate)   : now;
      const limit = args.limit ?? 10;
      try {
        const res = await cubeApi.load({
          measures:   ["AdsCampaignReports.spend", "AdsCampaignReports.sales", "AdsCampaignReports.roas", "AdsCampaignReports.acos", "AdsCampaignReports.impressions", "AdsCampaignReports.clicks"],
          dimensions: ["AdsCampaignReports.campaign_name", "AdsCampaignReports.ad_type"],
          timeDimensions: [{ dimension: "AdsCampaignReports.report_date", dateRange: [fmt(start), fmt(end)] }],
          filters: companyFilter(args.companyId),
          order: { "AdsCampaignReports.spend": "desc" },
          limit,
        });
        const campaigns = cubeRow(res).map((row) => ({
          name:        row["AdsCampaignReports.campaign_name"],
          type:        row["AdsCampaignReports.ad_type"],
          spend:       parseFloat(row["AdsCampaignReports.spend"]       ?? 0),
          sales:       parseFloat(row["AdsCampaignReports.sales"]       ?? 0),
          roas:        parseFloat(row["AdsCampaignReports.roas"]        ?? 0),
          acos:        parseFloat(row["AdsCampaignReports.acos"]        ?? 0),
          impressions: parseInt(  row["AdsCampaignReports.impressions"] ?? 0),
          clicks:      parseInt(  row["AdsCampaignReports.clicks"]      ?? 0),
        }));
        return { content: [{ type: "text", text: JSON.stringify({ campaigns, count: campaigns.length, dateRange: { start: fmt(start), end: fmt(end) } }, null, 2) }] };
      } catch (e) {
        return { content: [{ type: "text", text: `Cube error: ${e.message}` }], isError: true };
      }
    }

    // ── Top keywords ───────────────────────────────────────────────────────
    case "get_top_keywords": {
      const start = args.startDate ? parseISO(args.startDate) : subDays(now, 30);
      const end   = args.endDate   ? parseISO(args.endDate)   : now;
      const limit = args.limit ?? 20;
      try {
        const res = await cubeApi.load({
          measures:   ["AdsKeywordReports.spend", "AdsKeywordReports.sales14d", "AdsKeywordReports.roas", "AdsKeywordReports.acos", "AdsKeywordReports.impressions", "AdsKeywordReports.clicks"],
          dimensions: ["AdsKeywordReports.keyword_text", "AdsKeywordReports.match_type"],
          timeDimensions: [{ dimension: "AdsKeywordReports.report_date", dateRange: [fmt(start), fmt(end)] }],
          filters: companyFilter(args.companyId),
          order: { "AdsKeywordReports.spend": "desc" },
          limit,
        });
        const keywords = cubeRow(res).map((row) => ({
          keyword:     row["AdsKeywordReports.keyword_text"],
          matchType:   row["AdsKeywordReports.match_type"],
          spend:       parseFloat(row["AdsKeywordReports.spend"]       ?? 0),
          sales:       parseFloat(row["AdsKeywordReports.sales14d"]    ?? 0),
          roas:        parseFloat(row["AdsKeywordReports.roas"]        ?? 0),
          acos:        parseFloat(row["AdsKeywordReports.acos"]        ?? 0),
          impressions: parseInt(  row["AdsKeywordReports.impressions"] ?? 0),
          clicks:      parseInt(  row["AdsKeywordReports.clicks"]      ?? 0),
        }));
        return { content: [{ type: "text", text: JSON.stringify({ keywords, count: keywords.length, dateRange: { start: fmt(start), end: fmt(end) } }, null, 2) }] };
      } catch (e) {
        return { content: [{ type: "text", text: `Cube error: ${e.message}` }], isError: true };
      }
    }

    // ── P&L summary ────────────────────────────────────────────────────────
    case "get_pnl_summary": {
      const start = args.startDate ? parseISO(args.startDate) : subDays(now, 30);
      const end   = args.endDate   ? parseISO(args.endDate)   : now;
      try {
        const res = await cubeApi.load({
          measures: [
            "PnlDistribution.totalSales",
            "PnlDistribution.adCost",
            "PnlDistribution.adSales",
            "PnlDistribution.organicSales",
            "PnlDistribution.profit",
            "PnlDistribution.totalUnits",
          ],
          timeDimensions: [{ dimension: "PnlDistribution.report_date", dateRange: [fmt(start), fmt(end)] }],
          filters: companyFilter(args.companyId),
        });
        const row = cubeFirst(res);
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              companyId:    args.companyId,
              dateRange:    { start: fmt(start), end: fmt(end) },
              totalSales:   parseFloat(row["PnlDistribution.totalSales"]   ?? 0),
              adCost:       parseFloat(row["PnlDistribution.adCost"]       ?? 0),
              adSales:      parseFloat(row["PnlDistribution.adSales"]      ?? 0),
              organicSales: parseFloat(row["PnlDistribution.organicSales"] ?? 0),
              profit:       parseFloat(row["PnlDistribution.profit"]       ?? 0),
              totalUnits:   parseFloat(row["PnlDistribution.totalUnits"]   ?? 0),
            }, null, 2),
          }],
        };
      } catch (e) {
        return { content: [{ type: "text", text: `Cube error: ${e.message}` }], isError: true };
      }
    }

    default:
      return { content: [{ type: "text", text: `Unknown tool: ${name}` }], isError: true };
  }
}

// ─── Route Handlers ────────────────────────────────────────────────────────

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

/** GET — discovery endpoint (returns server info + tool list) */
export async function GET() {
  return NextResponse.json(
    {
      name:            SERVER_INFO.name,
      version:         SERVER_INFO.version,
      protocolVersion: MCP_PROTOCOL_VERSION,
      description:     "Atlas MCP Server — expose C6 Atlas Amazon analytics to any MCP-compatible AI agent.",
      tools:           TOOLS.map(({ name, description }) => ({ name, description })),
    },
    { headers: corsHeaders() }
  );
}

/** POST — JSON-RPC 2.0 request handler */
export async function POST(req) {
  // Auth
  const token = extractToken(req);
  if (!token) {
    return NextResponse.json(
      rpcError(null, -32600, "Unauthorized: provide your Atlas API key as Bearer token in the Authorization header."),
      { status: 401, headers: corsHeaders() }
    );
  }

  // Parse body
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(rpcError(null, -32700, "Parse error: invalid JSON body."), { status: 400, headers: corsHeaders() });
  }

  const { jsonrpc, id = null, method, params } = body;
  if (jsonrpc !== "2.0") {
    return NextResponse.json(rpcError(id, -32600, "Invalid request: jsonrpc must be '2.0'."), { status: 400, headers: corsHeaders() });
  }

  const cubeApi = createCubeApi(token);

  switch (method) {
    case "initialize":
      return NextResponse.json(
        rpcResult(id, {
          protocolVersion: MCP_PROTOCOL_VERSION,
          capabilities:    CAPABILITIES,
          serverInfo:      SERVER_INFO,
        }),
        { headers: corsHeaders() }
      );

    case "initialized":
      return new Response(null, { status: 204, headers: corsHeaders() });

    case "ping":
      return NextResponse.json(rpcResult(id, {}), { headers: corsHeaders() });

    case "tools/list":
      return NextResponse.json(rpcResult(id, { tools: TOOLS }), { headers: corsHeaders() });

    case "tools/call": {
      const { name, arguments: args = {} } = params ?? {};
      if (!name) {
        return NextResponse.json(rpcError(id, -32602, "Invalid params: tool name required."), { status: 400, headers: corsHeaders() });
      }
      if (!TOOLS.find((t) => t.name === name)) {
        return NextResponse.json(rpcError(id, -32601, `Tool not found: ${name}`), { status: 404, headers: corsHeaders() });
      }
      try {
        const result = await runTool(name, args, cubeApi);
        return NextResponse.json(rpcResult(id, result), { headers: corsHeaders() });
      } catch (e) {
        return NextResponse.json(rpcError(id, -32000, `Tool execution error: ${e.message}`), { status: 500, headers: corsHeaders() });
      }
    }

    default:
      return NextResponse.json(rpcError(id, -32601, `Method not found: ${method}`), { status: 404, headers: corsHeaders() });
  }
}
