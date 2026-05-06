import { NextResponse } from "next/server";
import { getRunStatus, fetchDatasetItems } from "@/lib/apifyClient";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const runId = searchParams.get("runId");
  const datasetId = searchParams.get("datasetId");

  if (!runId && !datasetId) {
    return NextResponse.json(
      { error: "runId or datasetId query parameter is required" },
      { status: 400 }
    );
  }

  try {
    if (runId) {
      const run = await getRunStatus(runId);

      if (run.status === "SUCCEEDED") {
        const items = await fetchDatasetItems(run.datasetId);
        const normalised = normaliseItems(items);
        return NextResponse.json({
          status: run.status,
          datasetId: run.datasetId,
          finishedAt: run.finishedAt,
          items: normalised,
        });
      }

      // RUNNING, READY, FAILED, ABORTED, TIMED-OUT
      return NextResponse.json({
        status: run.status,
        datasetId: run.datasetId,
        finishedAt: run.finishedAt,
        items: [],
      });
    }

    // Direct dataset fetch (for previously completed runs)
    const items = await fetchDatasetItems(datasetId);
    return NextResponse.json({
      status: "SUCCEEDED",
      datasetId,
      finishedAt: null,
      items: normaliseItems(items),
    });
  } catch (err) {
    console.error("[apify/results]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * Normalise raw Apify keyword tracker items into a consistent shape.
 * Each item represents one product result for one keyword search.
 */
function normaliseItems(items) {
  return items.map((item) => ({
    keyword: item.keyword ?? "",
    position: item.position ?? null,
    asin: item.asin ?? "",
    title: item.title ?? "",
    price: item.priceNumeric ?? item.price ?? null,
    rating: item.rating ?? null,
    reviewCount: item.reviewCount ?? null,
    isSponsored: item.isSponsored ?? false,
    isBestSeller: item.isBestSeller ?? false,
    isTrackedASIN: item.isTrackedASIN ?? false,
    organicPosition: item.organicPosition ?? null,
    page: item.page ?? 1,
    totalResults: item.totalResults ?? null,
    seller: item.seller ?? "",
    imageUrl: item.imageUrl ?? null,
    scrapedAt: item.scrapedAt ?? null,
    domain: item.domain ?? "amazon.com",
  }));
}
