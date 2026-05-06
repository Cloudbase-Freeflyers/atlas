"use client";

import { useState, useEffect, useCallback } from "react";
import { useFilters } from "@/lib/FiltersContext";
import { format } from "date-fns";

/**
 * Fetches a page-specific AI insight and caches it in sessionStorage.
 * Returns { brief, tips, topAction, loading, error, refresh }
 *
 * @param {string} page - page slug matching PAGE_SYSTEM_PROMPTS keys
 * @param {object} metrics - key/value pairs of current metric values
 * @param {object} options - { skip: bool } — set skip:true until data is ready
 */
export function useAIInsight(page, metrics = {}, options = {}) {
  const { companyId, dateTimePeriod } = useFilters();
  const [state, setState] = useState({ brief: null, tips: [], topAction: null, loading: false, error: null });

  const dateRange = dateTimePeriod
    ? `${format(dateTimePeriod.startDate, "MMM d")} – ${format(dateTimePeriod.endDate, "MMM d, yyyy")}`
    : "recent period";

  const cacheKey = `atlas_ai_brief__${page}__${companyId}__${dateRange}`;

  const fetch_ = useCallback(async (force = false) => {
    if (options.skip) return;

    // Check session cache first (unless forced refresh)
    if (!force) {
      try {
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          setState((s) => ({ ...s, ...parsed, loading: false }));
          return;
        }
      } catch {/* ignore */}
    }

    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      const res = await fetch("/api/ai-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page, metrics, companyId, dateRange }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const result = { brief: data.brief ?? null, tips: data.tips ?? [], topAction: data.topAction ?? null };
      setState({ ...result, loading: false, error: null });

      try { sessionStorage.setItem(cacheKey, JSON.stringify(result)); } catch {/* ignore */}
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: err.message }));
    }
  }, [page, companyId, dateRange, options.skip, JSON.stringify(metrics)]);

  useEffect(() => {
    // Only fire when we have some real metric data
    const hasData = Object.values(metrics).some((v) => v != null && v !== "" && v !== "—" && v !== 0);
    if (hasData && !options.skip) fetch_();
  }, [fetch_]);

  return { ...state, refresh: () => fetch_(true) };
}
