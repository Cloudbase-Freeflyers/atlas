"use client";

import { Wand2 } from "lucide-react";
import { useShell } from "@/lib/ShellContext";
import { formatValue } from "@/lib/formatters";

/**
 * AIRowAction — small wand icon that opens the ChatPanel with a pre-filled analysis prompt.
 *
 * For campaigns:
 *   <AIRowAction type="campaign" row={row} />
 *
 * For keywords:
 *   <AIRowAction type="keyword" row={row} />
 */
export default function AIRowAction({ type, row }) {
  const { setChatOpen, setChatPrefill } = useShell();

  function buildMessage() {
    if (type === "campaign") {
      const name   = row.name ?? "Unknown campaign";
      const acos   = row.acos != null ? `${(parseFloat(row.acos) * 100).toFixed(1)}%` : "N/A";
      const roas   = row.roas != null ? `${parseFloat(row.roas).toFixed(2)}x` : "N/A";
      const spend  = row.spend != null ? formatValue(row.spend, "currency") : "N/A";
      const orders = row.orders ?? 0;
      return `Diagnose campaign "${name}" — ACOS ${acos}, ROAS ${roas}, spend ${spend}, ${orders} conversions in the selected period. What should I do to improve performance?`;
    }

    if (type === "keyword") {
      const term   = row.term ?? "Unknown keyword";
      const match  = row.match ?? row.matchType ?? "N/A";
      const acos   = row.acos != null ? `${(parseFloat(row.acos) * 100).toFixed(1)}%` : "N/A";
      const clicks = row.clicks ?? 0;
      const orders = row.orders ?? 0;
      return `Analyze keyword "${term}" — match type: ${match}, ACOS: ${acos}, ${clicks} clicks, ${orders} orders. Should I adjust the bid or add this as a negative keyword?`;
    }

    return `Analyze this row: ${JSON.stringify(row)}`;
  }

  function handleClick(e) {
    e.stopPropagation();
    const msg = buildMessage();
    setChatPrefill(msg);
    setChatOpen(true);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      title="Ask AI about this row"
      className="tw:opacity-0 group-hover:tw:opacity-100 tw:transition-opacity tw:p-1.5 tw:rounded-lg tw:bg-violet-500/10 hover:tw:bg-violet-500/20 tw:text-violet-400 hover:tw:text-violet-300 tw:border tw:border-violet-500/20"
    >
      <Wand2 size={12} />
    </button>
  );
}
