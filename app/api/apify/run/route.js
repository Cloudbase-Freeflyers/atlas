import { NextResponse } from "next/server";
import { runKeywordTracker } from "@/lib/apifyClient";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      keywords,
      asins = [],
      domain = "amazon.com",
      maxResultsPerKeyword = 48,
    } = body;

    if (!Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json(
        { error: "keywords must be a non-empty array" },
        { status: 400 }
      );
    }

    const result = await runKeywordTracker({
      keywords: keywords.slice(0, 50),
      trackASINs: asins.slice(0, 20),
      domain,
      maxResultsPerKeyword,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("[apify/run]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
