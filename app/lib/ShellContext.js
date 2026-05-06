"use client";

import { createContext, useContext, useState, useEffect } from "react";

const ShellContext = createContext();

export function ShellProvider({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("atlas_sidebar_collapsed") === "true";
  });
  const [chatOpen, setChatOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [chatPrefill, setChatPrefill] = useState("");

  useEffect(() => {
    localStorage.setItem("atlas_sidebar_collapsed", sidebarCollapsed);
  }, [sidebarCollapsed]);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <ShellContext.Provider
      value={{
        sidebarCollapsed,
        setSidebarCollapsed,
        chatOpen,
        setChatOpen,
        commandOpen,
        setCommandOpen,
        chatPrefill,
        setChatPrefill,
      }}
    >
      {children}
    </ShellContext.Provider>
  );
}

export function useShell() {
  const ctx = useContext(ShellContext);
  if (!ctx) throw new Error("useShell must be used within ShellProvider");
  return ctx;
}
