"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatValue } from "@/lib/formatters";

function monthKeys(count = 24) {
  const out = [];
  const d = new Date();
  d.setDate(1);
  for (let i = 0; i < count; i++) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    out.push(`${y}-${m}`);
    d.setMonth(d.getMonth() + 1);
  }
  return out;
}

function budgetsToMap(budgets) {
  const map = {};
  for (const b of budgets || []) {
    map[b.month] = b.amount;
  }
  return map;
}

export default function MonthlyBudgetDialog({ open, onOpenChange, monthlyBudgets, onApply }) {
  const months = useMemo(() => monthKeys(24), []);
  const [amounts, setAmounts] = useState(() => budgetsToMap(monthlyBudgets));

  useEffect(() => {
    if (open) {
      setAmounts(budgetsToMap(monthlyBudgets));
    }
  }, [open, monthlyBudgets]);

  const handleApply = () => {
    const next = months
      .map((month) => ({
        month,
        amount: Number(amounts[month]) || 0,
      }))
      .filter((b) => b.amount > 0);
    onApply(next);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="tw:sm:max-w-lg tw:max-h-[85vh] tw:overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Monthly budget</DialogTitle>
        </DialogHeader>
        <p className="tw:text-xs tw:text-zinc-500">
          Enter planned spend per month (USD). Months with zero are omitted when saved.
        </p>
        <div className="tw:space-y-2 tw:max-h-[50vh] tw:overflow-y-auto tw:pr-1">
          {months.map((month) => (
            <div key={month} className="tw:flex tw:items-center tw:gap-3">
              <span className="tw:w-24 tw:text-sm tw:text-zinc-400 tw:shrink-0">{month}</span>
              <Input
                type="number"
                min={0}
                step={100}
                className="tw:flex-1"
                value={amounts[month] ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setAmounts((prev) => ({
                    ...prev,
                    [month]: v === "" ? "" : v,
                  }));
                }}
                placeholder="0"
              />
            </div>
          ))}
        </div>
        <DialogFooter className="tw:gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleApply}>
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function formatBudgetSummary(monthlyBudgets) {
  if (!monthlyBudgets?.length) return "—";
  const total = monthlyBudgets.reduce((s, b) => s + (Number(b.amount) || 0), 0);
  return `${monthlyBudgets.length} mo · ${formatValue(total, "currency")}`;
}
