import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

function buildSystemPrompt(context) {
  const { companyId, page, dateStart, dateEnd } = context ?? {};

  const pageName = page ? page.replace("/reports/", "").replace("/", " > ") : "unknown";
  const dateRange = dateStart && dateEnd
    ? `${new Date(dateStart).toLocaleDateString()} to ${new Date(dateEnd).toLocaleDateString()}`
    : "recent period";

  return `You are Atlas AI, an expert Amazon account assistant embedded in the C6 Atlas analytics platform.

Current context:
- Account/Company ID: ${companyId ?? "not specified"}
- Active page: ${pageName}
- Date range: ${dateRange}

You specialize in:
- Amazon PPC (Sponsored Products, Sponsored Brands, Sponsored Display)
- Amazon Seller Central performance (P&L, units, sessions, BSR)
- Inventory management and forecasting
- Campaign optimization and budget allocation
- TACOS/ACOS/ROAS analysis
- Keyword research and search term harvesting
- Competitive analysis on Amazon

Guidelines:
- Be concise and actionable. Lead with the most important insight.
- Use specific metric names (TACOS, ACOS, ROAS, CVR, CPC, CTR, BSR) correctly.
- When you don't have live data, acknowledge it and provide general best-practice guidance.
- Format responses with **bold** for emphasis, bullet points for lists.
- Keep responses under 300 words unless a detailed breakdown is requested.
- Always suggest a concrete next action.`;
}

export async function POST(req) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { message, context, history = [] } = body;

  if (!message?.trim()) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const systemPrompt = buildSystemPrompt(context);

  const openaiMessages = [
    { role: "system", content: systemPrompt },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: message },
  ];

  const openaiRes = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: openaiMessages,
      stream: true,
      max_tokens: 600,
      temperature: 0.7,
    }),
  });

  if (!openaiRes.ok) {
    const err = await openaiRes.text();
    return NextResponse.json({ error: "OpenAI error", details: err }, { status: 502 });
  }

  return new Response(openaiRes.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
