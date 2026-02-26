"use client";

import { FiltersProvider } from "./lib/FiltersContext";

export function Providers({ children }) {
  return (
    <FiltersProvider>
      {children}
    </FiltersProvider>
  );
}
