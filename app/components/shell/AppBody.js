"use client";

import { useAuth } from "@/lib/authContext";
import { useShell } from "@/lib/ShellContext";
import { usePathname } from "next/navigation";

const NO_SIDEBAR_PATHS = ["/login", "/signup"];

export default function AppBody({ children }) {
  const { user } = useAuth();
  const { sidebarCollapsed } = useShell();
  const pathname = usePathname();

  const hasSidebar = !!user && !NO_SIDEBAR_PATHS.includes(pathname);

  return (
    <div
      className="tw:transition-all tw:duration-300"
      style={{ marginLeft: hasSidebar ? (sidebarCollapsed ? "64px" : "240px") : "0px" }}
    >
      {children}
    </div>
  );
}
