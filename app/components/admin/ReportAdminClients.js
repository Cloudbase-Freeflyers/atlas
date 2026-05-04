"use client";

import React, { useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import DataTable from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { useClients, useDeleteClient } from "@/hooks/useClients";
import { formatBudgetSummary } from "./MonthlyBudgetDialog";

function userById(users, id) {
  if (id == null || id === "") return "—";
  const u = users.find((x) => String(x.id) === String(id));
  return u?.email ? u.email : `User #${id}`;
}

function targetCell(row) {
  const r = row.target_roas;
  const a = row.target_acos;
  if (r == null && a == null) return "—";
  const parts = [];
  if (r != null && r > 0) parts.push(`ROAS ${Number(r).toFixed(2)}`);
  if (a != null && a > 0) parts.push(`ACOS ${(Number(a) * 100).toFixed(2)}%`);
  return parts.join(" · ");
}

function truncateText(text, max = 72) {
  const t = (text || "").trim();
  if (!t) return "";
  return t.length > max ? `${t.slice(0, max)}…` : t;
}

export default function ReportAdminClients({ initialClients = [], users = [] }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { data: clients = [], isLoading, error } = useClients({
    initialData: initialClients,
  });
  const deleteMut = useDeleteClient();

  useEffect(() => {
    if (!authLoading && user?.role !== "admin") {
      router.push("/reports");
    }
  }, [user, authLoading, router]);

  const columns = useMemo(
    () => [
      {
        header: "ID",
        accessorKey: "id",
        cell: ({ getValue }) => (
          <span className="tw:font-mono tw:text-xs tw:text-zinc-400">{String(getValue()).slice(0, 8)}…</span>
        ),
      },
      { header: "Account name", accessorKey: "name" },
      {
        header: "Brand mgr",
        id: "bm",
        accessorFn: (row) => userById(users, row.brand_manager_user_id),
      },
      {
        header: "Ads mgr",
        id: "am",
        accessorFn: (row) => userById(users, row.advertising_manager_user_id),
      },
      {
        header: "Brand goals",
        id: "brand_goals",
        enableSorting: false,
        accessorFn: (row) => row.strategy_summary,
        cell: ({ row }) => {
          const preview = truncateText(row.original.strategy_summary);
          return (
            <div className="tw:flex tw:max-w-[220px] tw:flex-col tw:gap-1">
              <span className="tw:text-xs tw:text-zinc-400 tw:line-clamp-3 tw:whitespace-normal">
                {preview || "—"}
              </span>
              <Link
                href={`/admin/clients/${row.original.id}#brand-goals`}
                className="tw:text-xs tw:font-medium tw:text-emerald-400 hover:tw:underline tw:whitespace-nowrap"
              >
                Edit goals
              </Link>
            </div>
          );
        },
      },
      {
        header: "Brand manifest",
        id: "brand_manifest",
        enableSorting: false,
        accessorFn: (row) => row.brand_manifest,
        cell: ({ row }) => (
          <div className="tw:flex tw:flex-col tw:gap-1 tw:whitespace-nowrap">
            <span className="tw:text-xs tw:text-zinc-500">
              {row.original.brand_manifest?.trim() ? "Has content" : "Empty"}
            </span>
            <a
              href={`/admin/clients/${row.original.id}/manifest`}
              target="_blank"
              rel="noopener noreferrer"
              className="tw:text-xs tw:font-medium tw:text-emerald-400 hover:tw:underline"
            >
              Open manifest
            </a>
            <Link
              href={`/admin/clients/${row.original.id}#brand-manifest-preview`}
              className="tw:text-xs tw:text-zinc-400 hover:tw:text-zinc-200 hover:tw:underline"
            >
              Edit on account page
            </Link>
          </div>
        ),
      },
      {
        header: "Contact",
        id: "contact",
        accessorFn: (row) => row.contact_email || row.contact_name || "—",
      },
      {
        header: "Budget",
        id: "budget",
        accessorFn: (row) => formatBudgetSummary(row.monthly_budgets),
      },
      {
        header: "Target",
        id: "target",
        accessorFn: (row) => targetCell(row),
      },
      {
        header: "Actions",
        id: "actions",
        cell: ({ row }) => (
          <div className="tw:flex tw:flex-wrap tw:gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/admin/clients/${row.original.id}`}>Edit</Link>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              type="button"
              disabled={deleteMut.isPending}
              onClick={async () => {
                if (!window.confirm(`Delete client “${row.original.name}”? This cannot be undone.`)) {
                  return;
                }
                try {
                  await deleteMut.mutateAsync(row.original.id);
                } catch (e) {
                  window.alert(e.message || "Delete failed");
                }
              }}
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [users, deleteMut.isPending]
  );

  if (authLoading || (user && user.role !== "admin")) return null;

  return (
    <div className="tw:container tw:mx-auto tw:max-w-6xl tw:px-4 tw:py-8 tw:space-y-6">
      <div className="tw:flex tw:flex-wrap tw:justify-between tw:items-center tw:gap-4">
        <div>
          <h1 className="tw:text-2xl tw:font-bold tw:text-white">Client accounts</h1>
          <p className="tw:text-zinc-500 tw:text-sm">
            Local store in <code className="tw:text-zinc-400">data/clients.json</code> until a shared database
            is connected.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/clients/new">Add client</Link>
        </Button>
      </div>

      <div className="tw:bg-white/5 tw:border tw:border-white/10 tw:rounded-xl tw:p-4 tw:overflow-x-auto">
        <DataTable
          columns={columns}
          rows={clients}
          loading={isLoading}
          columnSelection={false}
        />
        {error && (
          <div className="tw:mt-4 tw:p-4 tw:bg-red-500/10 tw:border tw:border-red-500/20 tw:text-red-400 tw:rounded-lg tw:text-sm">
            {error.message}
          </div>
        )}
      </div>
    </div>
  );
}
