"use client";

import { useShell } from "@/lib/ShellContext";
import { useAuth } from "@/lib/authContext";

export default function SidebarOffsetWrapper({ children }) {
  const { user } = useAuth();
  const { sidebarCollapsed } = useShell();

  const hasSidebar = !!user;

  return (
    <div
      className="tw:min-h-screen tw:transition-all tw:duration-300"
      style={{
        marginLeft: hasSidebar ? (sidebarCollapsed ? "64px" : "240px") : "0px",
      }}
    >
      {children}
    </div>
  );
}
