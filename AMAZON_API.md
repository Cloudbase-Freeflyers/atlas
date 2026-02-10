# Amazon API integration (Seller Central & Advertising)

Reports are **API-ready**: they use **sample data** when no credentials are set, and **live data** from Amazon when you configure Seller Central (SP-API) and/or Amazon Advertising.

### What we pull from SP-API (Seller Central)

When SP-API credentials are configured, the app pulls:

- **Orders API** – Last 30 days of orders for Overall KPIs (total orders, total sales).
- **Reports API – Order report** (`GET_FLAT_FILE_ALL_ORDERS_DATA_BY_ORDER_DATE_GENERAL`) – Last 30 days: product-level orders, units, and sales. Used for:
  - **Seller Central Overview** (P&L-style chart and product table)
  - **Sales distribution** (sales by product, chart + table)
  - **Units** (units by product and daily trend; organic/PPC split requires Ads data)
- **Reports API – Sales and Traffic** (`GET_SALES_AND_TRAFFIC_REPORT`) – Sessions, page views, unit session % by date and by ASIN for the **Sessions** report.

Report documents are created asynchronously, polled until ready, then downloaded and parsed (tab-delimited for order report, JSON for Sales and Traffic when applicable).

---

## From scratch: where to create credentials (Seller Central)

Use this if you’re setting up for the first time. You can use **either** of these:

