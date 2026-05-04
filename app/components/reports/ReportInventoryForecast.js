"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format, subDays } from "date-fns";
import { useFilters } from "@/lib/FiltersContext.js";
import { useData } from "@/hooks/useData.js";
import { formatValue } from "@/lib/formatters.js";
import {
  buildInventoryForecastRows,
  forecastDayCount,
  formatShortDate,
  pickLatestInventoryByAsinSku,
  velocityByAsin,
} from "@/lib/inventoryForecastRows.js";
import DataTable from "../DataTable";
import ReportsConnectMessage from "../ReportsConnectMessage";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";

const LEAD_STORAGE_KEY = "atlas-inventory-forecast-leads";

function readLeadsFromStorage() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(LEAD_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function persistLeads(obj) {
  localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify(obj));
}

export default function ReportInventoryForecast({ initialData = null }) {
  const { companyId, dateTimePeriod } = useFilters();
  const [leads, setLeads] = useState({});
  const [leadDialogRowKey, setLeadDialogRowKey] = useState(null);
  const [prodDraft, setProdDraft] = useState("");
  const [freightDraft, setFreightDraft] = useState("");
  const [qtyDraft, setQtyDraft] = useState("");
  const [costDraft, setCostDraft] = useState("");

  useEffect(() => {
    setLeads(readLeadsFromStorage());
  }, []);

  const invRange = useMemo(() => {
    const end = dateTimePeriod.endDate;
    const start = subDays(end, 89);
    return [format(start, "yyyy-MM-dd"), format(end, "yyyy-MM-dd")];
  }, [dateTimePeriod.endDate]);

  const invPayload = useMemo(
    () => ({
      dimensions: [
        "SellerInventoryReports.asin",
        "SellerInventoryReports.sku",
        "SellerInventoryReports.report_date",
      ],
      measures: [
        "SellerInventoryReports.afn_total_quantity",
        "SellerInventoryReports.afn_fulfillable_quantity",
      ],
      order: { "SellerInventoryReports.report_date": "desc" },
    }),
    []
  );

  const velPayload = useMemo(
    () => ({
      dimensions: ["ProductStats.asin", "SellerListingReports.item_name"],
      measures: ["ProductStats.units"],
      order: { "ProductStats.units": "desc" },
    }),
    []
  );

  const { data: invRaw, isLoading: invLoading } = useData(
    invPayload,
    undefined,
    "invForecastInv",
    "SellerInventoryReports.report_date",
    false,
    {
      timeDimensionDateRange: invRange,
      initialData: initialData?.inventory,
    }
  );

  const { data: velRaw, isLoading: velLoading } = useData(
    velPayload,
    undefined,
    "invForecastVel",
    "ProductStats.report_date",
    false,
    { initialData: initialData?.velocity }
  );

  const dayCount = useMemo(
    () =>
      forecastDayCount(
        format(dateTimePeriod.startDate, "yyyy-MM-dd"),
        format(dateTimePeriod.endDate, "yyyy-MM-dd")
      ),
    [dateTimePeriod.startDate, dateTimePeriod.endDate]
  );

  const tableRows = useMemo(() => {
    const latest = pickLatestInventoryByAsinSku(invRaw);
    const vMap = velocityByAsin(velRaw);
    return buildInventoryForecastRows(latest, vMap, dayCount, leads);
  }, [invRaw, velRaw, dayCount, leads]);

  const openLeadDialog = useCallback(
    (rowKey) => {
      const cur = leads[rowKey] || {};
      setProdDraft(
        cur.productionDays != null ? String(cur.productionDays) : ""
      );
      setFreightDraft(cur.freightDays != null ? String(cur.freightDays) : "");
      setQtyDraft(cur.restockQty != null ? String(cur.restockQty) : "");
      setCostDraft(cur.restockCost != null ? String(cur.restockCost) : "");
      setLeadDialogRowKey(rowKey);
    },
    [leads]
  );

  const saveLeads = useCallback(() => {
    if (!leadDialogRowKey) return;
    const next = { ...leads };
    const prev = next[leadDialogRowKey] || {};
    const p = prodDraft.trim() === "" ? undefined : Number(prodDraft);
    const f = freightDraft.trim() === "" ? undefined : Number(freightDraft);
    const q = qtyDraft.trim() === "" ? undefined : Number(qtyDraft);
    const c = costDraft.trim() === "" ? undefined : Number(costDraft);
    if (
      (p !== undefined && (!Number.isFinite(p) || p < 0)) ||
      (f !== undefined && (!Number.isFinite(f) || f < 0)) ||
      (q !== undefined &&
        (!Number.isFinite(q) || q < 0 || Math.floor(q) !== q)) ||
      (c !== undefined && (!Number.isFinite(c) || c < 0))
    ) {
      return;
    }
    const entry = {
      ...prev,
      productionDays: p,
      freightDays: f,
      restockQty: q,
      restockCost: c,
    };
    for (const k of Object.keys(entry)) {
      if (entry[k] === undefined) delete entry[k];
    }
    if (Object.keys(entry).length === 0) {
      delete next[leadDialogRowKey];
    } else {
      next[leadDialogRowKey] = entry;
    }
    persistLeads(next);
    setLeads(next);
    setLeadDialogRowKey(null);
  }, [
    leadDialogRowKey,
    leads,
    prodDraft,
    freightDraft,
    qtyDraft,
    costDraft,
  ]);

  const loading = invLoading || velLoading;
  const invEmpty =
    !invLoading && (!invRaw || invRaw.length === 0) && (!initialData?.inventory?.length);

  const columns = useMemo(
    () => [
      {
        key: "thumb",
        label: "Product",
        maxWidth: 56,
        render: (row) => (
          <div
            className="tw:flex tw:h-10 tw:w-10 tw:items-center tw:justify-center tw:rounded-md tw:bg-muted tw:text-xs tw:font-medium tw:text-muted-foreground"
            title={row.asin}
          >
            IMG
          </div>
        ),
      },
      {
        key: "parentAsin",
        label: "Parent",
        maxWidth: 120,
        render: (row) => row.parentAsin || "—",
      },
      { key: "asin", label: "ASIN", maxWidth: 120 },
      { key: "sku", label: "SKU", maxWidth: 140 },
      {
        key: "title",
        label: "Title",
        maxWidth: 320,
        render: (row) => (
          <span className="tw:line-clamp-2 tw:text-left" title={row.title}>
            {row.title || "—"}
          </span>
        ),
      },
      {
        key: "stockLevelLabel",
        label: "Stock level",
        maxWidth: 100,
        render: (row) => row.stockLevelLabel || "—",
      },
      {
        key: "daysToReorder",
        label: "Days to reorder",
        formatter: "compact",
        maxWidth: 110,
      },
      {
        key: "restockDate",
        label: "Restock date",
        maxWidth: 110,
        render: (row) => formatShortDate(row.restockDate) || "—",
      },
      {
        key: "restockQty",
        label: "Restock qty",
        maxWidth: 100,
        render: (row) => (
          <button
            type="button"
            className="tw:text-primary tw:underline tw:underline-offset-2"
            onClick={() => openLeadDialog(row.rowKey)}
          >
            {row.restockQty != null
              ? formatValue(row.restockQty, "compact")
              : "Set"}
          </button>
        ),
      },
      {
        key: "restockCost",
        label: "Restock cost",
        maxWidth: 110,
        render: (row) => (
          <button
            type="button"
            className="tw:text-primary tw:underline tw:underline-offset-2"
            onClick={() => openLeadDialog(row.rowKey)}
          >
            {row.restockCost != null
              ? formatValue(row.restockCost, "currency")
              : "Set"}
          </button>
        ),
      },
      {
        key: "fbaStock",
        label: "FBA stock",
        formatter: "compact",
        maxWidth: 100,
      },
      {
        key: "available",
        label: "Available",
        formatter: "compact",
        maxWidth: 100,
      },
      {
        key: "awdToFba",
        label: "AWD to FBA",
        maxWidth: 100,
        render: () => "—",
      },
      {
        key: "dailyVelocity",
        label: "Daily velocity",
        maxWidth: 110,
        render: (row, v) =>
          v != null && v !== "" ? formatValue(v, "decimal") : "—",
      },
      {
        key: "daysOfSupply",
        label: "Days of supply",
        maxWidth: 120,
        render: (row, v) =>
          v != null && v !== "" ? formatValue(v, "decimal") : "—",
      },
      {
        key: "stockoutDate",
        label: "Stockout date",
        maxWidth: 110,
        render: (row) => formatShortDate(row.stockoutDate) || "—",
      },
      {
        key: "inProduction",
        label: "In production",
        maxWidth: 110,
        render: () => "—",
      },
      {
        key: "inboundFba",
        label: "Inbound to FBA",
        maxWidth: 110,
        render: () => "—",
      },
      {
        key: "inbound3pl",
        label: "Inbound to 3PL",
        maxWidth: 110,
        render: () => "—",
      },
      {
        key: "inboundAwd",
        label: "Inbound to AWD",
        maxWidth: 110,
        render: () => "—",
      },
      {
        key: "threePl",
        label: "3PL",
        maxWidth: 90,
        render: () => "—",
      },
      {
        key: "threePlToFba",
        label: "3PL to FBA",
        maxWidth: 100,
        render: () => "—",
      },
      {
        key: "productionLead",
        label: "Production time",
        maxWidth: 120,
        render: (row) => (
          <button
            type="button"
            className="tw:text-primary tw:underline tw:underline-offset-2"
            onClick={() => openLeadDialog(row.rowKey)}
          >
            {row.productionDays != null ? `${row.productionDays}d` : "Set"}
          </button>
        ),
      },
      {
        key: "freightLead",
        label: "Freight time",
        maxWidth: 120,
        render: (row) => (
          <button
            type="button"
            className="tw:text-primary tw:underline tw:underline-offset-2"
            onClick={() => openLeadDialog(row.rowKey)}
          >
            {row.freightDays != null ? `${row.freightDays}d` : "Set"}
          </button>
        ),
      },
    ],
    [openLeadDialog]
  );

  if (!companyId) {
    return (
      <ReportsConnectMessage
        title="Select a company"
        description="Choose a company in the top bar to load inventory forecast data."
      />
    );
  }

  return (
    <div className="grid" style={{ gap: 20 }}>
      {invEmpty && (
        <ReportsConnectMessage
          title="FBA inventory snapshot unavailable"
          description="We could not load SellerInventoryReports for this range. Velocity from ProductStats may still appear once inventory data is connected in Cube."
        />
      )}

      {loading && !invEmpty && (
        <div className="card">
          <div className="card-inner reports-muted">Loading forecast grid…</div>
        </div>
      )}

      {!loading && !invEmpty && tableRows.length === 0 && (
        <ReportsConnectMessage
          title="No SKUs in this window"
          description="Try extending the inventory date window or confirm FBA inventory sync is enabled."
        />
      )}

      {!invEmpty && tableRows.length > 0 && (
        <div className="card">
          <div className="card-inner">
            <p className="reports-muted" style={{ marginBottom: 12, fontSize: 12 }}>
              Daily velocity is units sold in your selected date range divided by day count. FBA
              levels use the latest snapshot per ASIN/SKU from roughly the last 90 days through
              your range end date. Use Set on any row to enter restock quantity, restock cost, and
              production/freight lead times (saved in this browser only).
            </p>
            <DataTable
              columns={columns}
              rows={tableRows}
              searchKey="title"
              initialPageSize={20}
              pageSizeOptions={[10, 20, 50, 100, 250, 500]}
              horizontalScroll
            />
          </div>
        </div>
      )}

      <Dialog
        open={!!leadDialogRowKey}
        onOpenChange={(o) => !o && setLeadDialogRowKey(null)}
      >
        <DialogContent className="tw:sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Restock &amp; lead times</DialogTitle>
            {leadDialogRowKey && (
              <p className="tw:font-mono tw:text-muted-foreground tw:text-xs">
                {leadDialogRowKey.split("|").join(" · ")}
              </p>
            )}
          </DialogHeader>
          <p className="tw:text-muted-foreground tw:text-xs">
            Restock quantity must be a whole number. Lead times drive the restock date estimate
            (stockout minus production + freight). Stored in this browser only.
          </p>
          <div className="tw:grid tw:gap-3">
            <label className="tw:grid tw:gap-1 tw:text-sm">
              <span>Restock quantity (units)</span>
              <Input
                inputMode="numeric"
                value={qtyDraft}
                onChange={(e) => setQtyDraft(e.target.value)}
                placeholder="e.g. 500"
              />
            </label>
            <label className="tw:grid tw:gap-1 tw:text-sm">
              <span>Restock cost (USD)</span>
              <Input
                inputMode="decimal"
                value={costDraft}
                onChange={(e) => setCostDraft(e.target.value)}
                placeholder="e.g. 12500"
              />
            </label>
            <label className="tw:grid tw:gap-1 tw:text-sm">
              <span>Production (days)</span>
              <Input
                inputMode="numeric"
                value={prodDraft}
                onChange={(e) => setProdDraft(e.target.value)}
                placeholder="e.g. 45"
              />
            </label>
            <label className="tw:grid tw:gap-1 tw:text-sm">
              <span>Freight (days)</span>
              <Input
                inputMode="numeric"
                value={freightDraft}
                onChange={(e) => setFreightDraft(e.target.value)}
                placeholder="e.g. 30"
              />
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLeadDialogRowKey(null)}>
              Cancel
            </Button>
            <Button onClick={saveLeads}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
