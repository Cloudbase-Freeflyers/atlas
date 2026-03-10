"use client";

import { FiltersProvider } from "./lib/FiltersContext";
import { AuthProvider } from "./lib/authContext";
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
          <AuthProvider>
              <FiltersProvider>
                  {children}
              </FiltersProvider>
          </AuthProvider>
        <ReactQueryDevtools />
      </QueryClientProvider>

  );
}
