"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { useShell } from "@/lib/ShellContext";
import {
  LayoutDashboard,
  TrendingUp,
  Megaphone,
  ShoppingCart,
  Package,
  Boxes,
  Lightbulb,
  BellRing,
  PieChart,
  Sparkles,
  Settings,
  ChevronLeft,
  ChevronRight,
  Users,
  Building2,
  MessageSquare,
  BarChart3,
  Target,
  Wallet,
  CalendarClock,
  LogOut,
  Plug2,
} from "lucide-react";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { href: "/reports", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { href: "/reports/overall-kpis", label: "Overall KPIs", icon: BarChart3 },
    ],
  },
  {
    label: "Advertising",
    items: [
      { href: "/reports/ads-overview", label: "Ads Overview", icon: Megaphone },
      { href: "/reports/campaigns", label: "Campaigns", icon: Target },
      { href: "/reports/keywords", label: "Keywords", icon: TrendingUp },
      { href: "/reports/budget-optimizer", label: "Budget Optimizer", icon: Wallet, badge: "AI" },
    ],
  },
  {
    label: "Seller",
    items: [
      { href: "/reports/seller-central", label: "Seller Central", icon: ShoppingCart },
      { href: "/reports/sales-trend", label: "Sales Trend", icon: TrendingUp },
      { href: "/reports/pnl", label: "P&L Dashboard", icon: PieChart, badge: "New" },
    ],
  },
  {
    label: "Inventory",
    items: [
      { href: "/reports/inventory-forecast", label: "Forecast", icon: Package },
      { href: "/reports/product-details", label: "Products", icon: Boxes },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { href: "/reports/callouts", label: "Insights", icon: Lightbulb },
      { href: "/reports/alerts", label: "Smart Alerts", icon: BellRing, badge: "New" },
      { href: "/reports/share-of-voice", label: "Share of Voice", icon: Sparkles, badge: "New" },
      { href: "/reports/mcp-connect", label: "MCP Connect", icon: Plug2, badge: "Beta" },
    ],
  },
];

const ADMIN_GROUP = {
  label: "Admin",
  items: [
    { href: "/admin", label: "Overview", icon: Settings },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/clients", label: "Clients", icon: Building2 },
    { href: "/admin/scheduled-reports", label: "Scheduled Reports", icon: CalendarClock, badge: "New" },
  ],
};

function NavItem({ item, collapsed, isActive }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={[
        "tw:relative tw:flex tw:items-center tw:gap-3 tw:px-3 tw:py-2 tw:rounded-lg tw:text-sm tw:font-medium tw:transition-all tw:duration-150 tw:group",
        isActive
          ? "tw:bg-white/10 tw:text-white"
          : "tw:text-zinc-400 hover:tw:text-white hover:tw:bg-white/5",
      ].join(" ")}
    >
      {isActive && (
        <span className="tw:absolute tw:left-0 tw:top-1/2 tw:-translate-y-1/2 tw:w-0.5 tw:h-5 tw:bg-cyan-400 tw:rounded-r-full" />
      )}
      <Icon size={18} className="tw:shrink-0" />
      {!collapsed && (
        <span className="tw:truncate tw:flex-1">{item.label}</span>
      )}
      {!collapsed && item.badge && (
        <span className="tw:text-[10px] tw:font-semibold tw:px-1.5 tw:py-0.5 tw:rounded tw:bg-cyan-500/20 tw:text-cyan-400 tw:border tw:border-cyan-500/30">
          {item.badge}
        </span>
      )}
      {collapsed && item.badge && (
        <span className="tw:absolute tw:top-0 tw:right-0 tw:w-2 tw:h-2 tw:rounded-full tw:bg-cyan-400" />
      )}
    </Link>
  );
}

export default function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { sidebarCollapsed, setSidebarCollapsed, setChatOpen } = useShell();

  if (!user) return null;

  function isActive(item) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  const groups = user?.role === "admin"
    ? [...NAV_GROUPS, ADMIN_GROUP]
    : NAV_GROUPS;

  return (
    <aside
      className={[
        "tw:fixed tw:top-0 tw:left-0 tw:h-full tw:z-40 tw:flex tw:flex-col tw:bg-zinc-950 tw:border-r tw:border-white/[0.06] tw:transition-all tw:duration-300",
        sidebarCollapsed ? "tw:w-16" : "tw:w-60",
      ].join(" ")}
    >
      {/* Logo */}
      <div className="tw:flex tw:items-center tw:h-14 tw:px-4 tw:border-b tw:border-white/[0.06] tw:shrink-0">
        <Link href="/reports" className="tw:flex tw:items-center tw:gap-2 tw:min-w-0">
          <span className="tw:text-white tw:font-bold tw:text-lg tw:shrink-0">C6</span>
          {!sidebarCollapsed && (
            <>
              <span className="tw:text-zinc-600 tw:text-lg">/</span>
              <span className="tw:text-zinc-400 tw:font-normal tw:text-lg tw:truncate">Atlas</span>
            </>
          )}
        </Link>
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="tw:ml-auto tw:p-1 tw:rounded tw:text-zinc-600 hover:tw:text-white hover:tw:bg-white/5 tw:transition-colors tw:shrink-0"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="tw:flex-1 tw:overflow-y-auto tw:overflow-x-hidden tw:py-4 tw:px-2 tw:space-y-5 tw:scrollbar-thin">
        {groups.map((group) => (
          <div key={group.label}>
            {!sidebarCollapsed && (
              <p className="tw:px-3 tw:mb-1.5 tw:text-[10px] tw:font-semibold tw:uppercase tw:tracking-widest tw:text-zinc-600">
                {group.label}
              </p>
            )}
            {sidebarCollapsed && <div className="tw:border-t tw:border-white/[0.06] tw:my-2" />}
            <div className="tw:space-y-0.5">
              {group.items.map((item) => (
                <NavItem
                  key={item.href}
                  item={item}
                  collapsed={sidebarCollapsed}
                  isActive={isActive(item)}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom: Chat + Logout */}
      <div className="tw:shrink-0 tw:px-2 tw:pb-4 tw:space-y-0.5 tw:border-t tw:border-white/[0.06] tw:pt-3">
        <button
          onClick={() => setChatOpen(true)}
          title={sidebarCollapsed ? "AI Assistant" : undefined}
          className="tw:w-full tw:flex tw:items-center tw:gap-3 tw:px-3 tw:py-2 tw:rounded-lg tw:text-sm tw:font-medium tw:text-zinc-400 hover:tw:text-white hover:tw:bg-white/5 tw:transition-colors"
        >
          <MessageSquare size={18} className="tw:shrink-0" />
          {!sidebarCollapsed && <span>AI Assistant</span>}
        </button>
        <button
          onClick={logout}
          title={sidebarCollapsed ? "Logout" : undefined}
          className="tw:w-full tw:flex tw:items-center tw:gap-3 tw:px-3 tw:py-2 tw:rounded-lg tw:text-sm tw:font-medium tw:text-zinc-500 hover:tw:text-red-400 hover:tw:bg-red-500/5 tw:transition-colors"
        >
          <LogOut size={18} className="tw:shrink-0" />
          {!sidebarCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