| Portal | URL | Use when |
|--------|-----|----------|
| **Seller Central** | [sellercentral.amazon.com](https://sellercentral.amazon.com) → Apps and Services → Develop Apps | You’re a **seller** building an app for your own account (private app). |
| **Solution Provider Portal** | [solutionproviderportal.amazon.com/sellingpartner/developerconsole](https://solutionproviderportal.amazon.com/sellingpartner/developerconsole) | You’re a **solution provider** (building apps for multiple sellers) or your org uses SPP. |

The **developer console** (create app, Client ID, Client Secret, view authorizations) is in both places. The steps below are the same; only the sign-in and “Develop Apps” entry point differ.

### Step 1: Sign in and open the developer console

**Option A – Seller Central (most sellers)**  
- Sign in: [sellercentral.amazon.com](https://sellercentral.amazon.com) (use the seller account you want to link).  
- Menu (☰) → **Apps and Services** → **Develop Apps**.

**Option B – Solution Provider Portal**  
- Sign in: [solutionproviderportal.amazon.com](https://solutionproviderportal.amazon.com) (enable cookies if prompted).  
- Go to: [solutionproviderportal.amazon.com/sellingpartner/developerconsole](https://solutionproviderportal.amazon.com/sellingpartner/developerconsole).

You must have the right role (e.g. Primary User in Seller Central, or developer access in SPP) to create and authorize apps.

---

### Step 2: You’re in the developer console

- You’ll see the **Selling Partner API** developer console (app list, Add new app, etc.).  
- If it’s your first time, you may need to accept API terms or complete a short setup.

---

### Step 3: Create an app (or use an existing one)

**If you don’t have an app yet:**

1. Click **Add new app** (or similar).
2. Choose **Private app** (for your own use / one seller).
3. Fill in:
   - **App name** (e.g. “MM Stats Studio” or “Brandlio”).
   - **Developer account / LWA** is usually linked to your seller account already.
4. Save / create the app.

**If you already have an app** (e.g. Brandlio): open it from the app list.

After creation you’ll see the app’s **Client ID** (e.g. `amzn1.application-oa2-client.xxxx`). This is your **AMAZON_CLIENT_ID**.

---

### Step 4: Get Client ID and Client Secret

1. In **Develop Apps**, open your app.
2. Find the **LWA client credentials** section (sometimes under “View your application information and credentials” or “Credentials”).
3. **Client ID** is shown there. Copy it → use as `AMAZON_CLIENT_ID` in `.env`.
4. **Client secret** is shown once when the app is created (or when you rotate it).  
   - If you don’t have it: use **Generate new secret** / **Rotate** and **copy the new secret immediately**.  
   - Use it as `AMAZON_CLIENT_SECRET` in `.env`.

Official doc: [View your Application Information and Credentials](https://developer-docs.amazon.com/sp-api/docs/viewing-your-application-information-and-credentials).

---

### Step 5: Get the refresh token (authorize the app)

The refresh token is created when a **seller authorizes** your app.

**In Seller Central:**  
1. Stay in **Develop Apps** with your app open.  
2. Find **Authorize app** or **Manage Authorizations**.  
3. Click **Authorize app** and choose your seller account (you must be **Primary User** to self-authorize).  
4. Complete the flow; a **refresh token** is shown (e.g. starts with `Atzr|`). Copy it.

**In Solution Provider Portal:**  
1. In the same developer console, open your app.  
2. Go to **Manage Authorizations** (or the equivalent).  
3. Use the sign-in link or flow to authorize the **seller account** you want (your own or a client’s).  
4. After authorization, the **refresh token** for that seller is shown. Copy it.

Use the copied value as `AMAZON_REFRESH_TOKEN` in `.env`. You can generate multiple refresh tokens; they don’t invalidate each other.  
Doc: [Self-authorization (private apps)](https://developer-docs.amazon.com/sp-api/docs/self-authorization).

---

### Step 6: Put credentials in `.env`

In your project root, create or edit `.env` (copy from `.env.example` if needed):

```env
AMAZON_CLIENT_ID=amzn1.application-oa2-client.xxxxxxxxxxxx
AMAZON_CLIENT_SECRET=your_client_secret_here
AMAZON_REFRESH_TOKEN=Atzr|your_refresh_token_here
```

No quotes, no spaces around `=`. Restart the app after saving.

---

### Step 7: Verify

1. Run: `npm run dev`
2. Open: [http://localhost:3000/api/amazon/seller](http://localhost:3000/api/amazon/seller)  
   - You should see `"status": "connected"` when credentials are valid.
3. Open: [http://localhost:3000/reports/overall-kpis](http://localhost:3000/reports/overall-kpis)  
   - You should see the green **“Live data from Amazon”** badge when the API returns data.

---

### Quick reference: where each credential comes from

| Credential      | Where |
|-----------------|--------|
| **Client ID**   | Developer console (Seller Central or [Solution Provider Portal](https://solutionproviderportal.amazon.com/sellingpartner/developerconsole)) → your app → LWA client credentials. |
| **Client Secret** | Same place → **Generate new secret** if needed, then copy. |
| **Refresh Token** | Same app → **Authorize app** / **Manage Authorizations** → authorize the seller account → copy the token shown. |

You can use either **Seller Central** (Develop Apps) or the **Solution Provider Portal** developer console; the credentials work the same.

---

## How to create Amazon Ads credentials (AMAZON_ADS_*)

Ads credentials are **separate from Seller Central**. You need an **Advertising API** refresh token and a **profile ID**. Client ID and Secret can be the same as Seller.

### 1. AMAZON_ADS_CLIENT_ID and AMAZON_ADS_CLIENT_SECRET

**Use the same LWA app as Seller Central.** No new app needed.

- Set `AMAZON_ADS_CLIENT_ID` = your existing `AMAZON_CLIENT_ID` (same value).
- Set `AMAZON_ADS_CLIENT_SECRET` = your existing `AMAZON_CLIENT_SECRET` (same value).

Or leave them unset; the app will fall back to `AMAZON_CLIENT_ID` and `AMAZON_CLIENT_SECRET` for Ads calls.

---

### 2. AMAZON_ADS_REFRESH_TOKEN (the one that’s different)

The **Ads** refresh token is **not** the same as the Seller Central refresh token. It comes from the **Advertising API** authorization flow.

**Steps:**

1. **Apply for Advertising API access**  
   - Go to [advertising.amazon.com/API](https://advertising.amazon.com/API) (sign in with your Amazon account).  
   - Use “Sign up” / “Get started” or the [onboarding guide](https://advertising.amazon.com/API/docs/en-us/guides/onboarding/overview).  
   - You may need to register your LWA app (same Client ID as Seller) for the Advertising API. Approval can take up to one business day.

2. **Create an authorization grant (so you can get a refresh token)**  
   - In the Advertising API docs: [Create authorization grant](https://advertising.amazon.com/API/docs/en-us/guides/get-started/create-authorization-grant).  
   - You build an **authorization URL** with your Client ID and redirect URI; the **advertiser** (you or your client) opens that URL and signs in with Amazon, then authorizes your app for **Advertising** (not Seller Central).  
   - After they approve, Amazon redirects back with an **authorization code** in the URL.

3. **Exchange the code for tokens**  
   - Your app (or a small script) exchanges that **authorization code** with LWA for an **access token** and **refresh token**.  
   - The **refresh token** from this exchange is the one that works for the **Advertising API**.  
   - Save it as `AMAZON_ADS_REFRESH_TOKEN` in `.env`.  
   - (Same LWA token endpoint as Seller: `POST https://api.amazon.com/auth/o2/token` with `grant_type=authorization_code` and the code; the response includes `refresh_token`.)

**Summary:** Seller Central “Authorize app” gives a **Seller** refresh token. For Ads you must complete the **Advertising API** OAuth flow (authorization URL → user authorizes → exchange code for tokens). That second refresh token is `AMAZON_ADS_REFRESH_TOKEN`.

---

### 3. AMAZON_ADS_PROFILE_ID (not the marketplace ID)

**Do not use a marketplace ID here.** `ATVPDKIKX0DER` is a **marketplace ID** (US), not an Ads profile ID. Using it as `AMAZON_ADS_PROFILE_ID` will cause errors.

**How to get the real profile ID:**

1. Set `AMAZON_ADS_CLIENT_ID`, `AMAZON_ADS_CLIENT_SECRET`, and `AMAZON_ADS_REFRESH_TOKEN` (the **Ads** refresh token from step 2).
2. Leave `AMAZON_ADS_PROFILE_ID` empty or commented out for now.
3. Start the app and call: **GET** [http://localhost:3000/api/amazon/ads/profiles](http://localhost:3000/api/amazon/ads/profiles)  
   - The response has a `profiles` array; each item has a numeric **`profileId`** (e.g. `1234567890`).
4. Pick the profile you want (e.g. US account) and set in `.env`:
   ```env
   AMAZON_ADS_PROFILE_ID=1234567890
   ```
   Use the **number** from the API response, not `ATVPDKIKX0DER`.

---

### 4. Optional: AMAZON_ADS_REGION

- `na` (North America, default), `eu`, or `fe`.  
- Must match the region where your advertiser profiles are (e.g. US sellers → `na`).

---

### Quick reference: Ads credentials

| Variable | Where it comes from |
|----------|----------------------|
| **AMAZON_ADS_CLIENT_ID** | Same as `AMAZON_CLIENT_ID` (same LWA app). |
| **AMAZON_ADS_CLIENT_SECRET** | Same as `AMAZON_CLIENT_SECRET`. |
| **AMAZON_ADS_REFRESH_TOKEN** | **Advertising API** OAuth flow (authorization URL → user authorizes → exchange code for tokens). Not the Seller refresh token. |
| **AMAZON_ADS_PROFILE_ID** | From **GET /api/amazon/ads/profiles** after Ads refresh token is set. Use the numeric `profileId` from the response, **not** a marketplace ID like ATVPDKIKX0DER. |

---

## How to get Client Secret and Refresh Token (short version)

You **cannot fetch** these via API. They must be obtained once from Amazon’s portals (Seller Central or Solution Provider Portal). Your client (or you, if you have access) must do the following.

### 1. Get the Client Secret

- Go to **Seller Central** → **Apps and Services** → **Develop Apps**  
  - Or: [Solution Provider Portal](https://solutionproviderportal.amazon.com/) → your app.
- Open the app (e.g. **Brandlio**) that has the Client ID you already have.
- Find **LWA client credentials** (or **View your application information and credentials**).
- The **Client secret** is shown there.  
  - If it was never saved, use **Generate new secret** (or rotate). **Copy and store it immediately**; it may be shown only once.
- Put it in `.env` as `AMAZON_CLIENT_SECRET=...`.

**Docs:** [View your Application Information and Credentials](https://developer-docs.amazon.com/sp-api/docs/viewing-your-application-information-and-credentials)

### 2. Get the Refresh Token (self-authorization)

The refresh token is created when a seller **authorizes** your app. For your own (sandbox) account you **self-authorize**:

1. Sign in to **Seller Central** with the account you want to use (you must be the **Primary User** for self-authorization).
2. Go to **Apps and Services** → **Develop Apps**.
3. Find your app (e.g. **Brandlio**) and open it.
4. On the app page, find **Authorize app** (or **Manage Authorizations**).
5. Click **Authorize app** for the seller account you want.  
   - A **refresh token** is generated and shown (long string, often starting with `Atzr|`).
6. **Copy the refresh token** and store it securely. Put it in `.env` as `AMAZON_REFRESH_TOKEN=...`.

**Important:** Generating a new refresh token does **not** invalidate previous ones. You can have multiple refresh tokens for the same app.

**Docs:** [Self-authorization (private apps)](https://developer-docs.amazon.com/sp-api/docs/self-authorization)

### 3. Summary for your client

| Credential      | Where to get it |
|-----------------|-----------------|
| **Client ID**   | You already have it (e.g. `amzn1.application-oa2-client....`). |
| **Client Secret** | Same app in Seller Central → Develop Apps → LWA client credentials (or “View credentials”). Copy or generate. |
| **Refresh Token** | Same app → **Authorize app** (self-authorize the seller account). Copy the token that appears. |

After that, set all three in `.env` and restart the app.

---

## Test your credentials

1. **Start the app** (if not already running):
   ```bash
   npm run dev
   ```

2. **Check Seller Central connection** in the browser or with curl:
   - Open: **http://localhost:3000/api/amazon/seller**
   - Or run: `curl http://localhost:3000/api/amazon/seller`
   - **Working:** You see `"status": "connected"` and optionally `kpis` with order/sales data.
   - **Not configured:** You see `"status": "not_configured"` (check `.env` and restart).
   - **Error:** You see `"status": "error"` and an `error` message (e.g. invalid refresh token or wrong region).

3. **Check in the Reports UI:**
   - Go to **http://localhost:3000/reports/overall-kpis** or **http://localhost:3000/reports/seller-central**.
   - If credentials work and the API returns data, you’ll see a green **“Live data from Amazon”** (or “Live data from Amazon Seller Central”) badge at the top.
   - The **metric strip** (e.g. Total Orders, Total Sales) and **Seller Central table** use live data when connected.
   - **Charts** that show time series (e.g. “Spend vs Sales”, “P&L Distribution”) still use sample data until we add report types that return daily/time-series data from the API.

**Summary:** With valid Seller Central credentials, the app uses the Amazon API for **numeric KPIs and tables** on the wired report pages; **time-series charts** stay on sample data for now.

---

## Seller-only mode (test without Advertising API)

You can use the app with **only Seller Central** credentials and ignore Advertising for now.

- Set **only** `AMAZON_CLIENT_ID`, `AMAZON_CLIENT_SECRET`, and `AMAZON_REFRESH_TOKEN` (your **Seller Central** refresh token).
- Leave `AMAZON_ADS_REFRESH_TOKEN` and `AMAZON_ADS_PROFILE_ID` unset.
- The status bar will show **Seller Central: connected** (when the token works) and **Advertising: off (Seller only)**. No Ads 401 errors.
- **Data from Seller Central (when token is valid):**
  - **Overall KPIs** – Total orders and total sales (last 30 days) from the **Orders API**.
  - **Seller Central** report – Same order-based summary in the table; charts still use sample data until we add more report types.
- **Ads reports** (Ads Overview, Campaigns, Keywords) will use **sample data** until you add Ads credentials. No Ads API calls are made when Ads is not configured.

So yes: you can get real data from Seller only (orders → KPIs). Fix the Seller 403 (re-authorize to get a new refresh token) and you’ll see live data on Overall KPIs and Seller Central.

---

## Sandbox credentials (Seller Central)

If your **Seller Central** app and refresh token are from the **sandbox** (test) environment, the app must call the **SP-API sandbox endpoints**, not production. Otherwise you get **403 Unauthorized**.

**In your `.env` add:**

```env
AMAZON_SANDBOX=true
```

or:

```env
AMAZON_SELLER_SANDBOX=true
```

The app will then use:

- **NA:** `https://sandbox.sellingpartnerapi-na.amazon.com`
- **EU:** `https://sandbox.sellingpartnerapi-eu.amazon.com`
- **FE:** `https://sandbox.sellingpartnerapi-fe.amazon.com`

Restart the app after changing. Sandbox is throttled (e.g. 5 req/s); see [SP-API Sandbox](https://developer-docs.amazon.com/sp-api/docs/the-selling-partner-api-sandbox).

---

## Quick start

1. Copy env example and fill in credentials:
   ```bash
   cp .env.example .env
   ```
2. **Single key (sandbox):** If you only have one set of Amazon sandbox credentials, set these three in `.env`:
   - `AMAZON_CLIENT_ID` – LWA client ID from your app
   - `AMAZON_CLIENT_SECRET` – LWA client secret
   - `AMAZON_REFRESH_TOKEN` – Seller Central refresh token (from sandbox authorization)
   Seller Central reports will use them; Ads reports will use sample data until you add Advertising API credentials.
3. **Or** set separate credentials:
   - **Seller Central**: `AMAZON_SELLER_CLIENT_ID`, `AMAZON_SELLER_CLIENT_SECRET`, `AMAZON_SELLER_REFRESH_TOKEN` (or the shared `AMAZON_*` vars above)
   - **Advertising**: `AMAZON_ADS_CLIENT_ID`, `AMAZON_ADS_CLIENT_SECRET`, `AMAZON_ADS_REFRESH_TOKEN`, `AMAZON_ADS_PROFILE_ID` (can reuse same client id/secret as Seller)
4. Run the app; report pages will show **Live data from Amazon** when connected.

## API routes (external / programmatic use)

| Route | Description |
|-------|-------------|
| `GET /api/amazon/seller` | Seller Central status and connection check |
| `GET /api/amazon/seller/kpis` | KPIs (orders, sales) – live or sample |
| `GET /api/amazon/ads` | Amazon Advertising status |
| `GET /api/amazon/ads/profiles` | **List advertising profile IDs** (use to find `AMAZON_ADS_PROFILE_ID`) |
| `GET /api/amazon/ads/overview` | Ads overview metrics and series |
| `GET /api/amazon/ads/campaigns` | Campaigns list (Sponsored Products) |
| `GET /api/amazon/ads/keywords` | Keywords/targets list |

Responses include `source: "api"` when data is from Amazon, and `source: "sample"` when using fallback data.

## Seller Central (SP-API)

- **Docs**: [Connecting to the Selling Partner API](https://developer-docs.amazon.com/sp-api/docs/connecting-to-the-selling-partner-api)
- **Auth**: LWA (Login with Amazon) – exchange `refresh_token` for access tokens.
- **Env**: `AMAZON_SELLER_CLIENT_ID`, `AMAZON_SELLER_CLIENT_SECRET`, `AMAZON_SELLER_REFRESH_TOKEN`, optional `AMAZON_SELLER_MARKETPLACE_ID`, `AMAZON_SELLER_REGION` (na / eu / fe).

Used for: **Overall KPIs**, **Seller Central Overview** (P&L, orders, product-level data). Reports API and Orders API are supported in the client; add more report types in `app/lib/amazon/sellerClient.js` as needed.

## Amazon Advertising API

- **Docs**: [Amazon Advertising API](https://advertising.amazon.com/API/docs)
- **Auth**: Same LWA flow; requests use `Amazon-Advertising-API-ClientId` and `Amazon-Advertising-API-Scope` (profile ID).
- **Env**: `AMAZON_ADS_CLIENT_ID`, `AMAZON_ADS_CLIENT_SECRET`, `AMAZON_ADS_REFRESH_TOKEN`, `AMAZON_ADS_PROFILE_ID`, optional `AMAZON_ADS_REGION`.

Used for: **Ads Overview**, **Campaigns**, **Keywords & Search Terms**. Sponsored Products campaigns and keywords are supported; reporting endpoints can be added for spend/sales/ROAS over time.

**Finding your profile ID:** Set `AMAZON_ADS_CLIENT_ID`, `AMAZON_ADS_CLIENT_SECRET`, and `AMAZON_ADS_REFRESH_TOKEN`, then call **`GET /api/amazon/ads/profiles`**. The response lists all profiles (advertiser accounts) with their `profileId`; use one as `AMAZON_ADS_PROFILE_ID`.  
**Important:** `AMAZON_ADS_REFRESH_TOKEN` must be from **Advertising API** authorization (the advertiser authorizes your app for Ads), not the Seller Central refresh token. They are different; using the Seller token for Ads returns 401.

**If you get 401 on `/api/amazon/ads/profiles`:** You need an **Ads-specific refresh token**. Complete the [Advertising API authorization flow](https://advertising.amazon.com/API/docs/en-us/get-started/developer-notes) (e.g. OAuth with your LWA app for Advertising). Do not reuse `AMAZON_REFRESH_TOKEN` (Seller Central) for Ads.

## Data flow

- **Report pages** (Server Components) call `app/lib/reportsData.js`, which uses `app/lib/amazon/*` when credentials are set, otherwise sample data from `app/lib/sampleData.js`.
- **API routes** under `app/api/amazon/*` use the same Amazon clients and return JSON for external callers or client-side refresh.

Credentials are read from `process.env` only on the server; never expose LWA client secrets or refresh tokens to the client.

---

## Troubleshooting: 403 "Access token is revoked, malformed or invalid"

If Seller Central status shows **error** and the message says the access token is revoked, malformed, or invalid:

1. **Refresh token is wrong or revoked**
   - Get a **new refresh token** by re-authorizing the app in Seller Central: **Apps and Services → Develop Apps → [your app] → Authorize app**. Copy the new token and update `AMAZON_REFRESH_TOKEN` or `AMAZON_SELLER_REFRESH_TOKEN` in `.env`. Restart the app.
   - Ensure the refresh token is for the **same LWA app** as your Client ID and Client Secret (e.g. same "Brandlio" app).

2. **Sandbox vs production**
   - Sandbox refresh tokens work only with sandbox endpoints. If you use production Seller Central, the token must come from authorizing the app in the **production** seller account (not a sandbox/test account).

3. **No extra spaces or newlines**
   - In `.env`, put the refresh token on a single line with no quotes and no spaces before/after the `=`. The app trims values automatically, but avoid pasting a token that spans multiple lines.

4. **Region / marketplace**
   - If your seller account is in EU or FE, set `AMAZON_SELLER_REGION=eu` or `AMAZON_SELLER_REGION=fe` and the correct `AMAZON_SELLER_MARKETPLACE_ID` for that region.
