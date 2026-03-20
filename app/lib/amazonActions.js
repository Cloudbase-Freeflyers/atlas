"use server";

import { getAmazonStatus } from "./serverApi";

export async function getAmazonStatusAction() {
  try {
    return await getAmazonStatus();
  } catch (error) {
    console.error("Amazon status action error:", error);
    return {
      seller: { status: "error", error: error.message },
      ads: { status: "not_configured" }
    };
  }
}
