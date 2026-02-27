"use client";

import { FiltersProvider } from "./lib/FiltersContext";
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import {useState} from "react";
export function Providers({ children }) {
    const [queryClient] = useState(() => new QueryClient())
  return (
      <QueryClientProvider client={queryClient}>
          <FiltersProvider>
              {children}
          </FiltersProvider>
        <ReactQueryDevtools />
      </QueryClientProvider>

  );
}
