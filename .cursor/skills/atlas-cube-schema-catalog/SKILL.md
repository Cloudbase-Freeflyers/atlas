---
name: atlas-cube-schema-catalog
description: >-
  Defines every Atlas data cube—measures, dimensions, joins, and relationships—for
  Cube.js queries, dashboards, and analytics. Use when building or debugging reports,
  graphs, KPIs, or any Atlas analytics that reference ProductPerformance, ads cubes,
  Seller reports, Companies, or AmazonProfiles.
---

# Atlas Cube Schema Catalog (Full Model Reference)

This skill provides the full schema definition for every data cube in the Atlas project. Use this as the definitive group of data models to understand every available measure, dimension, and relationship for generating precise analytics and graphs.

### Implementation notes (Atlas UI / Cube.js queries)

When editing **`atlas-ui`** reports, graphs, and `cubeReports.js`, these **member names** are what the app actually sends to Cube. Align new queries with the sections below; where the UI name differs from the conceptual cube name here, both are listed.

| Concept (this doc) | Cube.js name used in `atlas-ui` |
|--------------------|----------------------------------|
| **ProductPerformance** (hub below) | **`ProductStats`** — same role: SKU-level sales, ads, units, sessions, TACOS, etc. |
| **ProductTrafficPerformance** (traffic hub) | Not wired under that name in UI. **Sessions** report uses **`SellerSalesTrafficReports`** instead: dimensions include `report_date`, `child_asin`; measures include `sessions`, `page_views`, `unit_session_percentage`, `units_ordered`. |
| **AdsCampaignReports** measures | UI heavily uses **14-day attribution** members: **`purchases14d`**, **`sales14d`** (tables, KPIs, entity daily series). This doc also lists `purchases7d` / `sales7d`; your deployed schema may expose one or both—verify in Cube meta before swapping. |
| **AdsKeywordReports** | Same pattern: **`AdsKeywordReports.sales14d`**, **`purchases14d`** alongside `cost`, `clicks`, `ctr`, `cpc`, `acos`, `roas`. |

**PnlDistribution** — UI uses `PnlDistribution.adCost`, `adSales`, `organicSales`, `organicUnits`, `totalSales`, `totalUnits`, `profit`, `report_date`, `company_id` as documented below.

---

## 1. Unified Analytics Hubs (Primary Data Sources)

*These cubes merge multiple data sources (Sales, Ads, Traffic, Inventory) and are the preferred sources for most dashboards.*

### `ProductPerformance`

*Comprehensive SKU-level analysis merging Sales, Ads, and Inventory.*

- **Joins**: `Companies`, `SellerListingReports`
- **Dimensions**:
  - `asin` (string, PK): Amazon Standard Identification Number.
  - `report_date` (time, PK): Date of the data point.
  - `company_id` (number): Tenant ID.
- **Measures**:
  - `sales` (sum, currency): Total sales amount.
  - `totalQuantity` (sum): Total units sold.
  - `adCost` (sum, currency): Total spend on advertising.
  - `adSales` (sum, currency): Sales attributed to advertising.
  - `organicSales` (sum, currency): `sales - ad_sales`.
  - `profit` (sum, currency): `sales - ad_cost`.
  - `acos` (number, percent): `SUM(ad_cost) / SUM(ad_sales)`.
  - `roas` (number): `SUM(ad_sales) / SUM(ad_cost)`.
  - `orderCount` (countDistinct): Unique Amazon Order IDs.
  - `inventoryTotal` (sum): Total AFN quantity.
  - `inventoryFulfillable` (sum): Fulfillable AFN quantity.
  - `tacos` (number, percent): `SUM(ad_cost) / SUM(sales)`.
  - `clicks` (sum): Ad clicks.
  - `ad_purchases` (sum): Purchases from ads.
  - `conversions` (number, percent): `SUM(ad_purchases) / SUM(clicks)`.

### `ProductTrafficPerformance`

*Detailed visibility metrics including sessions, page views, and buy box percentage.*

