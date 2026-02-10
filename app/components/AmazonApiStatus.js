"use client";

import { useEffect, useState } from "react";

export default function AmazonApiStatus() {
  const [seller, setSeller] = useState(null);
  const [ads, setAds] = useState(null);

  useEffect(() => {
    const base = typeof window !== "undefined" ? window.location.origin : "";
    Promise.all([
      fetch(`${base}/api/amazon/seller`).then((r) => r.json()),
      fetch(`${base}/api/amazon/ads`).then((r) => r.json()).catch(() => ({ status: "not_configured" })),
    ])
      .then(([sellerRes, adsRes]) => {
        setSeller(sellerRes);
        // Treat 401 / not configured as "off" so Seller-only testing isn't noisy
        const adsStatus = adsRes?.status === "error" && (adsRes?.error?.includes?.("401") || adsRes?.error?.includes?.("UNAUTHORIZED"))
          ? "not_configured"
          : adsRes?.status ?? "not_configured";
        setAds({ ...adsRes, status: adsStatus });
      })
      .catch(() => {
        setSeller({ status: "error" });
        setAds({ status: "not_configured" });
      });
  }, []);

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
