"use client";

import { FiltersProvider } from "./lib/FiltersContext";
import { AuthProvider } from "./lib/authContext";
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import {useState} from "react";
import {TooltipProvider} from "./components/ui/tooltip";
export function Providers({ children, initialUser }) {
    const [queryClient] = useState(() => new QueryClient())
  return (
      <QueryClientProvider client={queryClient}>
          <TooltipProvider>
          <AuthProvider initialUser={initialUser}>
              <FiltersProvider>
                  {children}
              </FiltersProvider>
          </AuthProvider>
        <ReactQueryDevtools />
          </TooltipProvider>
      </QueryClientProvider>

  );
}
