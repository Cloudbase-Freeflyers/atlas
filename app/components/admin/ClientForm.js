"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MonthlyBudgetDialog, { formatBudgetSummary } from "./MonthlyBudgetDialog";
import { useCreateClient, useUpdateClient } from "@/hooks/useClients";

function userLabel(u) {
  return u?.email ? `${u.email}${u.id != null ? ` (#${u.id})` : ""}` : `#${u.id}`;
}

export default function ClientForm({ client, users = [] }) {
  const router = useRouter();
  const isNew = !client?.id;
  const createMut = useCreateClient();
  const updateMut = useUpdateClient();

  const [name, setName] = useState(client?.name ?? "");
  const [brandManagerId, setBrandManagerId] = useState(
    client?.brand_manager_user_id != null ? String(client.brand_manager_user_id) : ""
  );
  const [adManagerId, setAdManagerId] = useState(
    client?.advertising_manager_user_id != null
      ? String(client.advertising_manager_user_id)
      : ""
  );
  const [strategy, setStrategy] = useState(client?.strategy_summary ?? "");
  const [manifest, setManifest] = useState(client?.brand_manifest ?? "");
  const [monthlyBudgets, setMonthlyBudgets] = useState(client?.monthly_budgets ?? []);
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [roasInput, setRoasInput] = useState(
    client?.target_roas != null && client.target_roas > 0 ? String(client.target_roas) : ""
  );
  const [acosPctInput, setAcosPctInput] = useState(
    client?.target_acos != null && client.target_acos > 0
      ? String((Number(client.target_acos) * 100).toFixed(4).replace(/\.?0+$/, ""))
      : ""
  );
  const [contactName, setContactName] = useState(client?.contact_name ?? "");
  const [contactEmail, setContactEmail] = useState(client?.contact_email ?? "");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!client) return;
    setName(client.name ?? "");
    setBrandManagerId(
      client.brand_manager_user_id != null ? String(client.brand_manager_user_id) : ""
    );
    setAdManagerId(
      client.advertising_manager_user_id != null
        ? String(client.advertising_manager_user_id)
        : ""
    );
    setStrategy(client.strategy_summary ?? "");
    setManifest(client.brand_manifest ?? "");
    setMonthlyBudgets(client.monthly_budgets ?? []);
    setRoasInput(
      client.target_roas != null && client.target_roas > 0 ? String(client.target_roas) : ""
    );
    setAcosPctInput(
      client.target_acos != null && client.target_acos > 0
        ? String((Number(client.target_acos) * 100).toFixed(4).replace(/\.?0+$/, ""))
        : ""
    );
    setContactName(client.contact_name ?? "");
    setContactEmail(client.contact_email ?? "");
  }, [client]);

  const parsedTargets = useMemo(() => {
    const roas = roasInput === "" ? null : Number(roasInput);
    const acosPct = acosPctInput === "" ? null : Number(acosPctInput);
    let target_roas = null;
    let target_acos = null;
    if (roas != null && !Number.isNaN(roas) && roas > 0) {
      target_roas = roas;
      target_acos = 1 / roas;
    } else if (acosPct != null && !Number.isNaN(acosPct) && acosPct > 0) {
      target_acos = acosPct / 100;
      target_roas = 1 / target_acos;
    }
    return { target_roas, target_acos };
  }, [roasInput, acosPctInput]);

  const onRoasChange = (v) => {
    setRoasInput(v);
    if (v === "") {
      setAcosPctInput("");
      return;
    }
    const r = Number(v);
    if (!Number.isNaN(r) && r > 0) {
      setAcosPctInput(String((100 / r).toFixed(4).replace(/\.?0+$/, "")));
    }
  };

  const onAcosPctChange = (v) => {
    setAcosPctInput(v);
    if (v === "") {
      setRoasInput("");
      return;
    }
    const pct = Number(v);
    if (!Number.isNaN(pct) && pct > 0) {
      setRoasInput(String((100 / pct).toFixed(4).replace(/\.?0+$/, "")));
    }
  };

  const buildPayload = () => ({
    name: name.trim(),
    brand_manager_user_id: brandManagerId === "" ? null : Number(brandManagerId),
    advertising_manager_user_id: adManagerId === "" ? null : Number(adManagerId),
    strategy_summary: strategy,
    brand_manifest: manifest,
    monthly_budgets: monthlyBudgets,
    target_roas: parsedTargets.target_roas,
    target_acos: parsedTargets.target_acos,
    contact_name: contactName.trim(),
    contact_email: contactEmail.trim(),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Account name is required.");
      return;
    }
    const payload = buildPayload();
    try {
      if (isNew) {
        const created = await createMut.mutateAsync(payload);
        router.push(`/admin/clients/${created.id}`);
        router.refresh();
      } else {
        await updateMut.mutateAsync({ id: client.id, data: payload });
        router.refresh();
      }
    } catch (err) {
      setError(err.message || "Save failed");
    }
  };

  const saving = createMut.isPending || updateMut.isPending;

  return (
    <form onSubmit={handleSubmit} className="tw:space-y-8 tw:max-w-3xl">
      <div className="tw:flex tw:flex-wrap tw:items-center tw:justify-between tw:gap-4">
        <div>
          {!isNew && (
            <p className="tw:text-xs tw:text-zinc-500 tw:font-mono tw:mb-1">ID: {client.id}</p>
          )}
          <h1 className="tw:text-2xl tw:font-bold tw:text-white">
            {isNew ? "New client account" : "Edit client account"}
          </h1>
        </div>
        <div className="tw:flex tw:flex-wrap tw:gap-2">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/clients">Back to list</Link>
          </Button>
          {!isNew && (
            <Button type="button" variant="outline" asChild>
              <a
                href={`/admin/clients/${client.id}/manifest`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Brand manifest (new tab)
              </a>
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="tw:rounded-lg tw:border tw:border-red-500/30 tw:bg-red-500/10 tw:px-4 tw:py-3 tw:text-sm tw:text-red-300">
          {error}
        </div>
      )}

      <div className="tw:grid tw:gap-6 sm:tw:grid-cols-2">
        <div className="tw:space-y-2 sm:tw:col-span-2">
          <label className="tw:text-sm tw:text-zinc-400">Account name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="tw:space-y-2">
          <label className="tw:text-sm tw:text-zinc-400">Brand manager</label>
          <Select
            value={brandManagerId || "__none__"}
            onValueChange={(v) => setBrandManagerId(v === "__none__" ? "" : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Unassigned" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Unassigned</SelectItem>
              {users.map((u) => (
                <SelectItem key={u.id} value={String(u.id)}>
                  {userLabel(u)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="tw:space-y-2">
          <label className="tw:text-sm tw:text-zinc-400">Advertising manager</label>
          <Select
            value={adManagerId || "__none__"}
            onValueChange={(v) => setAdManagerId(v === "__none__" ? "" : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Unassigned" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Unassigned</SelectItem>
              {users.map((u) => (
                <SelectItem key={u.id} value={String(u.id)}>
                  {userLabel(u)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="tw:space-y-2" id="brand-goals">
        <label className="tw:text-sm tw:text-zinc-400">Brand goals</label>
        <p className="tw:text-xs tw:text-zinc-600">Account strategy summary (positioning, priorities, guardrails).</p>
        <Textarea
          value={strategy}
          onChange={(e) => setStrategy(e.target.value)}
          rows={5}
          className="tw:min-h-[120px]"
        />
      </div>

      <div className="tw:space-y-2" id="brand-manifest-preview">
        <label className="tw:text-sm tw:text-zinc-400">Brand manifest (short edit; full page in new tab)</label>
        <Textarea
          value={manifest}
          onChange={(e) => setManifest(e.target.value)}
          rows={6}
          className="tw:min-h-[140px]"
          placeholder="High-level brand story, voice, guardrails…"
        />
      </div>

      <div className="tw:rounded-xl tw:border tw:border-white/10 tw:bg-white/5 tw:p-4 tw:space-y-4">
        <div className="tw:flex tw:flex-wrap tw:items-center tw:justify-between tw:gap-3">
          <div>
            <p className="tw:text-sm tw:font-medium tw:text-white">Monthly budget</p>
            <p className="tw:text-xs tw:text-zinc-500">{formatBudgetSummary(monthlyBudgets)}</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => setBudgetOpen(true)}>
            Edit months
          </Button>
        </div>
        <MonthlyBudgetDialog
          open={budgetOpen}
          onOpenChange={setBudgetOpen}
          monthlyBudgets={monthlyBudgets}
          onApply={setMonthlyBudgets}
        />
      </div>

      <div className="tw:rounded-xl tw:border tw:border-white/10 tw:bg-white/5 tw:p-4 tw:space-y-4">
        <p className="tw:text-sm tw:font-medium tw:text-white">Target spend vs sales</p>
        <p className="tw:text-xs tw:text-zinc-500">
          ACOS is ad spend ÷ sales (enter as %). ROAS is sales ÷ ad spend. Values stay paired: ROAS = 1 ÷ ACOS
          (as decimals).
        </p>
        <div className="tw:grid tw:gap-4 sm:tw:grid-cols-2">
          <div className="tw:space-y-2">
            <label className="tw:text-sm tw:text-zinc-400">Target ROAS</label>
            <Input
              type="number"
              min={0}
              step={0.01}
              value={roasInput}
              onChange={(e) => onRoasChange(e.target.value)}
              placeholder="e.g. 4"
            />
          </div>
          <div className="tw:space-y-2">
            <label className="tw:text-sm tw:text-zinc-400">Target ACOS (%)</label>
            <Input
              type="number"
              min={0}
              step={0.01}
              value={acosPctInput}
              onChange={(e) => onAcosPctChange(e.target.value)}
              placeholder="e.g. 25"
            />
          </div>
        </div>
        <div className="tw:text-xs tw:text-zinc-400 tw:font-mono">
          Stored: ROAS{" "}
          {parsedTargets.target_roas != null ? parsedTargets.target_roas.toFixed(4) : "—"} · ACOS{" "}
          {parsedTargets.target_acos != null
            ? `${(parsedTargets.target_acos * 100).toFixed(4)}%`
            : "—"}
        </div>
      </div>

      <div className="tw:grid tw:gap-6 sm:tw:grid-cols-2">
        <div className="tw:space-y-2">
          <label className="tw:text-sm tw:text-zinc-400">Main contact name</label>
          <Input value={contactName} onChange={(e) => setContactName(e.target.value)} />
        </div>
        <div className="tw:space-y-2">
          <label className="tw:text-sm tw:text-zinc-400">Main contact email</label>
          <Input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />
        </div>
      </div>

      <div className="tw:flex tw:gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : isNew ? "Create account" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
