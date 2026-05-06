"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useShell } from "@/lib/ShellContext";
import {
  Search, LayoutDashboard, Megaphone, ShoppingCart, Package,
  TrendingUp, Lightbulb, BellRing, PieChart, Wallet, Sparkles,
  MessageSquare, BarChart3, Target, Boxes, CalendarClock,
} from "lucide-react";

const ALL_ROUTES = [
  { href: "/reports", label: "Dashboard", icon: LayoutDashboard, group: "Pages" },
  { href: "/reports/overall-kpis", label: "Overall KPIs", icon: BarChart3, group: "Pages" },
  { href: "/reports/ads-overview", label: "Ads Overview", icon: Megaphone, group: "Pages" },
  { href: "/reports/campaigns", label: "Campaigns", icon: Target, group: "Pages" },
  { href: "/reports/keywords", label: "Keywords & Search Terms", icon: TrendingUp, group: "Pages" },
  { href: "/reports/seller-central", label: "Seller Central", icon: ShoppingCart, group: "Pages" },
  { href: "/reports/sales-trend", label: "Sales Trend", icon: TrendingUp, group: "Pages" },
  { href: "/reports/pnl", label: "P&L Dashboard", icon: PieChart, group: "Pages" },
  { href: "/reports/inventory-forecast", label: "Inventory Forecast", icon: Package, group: "Pages" },
  { href: "/reports/product-details", label: "Product Details", icon: Boxes, group: "Pages" },
  { href: "/reports/callouts", label: "Insights", icon: Lightbulb, group: "Pages" },
  { href: "/reports/alerts", label: "Smart Alerts", icon: BellRing, group: "Pages" },
  { href: "/reports/budget-optimizer", label: "Budget Optimizer", icon: Wallet, group: "Pages" },
  { href: "/reports/share-of-voice", label: "Share of Voice", icon: Sparkles, group: "Pages" },
  { href: "/admin/scheduled-reports", label: "Scheduled Reports", icon: CalendarClock, group: "Admin" },
];

export default function CommandPalette() {
  const { commandOpen, setCommandOpen, setChatOpen } = useShell();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const router = useRouter();
  const inputRef = useRef(null);

  const filtered = query.trim()
    ? ALL_ROUTES.filter((r) =>
        r.label.toLowerCase().includes(query.toLowerCase())
      )
    : ALL_ROUTES;

  useEffect(() => {
    if (commandOpen) {
      setQuery("");
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandOpen]);

  useEffect(() => {
    setSelected(0);
  }, [query]);

  const navigate = (href) => {
    setCommandOpen(false);
    router.push(href);
  };

  const handleKey = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter") {
      if (filtered[selected]) navigate(filtered[selected].href);
    } else if (e.key === "Escape") {
      setCommandOpen(false);
    }
  };

  if (!commandOpen) return null;

  return (
    <div
      className="tw:fixed tw:inset-0 tw:z-50 tw:flex tw:items-start tw:justify-center tw:pt-[20vh] tw:bg-black/60 tw:backdrop-blur-sm"
      onClick={() => setCommandOpen(false)}
    >
      <div
        className="tw:w-full tw:max-w-xl tw:mx-4 tw:bg-zinc-900 tw:border tw:border-white/10 tw:rounded-2xl tw:shadow-2xl tw:overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="tw:flex tw:items-center tw:gap-3 tw:px-4 tw:h-14 tw:border-b tw:border-white/[0.07]">
          <Search size={16} className="tw:text-zinc-500 tw:shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Search pages or actions…"
            className="tw:flex-1 tw:bg-transparent tw:text-white tw:placeholder-zinc-600 tw:outline-none tw:text-sm"
          />
          <kbd className="tw:text-[11px] tw:text-zinc-600 tw:bg-white/5 tw:px-2 tw:py-1 tw:rounded">Esc</kbd>
        </div>

        {/* Results */}
        <div className="tw:max-h-80 tw:overflow-y-auto tw:py-2">
          {/* AI action at top */}
          {!query && (
            <div className="tw:px-2 tw:mb-1">
              <p className="tw:px-2 tw:py-1 tw:text-[10px] tw:font-semibold tw:uppercase tw:tracking-widest tw:text-zinc-600">Actions</p>
              <button
                onClick={() => { setCommandOpen(false); setChatOpen(true); }}
                className="tw:w-full tw:flex tw:items-center tw:gap-3 tw:px-3 tw:py-2.5 tw:rounded-lg hover:tw:bg-white/5 tw:text-left tw:transition-colors"
              >
                <span className="tw:w-7 tw:h-7 tw:rounded-lg tw:bg-cyan-500/15 tw:flex tw:items-center tw:justify-center tw:shrink-0">
                  <MessageSquare size={14} className="tw:text-cyan-400" />
                </span>
                <div>
                  <p className="tw:text-sm tw:text-white">Open AI Assistant</p>
                  <p className="tw:text-xs tw:text-zinc-500">Ask about your account performance</p>
                </div>
              </button>
            </div>
          )}

          {/* Pages */}
          {filtered.length > 0 && (
            <div className="tw:px-2">
              {!query && <p className="tw:px-2 tw:py-1 tw:text-[10px] tw:font-semibold tw:uppercase tw:tracking-widest tw:text-zinc-600">Pages</p>}
              {filtered.map((item, i) => {
                const Icon = item.icon;
                const active = i === selected;
                return (
                  <button
                    key={item.href}
                    onClick={() => navigate(item.href)}
                    onMouseEnter={() => setSelected(i)}
                    className={[
                      "tw:w-full tw:flex tw:items-center tw:gap-3 tw:px-3 tw:py-2.5 tw:rounded-lg tw:text-left tw:transition-colors",
                      active ? "tw:bg-white/8 tw:text-white" : "tw:text-zinc-300 hover:tw:bg-white/5",
                    ].join(" ")}
                  >
                    <span className="tw:w-7 tw:h-7 tw:rounded-lg tw:bg-white/5 tw:flex tw:items-center tw:justify-center tw:shrink-0">
                      <Icon size={14} className={active ? "tw:text-cyan-400" : "tw:text-zinc-500"} />
                    </span>
                    <span className="tw:text-sm">{item.label}</span>
                    {item.group === "Admin" && (
                      <span className="tw:ml-auto tw:text-[10px] tw:text-zinc-600">Admin</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {filtered.length === 0 && (
            <p className="tw:px-6 tw:py-8 tw:text-center tw:text-zinc-600 tw:text-sm">
              No results for &ldquo;{query}&rdquo;
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
