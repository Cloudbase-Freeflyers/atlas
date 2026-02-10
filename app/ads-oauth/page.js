"use client";

import { useMemo, useState } from "react";

const DEFAULT_SCOPE = "advertising::campaign_management";

export default function AdsOAuthPage() {
  const [clientId, setClientId] = useState("");
  const [redirectUri, setRedirectUri] = useState("");
  const [scope, setScope] = useState(DEFAULT_SCOPE);
  const [stateValue, setStateValue] = useState("");
  const [authUrl, setAuthUrl] = useState("");
  const [code, setCode] = useState("");
  const [exchangeStatus, setExchangeStatus] = useState("");
  const [tokenResult, setTokenResult] = useState(null);

  const computedRedirectHint = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/ads-oauth`;
  }, []);

  function buildAuthUrl() {
    if (!clientId || !redirectUri) {
      setAuthUrl("");
      return;
    }
    const q = new URLSearchParams({
      client_id: clientId,
      scope: scope || DEFAULT_SCOPE,
      response_type: "code",
      redirect_uri: redirectUri,
    });
    if (stateValue) q.set("state", stateValue);
    setAuthUrl(`https://www.amazon.com/ap/oa?${q.toString()}`);
  }

  async function exchangeCode() {
    setExchangeStatus("Requesting token...");
    setTokenResult(null);
    try {
      const res = await fetch("/api/amazon/ads/oauth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, redirectUri }),
      });
      const data = await res.json();
      if (!res.ok) {
        setExchangeStatus(`Error: ${data.error || "Token exchange failed"}`);
        setTokenResult(data);
        return;
      }
      setExchangeStatus("Success. Copy refresh_token into .env.");
      setTokenResult(data);
    } catch (err) {
      setExchangeStatus(`Error: ${err.message}`);
    }
  }

  return (
    <main className="page">
      <section className="section">
        <div className="page-head">
          <div>
            <p className="eyebrow">Amazon Advertising API</p>
            <h1>Ads OAuth Helper</h1>
            <p className="page-subtitle">
              Generate the authorization URL and exchange the code for an Ads refresh token.
            </p>
          </div>
        </div>

        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-inner" style={{ display: "grid", gap: 16 }}>
            <div>
              <h3 style={{ marginBottom: 8 }}>1. Build authorization URL</h3>
              <div className="filter-row">
                <input
                  className="input"
                  placeholder="Client ID (amzn1.application-oa2-client...)"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  style={{ minWidth: 320, flex: 1 }}
                />
                <input
                  className="input"
                  placeholder={`Redirect URI (e.g. ${computedRedirectHint})`}
                  value={redirectUri}
                  onChange={(e) => setRedirectUri(e.target.value)}
                  style={{ minWidth: 320, flex: 1 }}
                />
              </div>
              <div className="filter-row">
                <input
                  className="input"
                  placeholder="Scope (default: advertising::campaign_management)"
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  style={{ minWidth: 320, flex: 1 }}
                />
                <input
                  className="input"
                  placeholder="State (optional)"
                  value={stateValue}
                  onChange={(e) => setStateValue(e.target.value)}
                  style={{ minWidth: 220 }}
                />
                <button className="button primary" type="button" onClick={buildAuthUrl}>
                  Build URL
                </button>
              </div>
              {authUrl && (
                <div style={{ display: "grid", gap: 8 }}>
                  <textarea className="input" readOnly value={authUrl} style={{ minHeight: 80 }} />
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <a className="button" href={authUrl} target="_blank" rel="noreferrer">
                      Open authorization page
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div>
              <h3 style={{ marginBottom: 8 }}>2. Exchange authorization code</h3>
              <div className="filter-row">
                <input
                  className="input"
                  placeholder="Authorization code from the redirect URL"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  style={{ minWidth: 320, flex: 1 }}
                />
                <button className="button" type="button" onClick={exchangeCode}>
                  Exchange code
                </button>
              </div>
              {exchangeStatus && (
                <p style={{ marginTop: 6, color: exchangeStatus.startsWith("Error") ? "#b42318" : "#1d4ed8" }}>
                  {exchangeStatus}
                </p>
              )}
              {tokenResult && (
                <textarea
                  className="input"
                  readOnly
                  value={JSON.stringify(tokenResult, null, 2)}
                  style={{ minHeight: 140, marginTop: 10 }}
                />
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
