"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { subDays } from "date-fns";

const FiltersContext = createContext();

export function FiltersProvider({ children }) {
  const [dateTimePeriod, setDateTimePeriod] = useState({
    startDate: subDays(new Date(), 15),
    endDate: new Date(),
  });
  const [companyId, setCompanyId] = useState(null);

  // Sync with localStorage if needed or just keep in memory for now
  // For now, let's keep it simple as requested.

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

export function useFilters() {
  const context = useContext(FiltersContext);
  if (context === undefined) {
    throw new Error("useFilters must be used within a FiltersProvider");
  }
  return context;
}
