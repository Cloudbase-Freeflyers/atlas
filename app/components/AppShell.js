"use client";

import { usePathname } from "next/navigation";
import TopBar from "./TopBar";

export default function AppShell({ children }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  if (isLanding) {
    return <>{children}</>;
  }

  return (
    <div className="app-shell">
      <TopBar />
      <main className="app-content">
        <div className="container">{children}</div>
      </main>
    </div>
  );
}
