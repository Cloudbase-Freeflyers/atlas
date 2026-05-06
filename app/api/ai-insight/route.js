import { NextResponse } from "next/server";
import { PAGE_SYSTEM_PROMPTS } from "@/lib/aiInsightPrompts";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

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

  const { page = "overall-kpis", metrics = {}, companyId, dateRange, mode } = body;

  const systemPrompt = PAGE_SYSTEM_PROMPTS[mode ?? page] ?? PAGE_SYSTEM_PROMPTS["overall-kpis"];

  // Build a human-readable metrics summary for the user message
  const metricLines = Object.entries(metrics)
    .filter(([, v]) => v != null && v !== "" && v !== "—")
    .map(([k, v]) => `- ${k}: ${v}`)
    .join("\n");

  const userMessage = `Account: Company ${companyId ?? "unknown"}
Date range: ${dateRange ?? "recent period"}
Metrics:
${metricLines || "(no metric data available — provide general guidance)"}`;

  const res = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      response_format: { type: "json_object" },
      max_tokens: 400,
      temperature: 0.5,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: "OpenAI error", details: err }, { status: 502 });
  }

  const openaiData = await res.json();
  const content = openaiData.choices?.[0]?.message?.content;

  try {
    const parsed = JSON.parse(content);
    return NextResponse.json({ ok: true, ...parsed });
  } catch {
    return NextResponse.json({ error: "Failed to parse AI response", raw: content }, { status: 500 });
  }
}
