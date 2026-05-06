import { NextResponse } from "next/server";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

export async function POST(req) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
  }

  const { totalBudget, campaigns } = await req.json();

  if (!totalBudget || !campaigns?.length) {
    return NextResponse.json({ error: "Budget and campaigns are required" }, { status: 400 });
  }

  const totalSpend = campaigns.reduce((sum, c) => sum + c.spend, 0);
  const dailyCap = (totalBudget / 30).toFixed(0);

  const campaignSummary = campaigns.map((c) => {
    const pct = totalSpend > 0 ? ((c.spend / totalSpend) * 100).toFixed(1) : "0";
    const avgDaily = (c.spend / 30).toFixed(2);
    return `- [${c.type}] ${c.name}: est. daily budget $${c.currentBudget?.toFixed(2)}, avg daily spend $${avgDaily}, total spend $${c.spend?.toFixed(2)} (${pct}% of portfolio), ROAS ${c.roas?.toFixed(2)}, ACOS ${(c.acos * 100)?.toFixed(1)}%, conversions ${c.conversions}`;
  }).join("\n");

  const systemPrompt = `You are a senior Amazon PPC strategist with deep expertise in Sponsored Products (SP), Sponsored Brands (SB), and Sponsored Display (SD) campaign optimization.

Your task: Given a portfolio of Amazon Advertising campaigns and a monthly budget, recommend the optimal daily budget allocation that maximizes blended ROAS while keeping TACOS under 15%.

Allocation strategy rules:
1. Prioritize high-ROAS campaigns that are budget-constrained (their avg daily spend ≈ their current budget).
2. Reduce or pause low-ROAS, high-spend campaigns that are draining budget with poor returns.
3. Maintain SP brand-defense campaigns even at lower ROAS to protect organic rank.
4. Ensure SB campaigns get meaningful budget for top-of-funnel awareness.
5. Never recommend less than $5/day for any active campaign.
6. The sum of all recommendedBudget values MUST equal $${dailyCap}/day (±$5 tolerance).

Return ONLY valid JSON in this exact format — no markdown, no commentary:
{
  "summary": "3-4 sentence executive summary explaining the overall reallocation strategy and expected outcome",
  "allocationStrategy": "1-2 sentences describing the budget split logic (e.g. 60% SP performance, 25% SB, 15% SD)",
  "recommendations": [
    {
      "campaignName": "Exact campaign name as provided",
      "campaignType": "SP|SB|SD",
      "currentBudget": number,
      "recommendedBudget": number,
      "budgetSharePct": number,
      "projectedROAS": number,
      "action": "increase|decrease|maintain",
      "rationale": "1 concise sentence explaining why this change maximizes ROI"
    }
  ],
  "projectedTotalROAS": number,
  "projectedTotalAcos": number,
  "keyInsights": ["insight1", "insight2", "insight3", "insight4"]
}`;

  const userMessage = `Monthly budget: $${totalBudget} → Daily cap: $${dailyCap}/day
Portfolio total spend (period): $${totalSpend.toFixed(2)}

Campaigns:
${campaignSummary}

Allocate the $${dailyCap}/day across these campaigns. Justify every increase or decrease based on ROAS efficiency and spend share. Campaigns with ROAS > 3x and high spend share should get more budget. Campaigns with ROAS < 1x should be cut.`;

  const res = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
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
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
  }
}
