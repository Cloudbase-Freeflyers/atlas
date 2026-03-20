"use client";

import { useEffect, useState } from "react";
import { getAmazonStatusAction } from "@/lib/amazonActions";

export default function AmazonApiStatus({ initialStatus }) {
  const [seller, setSeller] = useState(initialStatus?.seller || null);
  const [ads, setAds] = useState(initialStatus?.ads || null);

  useEffect(() => {
    if (initialStatus) return; // Skip fetch if we have initial status

    getAmazonStatusAction().then((status) => {
      setSeller(status.seller);
      setAds(status.ads);
    }).catch(() => {
      setSeller({ status: "error" });
      setAds({ status: "not_configured" });
    });
  }, [initialStatus]);

  if (seller === null && ads === null) return null;

  const sellerOk = seller?.status === "connected";
  const adsOk = ads?.status === "connected";
  const sellerError = seller?.status === "error" ? seller?.error : null;
  const adsError = ads?.status === "error" ? ads?.error : null;
  const adsNotSet = ads?.status === "not_configured" || !ads?.status;
  const adsLabel = adsNotSet ? "Advertising: off (Seller only)" : "Advertising: " + (ads?.status ?? "—");

  return (
    <div className="amazon-api-status" role="status" aria-live="polite">
      <span
        className={sellerOk ? "status-dot connected" : sellerError ? "status-dot error" : "status-dot"}
        title={sellerError || undefined}
      >
        Seller Central: {seller?.status ?? "—"}
      </span>
      <span className="amazon-api-status-sep" aria-hidden>·</span>
      <span
        className={adsOk ? "status-dot connected" : adsError ? "status-dot error" : "status-dot"}
        title={adsError || undefined}
      >
        {adsLabel}
      </span>
      {sellerError && (
        <p className="amazon-api-status-msg">
          Seller: {sellerError.slice(0, 120)}{sellerError.length > 120 ? "…" : ""}
        </p>
      )}
      {adsError && ads?.status === "error" && (
        <p className="amazon-api-status-msg">
          Ads: {adsError.slice(0, 80)}{adsError.length > 80 ? "…" : ""}
        </p>
      )}
    </div>
  );
}