- **Joins**: `Companies`, `SellerListingReports`
- **Dimensions**:
  - `parent_asin` (string, PK): Parent ASIN.
  - `child_asin` (string): Child ASIN.
  - `report_date` (time, PK): Date of report.
- **Measures**:
  - `sessions` (sum): Total user sessions.
  - `page_views` (sum): Total page views.
  - `buy_box_percentage` (avg, percent): Average Buy Box win rate.
  - `sales` (sum, currency): Total sales.
  - `unitsOrdered` (sum): Total units.
  - `adCost` (sum, currency): Ad spend.
  - `adSales` (sum, currency): Ad-attributed sales.
  - `conversionRate` (number, percent): `SUM(units_ordered) / SUM(sessions)`.

### `PnlDistribution`

*High-level financial performance (Sales vs. Ad Spend) at the portfolio level.*

- **Joins**: `Companies`
- **Dimensions**: `report_date` (time, PK), `company_id`.
- **Measures**: `totalSales`, `totalOrders`, `totalUnits`, `adCost`, `adSales`, `profit`, `organicSales`, `organicUnits`.

---

## 2. Marketing & Advertising Cubes

*Exhaustive granular data for Amazon Advertising.*

### `AdsCampaignReports`

- **Dimensions**: `id` (PK), `ad_type`, `report_date`, `campaign_id`, `campaign_name`, `campaign_status`, `campaign_budget_amount`.
- **Measures**: `impressions`, `clicks`, `cost`, `spend`, `purchases7d`, `sales7d`, `units_sold7d`, `sales`, `units_sold`, `ctr` (%), `acos` (%), `roas`, `cpc` ($). **Atlas UI** also queries **`purchases14d`** and **`sales14d`** where the schema exposes 14-day attribution windows.

### `AdsAdGroupReports`

- **Dimensions**: `id` (PK), `ad_type`, `report_date`, `campaign_name`, `ad_group_id`, `ad_group_name`, `ad_status`.
- **Measures**: Same as `AdsCampaignReports`.

### `AdsKeywordReports`

- **Dimensions**: `id` (PK), `report_date`, `campaign_name`, `ad_group_name`, `keyword_id`, `keyword_text`, `match_type`, `keyword_bid`, `ad_keyword_status`.
- **Measures**: Same as `AdsCampaignReports`.

### `AdsSearchTermReports`

- **Dimensions**: `id` (PK), `report_date`, `campaign_name`, `ad_group_name`, `searchTerm`, `match_type`.
- **Measures**: Same as `AdsCampaignReports` plus `keywordCount` (countDistinct).

### `AdsProductReports`

- **Dimensions**: `id` (PK), `report_date`, `campaign_name`, `advertised_asin`, `advertised_sku`.
- **Measures**: Same as `AdsCampaignReports`.

---

## 3. Operations & Raw Reports

*Direct access to raw report data for deep auditing.*

### `SellerOrderReports` (order)

- **Dimensions**: `amazon_order_id`, `asin`, `sku`, `order_status`, `fulfillment_channel`, `ship_city`, `ship_state`, `purchase_date`.
- **Measures**: `quantity` (sum), `item_price` (sum), `shipping_price` (sum).

### `SellerInventoryReports`

- **Dimensions**: `sku`, `asin`, `report_date`.
- **Measures**: `afn_total_quantity`, `afn_fulfillable_quantity`.

### `SellerFbaFeesReports`

- **Dimensions**: `sku`, `asin`, `product_group`, `brand`, `report_date`.
- **Measures**: `estimated_fee_total`, `expected_fulfillment_fee_per_unit`.

---

## 4. Supporting Metadata

*Tenant and organizational entities.*

### `Companies`

- **Dimensions**: `id` (PK), `name`, `created_at`.

### `AmazonProfiles`

- **Dimensions**: `id` (PK), `account_name`, `country_code`, `currency_code`, `timezone`.

---

## Relationship Summary

1. **Companies** (1) <-> (N) **AmazonProfiles**
2. **Companies** (1) <-> (N) **All Reporting Cubes**
3. **AdsReports** <-> **Product Hubs** via `asin` + `report_date`.
4. **Traffic** <-> **Sales** via `asin` + `report_date`.
