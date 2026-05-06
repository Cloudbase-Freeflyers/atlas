"use client";

import { useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useFilters } from "@/lib/FiltersContext";
import { useShell } from "@/lib/ShellContext";
import CompanySelector from "@/components/CompanySelector";
import DateRangePicker from "@/components/DateRangePicker";
import { Button } from "@/components/ui/button";
import { MessageSquare, Search, Link2, Check, Bell } from "lucide-react";

const BREADCRUMBS = {
  "/reports": "Dashboard",
  "/reports/overall-kpis": "Overall KPIs",
  "/reports/ads-overview": "Ads Overview",
  "/reports/seller-central": "Seller Central",
  "/reports/seller-central/sales-distribution": "Sales Distribution",
  "/reports/seller-central/units": "Units",
  "/reports/seller-central/ppc": "PPC",
  "/reports/seller-central/sessions": "Sessions",
  "/reports/keywords": "Keywords & Search Terms",
  "/reports/campaigns": "Campaigns",
  "/reports/inventory-forecast": "Inventory Forecast",
  "/reports/inventory-forecast/restock-profiles": "Restock Profiles",
  "/reports/inventory-forecast/unit-sales-trend": "Unit Sales Trend",
  "/reports/product-details": "Product Details",
  "/reports/product-details/roi": "ROI",
  "/reports/product-details/custom-cogs": "Custom COGs",
  "/reports/sales-trend": "Sales Trend",
  "/reports/callouts": "Insights",
  "/reports/alerts": "Smart Alerts",
  "/reports/pnl": "P&L Dashboard",
  "/reports/budget-optimizer": "Budget Optimizer",
  "/reports/share-of-voice": "Share of Voice",
  "/reports/mcp-connect": "MCP Connect",
  "/admin": "Admin — Overview",
  "/admin/users": "Admin — Users",
  "/admin/clients": "Admin — Clients",
  "/admin/scheduled-reports": "Admin — Scheduled Reports",
};

export default function AppTopBar({ initialCompanies }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { companyId } = useFilters();
  const { setChatOpen, setCommandOpen } = useShell();
  const [copied, setCopied] = useState(false);

  const pageTitle = BREADCRUMBS[pathname] ?? "Atlas";

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams(searchParams.toString());
    params.set("account", companyId ?? "");
    return `${window.location.origin}${pathname}?${params.toString()}`;
  }, [companyId, pathname, searchParams]);

  const handleShare = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <header className="tw:h-14 tw:flex tw:items-center tw:gap-4 tw:px-5 tw:border-b tw:border-white/[0.06] tw:bg-zinc-950 tw:shrink-0 tw:sticky tw:top-0 tw:z-30">
      {/* Page title */}
      <h1 className="tw:text-sm tw:font-semibold tw:text-white tw:truncate tw:shrink-0">
        {pageTitle}
      </h1>

      {/* Selectors */}
      <div className="tw:flex tw:items-center tw:gap-2 tw:min-w-0">
        {initialCompanies && <CompanySelector initialCompanies={initialCompanies} />}
        <DateRangePicker />
      </div>

      {/* Right actions */}
      <div className="tw:ml-auto tw:flex tw:items-center tw:gap-1.5 tw:shrink-0">
        <button
          onClick={() => setCommandOpen(true)}
          className="tw:hidden md:tw:flex tw:items-center tw:gap-2 tw:px-3 tw:h-8 tw:rounded-lg tw:border tw:border-white/[0.08] tw:bg-white/[0.03] tw:text-zinc-500 hover:tw:text-zinc-300 hover:tw:border-white/20 tw:transition-colors tw:text-xs"
          aria-label="Open command palette"
        >
          <Search size={13} />
          <span>Search</span>
          <kbd className="tw:ml-1 tw:text-[10px] tw:bg-white/10 tw:px-1.5 tw:py-0.5 tw:rounded tw:text-zinc-500">⌘K</kbd>
        </button>

        <button
          onClick={handleShare}
          className="tw:p-2 tw:rounded-lg tw:text-zinc-500 hover:tw:text-white hover:tw:bg-white/5 tw:transition-colors"
          aria-label="Share"
          title="Copy share link"
        >
          {copied ? <Check size={16} className="tw:text-green-400" /> : <Link2 size={16} />}
        </button>

        <button
          className="tw:p-2 tw:rounded-lg tw:text-zinc-500 hover:tw:text-white hover:tw:bg-white/5 tw:transition-colors tw:relative"
          aria-label="Alerts"
          title="Smart Alerts"
          onClick={() => { window.location.href = "/reports/alerts"; }}
        >
          <Bell size={16} />
        </button>

        <button
          onClick={() => setChatOpen((o) => !o)}
          className="tw:flex tw:items-center tw:gap-2 tw:px-3 tw:h-8 tw:rounded-lg tw:bg-cyan-500/10 tw:border tw:border-cyan-500/20 tw:text-cyan-400 hover:tw:bg-cyan-500/20 tw:transition-colors tw:text-xs tw:font-medium"
          aria-label="Open AI Assistant"
        >
          <MessageSquare size={14} />
          <span className="tw:hidden sm:tw:inline">Ask AI</span>
        </button>
      </div>
    </header>
  );
}
