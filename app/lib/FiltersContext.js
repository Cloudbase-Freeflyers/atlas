"use client";

import { createContext, useContext, useState, useEffect, Suspense } from "react";
import { subDays, format, parseISO } from "date-fns";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

const FiltersContext = createContext();

function FiltersInner({ children }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [dateTimePeriod, setDateTimePeriod] = useState(() => {
    const start = searchParams.get("startDate");
    const end = searchParams.get("endDate");
    return {
      startDate: start ? parseISO(start) : subDays(new Date(), 15),
      endDate: end ? parseISO(end) : new Date(),
    };
  });
  
  const [companyId, setCompanyId] = useState(() => searchParams.get("companyId"));

  // Sync state to URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (companyId) params.set("companyId", companyId);
    if (dateTimePeriod.startDate) params.set("startDate", format(dateTimePeriod.startDate, "yyyy-MM-dd"));
    if (dateTimePeriod.endDate) params.set("endDate", format(dateTimePeriod.endDate, "yyyy-MM-dd"));
    
    // Only push if changed to avoid infinite loops and unnecessary history entries
    if (params.toString() !== searchParams.toString()) {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [companyId, dateTimePeriod, router, pathname, searchParams]);

  return (
    <FiltersContext.Provider
      value={{
        dateTimePeriod,
        setDateTimePeriod,
        companyId,
        setCompanyId,
      }}
    >
      {children}
    </FiltersContext.Provider>
  );
}

export function FiltersProvider({ children }) {
  return (
    <Suspense fallback={null}>
      <FiltersInner>{children}</FiltersInner>
    </Suspense>
  );
}

export function useFilters() {
  const context = useContext(FiltersContext);
  if (context === undefined) {
    throw new Error("useFilters must be used within a FiltersProvider");
  }
  return context;
}
