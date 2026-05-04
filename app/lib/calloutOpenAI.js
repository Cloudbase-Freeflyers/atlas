import {
  getCalloutSystemPrompt,
  normalizeCalloutPayload,
} from "./calloutPrompts.js";

/**
 * Calls OpenAI Chat Completions and parses JSON output.
 * @param {"snapshot"|"daily"|"weekly"} mode
 */
export async function generateCalloutJson(userPrompt, mode = "snapshot") {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey?.trim()) {
    throw new Error(
      "OPENAI_API_KEY is not configured. Add OPENAI_API_KEY to .env.local."
    );
  }

  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
  const systemPrompt = getCalloutSystemPrompt(mode === "weekly" ? "weekly" : "snapshot");

  /** Optional: set OPENAI_CHAT_TEMPERATURE in .env (e.g. 0.35). Omit — many newer models only allow the API default and reject custom temperature. */
  const tempRaw = process.env.OPENAI_CHAT_TEMPERATURE?.trim();
  const temperature =
    tempRaw !== undefined && tempRaw !== ""
      ? Number.parseFloat(tempRaw)
      : undefined;

  const payload = {
    model,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  };
  if (
    Number.isFinite(temperature) &&
    temperature >= 0 &&
    temperature <= 2
  ) {
    payload.temperature = temperature;
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  if (!res.ok) {
    let detail = text;
    try {
      const j = JSON.parse(text);
      detail = j.error?.message || text;
    } catch {
      /* raw */
    }
    throw new Error(detail || `OpenAI error ${res.status}`);
  }

  const data = JSON.parse(text);
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response from OpenAI");

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("Model returned non-JSON");
  }

  return normalizeCalloutPayload(parsed);
}
