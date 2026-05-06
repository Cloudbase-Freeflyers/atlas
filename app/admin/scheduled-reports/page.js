"use client";

import { useState } from "react";
import { CalendarClock, Plus, Mail, Trash2, Clock, CheckCircle2, Edit3, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const REPORT_OPTIONS = [
  { value: "kpis",      label: "Overall KPIs Summary" },
  { value: "pnl",       label: "P&L Report" },
  { value: "campaigns", label: "Campaign Performance" },
  { value: "alerts",    label: "Anomaly Alerts Digest" },
  { value: "inventory", label: "Inventory Status" },
  { value: "callouts",  label: "AI Insights Digest" },
];

const FREQ_OPTIONS = [
  { value: "daily",   label: "Daily" },
  { value: "weekly",  label: "Weekly (Mondays)" },
  { value: "monthly", label: "Monthly (1st)" },
];

const DEFAULT_SCHEDULES = [
  { id: 1, name: "Weekly Performance Digest", reports: ["kpis", "campaigns"], frequency: "weekly", recipients: ["team@brand.com"], active: true, lastSent: "2026-04-28" },
  { id: 2, name: "Monthly P&L Summary",      reports: ["pnl"],              frequency: "monthly", recipients: ["cfo@brand.com"],  active: true, lastSent: "2026-04-01" },
];

function ScheduleRow({ schedule, onToggle, onDelete }) {
  const repLabels = schedule.reports.map((r) => REPORT_OPTIONS.find((o) => o.value === r)?.label ?? r);
  const freqLabel = FREQ_OPTIONS.find((f) => f.value === schedule.frequency)?.label ?? schedule.frequency;

  return (
    <div className="tw:flex tw:items-center tw:gap-4 tw:p-4 tw:rounded-xl tw:border tw:border-white/[0.06] tw:bg-white/[0.02] tw:flex-wrap">
      <div className="tw:flex-1 tw:min-w-0">
        <div className="tw:flex tw:items-center tw:gap-2 tw:mb-1">
          <p className="tw:text-sm tw:font-semibold tw:text-white">{schedule.name}</p>
          <span className={`tw:text-[10px] tw:font-semibold tw:px-1.5 tw:py-0.5 tw:rounded ${schedule.active ? "tw:bg-emerald-500/15 tw:text-emerald-400" : "tw:bg-white/5 tw:text-zinc-500"}`}>
            {schedule.active ? "Active" : "Paused"}
          </span>
        </div>
        <div className="tw:flex tw:flex-wrap tw:gap-2 tw:text-xs tw:text-zinc-500">
          <span className="tw:flex tw:items-center tw:gap-1"><Clock size={10} /> {freqLabel}</span>
          <span className="tw:flex tw:items-center tw:gap-1"><Mail size={10} /> {schedule.recipients.join(", ")}</span>
          {schedule.lastSent && <span>Last sent: {schedule.lastSent}</span>}
        </div>
        <div className="tw:flex tw:flex-wrap tw:gap-1 tw:mt-2">
          {repLabels.map((r) => (
            <span key={r} className="tw:text-[10px] tw:bg-white/5 tw:border tw:border-white/[0.07] tw:text-zinc-400 tw:px-2 tw:py-0.5 tw:rounded-full">{r}</span>
          ))}
        </div>
      </div>
      <div className="tw:flex tw:items-center tw:gap-2 tw:shrink-0">
        <button
          onClick={() => onToggle(schedule.id)}
          className={`tw:text-xs tw:px-3 tw:py-1.5 tw:rounded-lg tw:border tw:font-medium tw:transition-colors ${schedule.active ? "tw:border-white/10 tw:text-zinc-400 hover:tw:text-white" : "tw:border-emerald-500/30 tw:text-emerald-400 hover:tw:bg-emerald-500/10"}`}
        >
          {schedule.active ? "Pause" : "Activate"}
        </button>
        <button onClick={() => onDelete(schedule.id)} className="tw:p-1.5 tw:rounded-lg tw:text-zinc-600 hover:tw:text-red-400 hover:tw:bg-red-500/5 tw:transition-colors">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

function NewScheduleForm({ onSave, onCancel }) {
  const [name, setName] = useState("");
  const [reports, setReports] = useState([]);
  const [frequency, setFrequency] = useState("weekly");
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(false);

  const toggleReport = (val) => {
    setReports((prev) => prev.includes(val) ? prev.filter((r) => r !== val) : [...prev, val]);
  };

  const handleSave = () => {
    if (!name || !reports.length || !email) return;
    onSave({ name, reports, frequency, recipients: [email] });
    setSaved(true);
  };

  if (saved) return (
    <div className="tw:flex tw:items-center tw:gap-3 tw:p-5 tw:rounded-2xl tw:border tw:border-emerald-500/20 tw:bg-emerald-500/5">
      <CheckCircle2 size={18} className="tw:text-emerald-400" />
      <p className="tw:text-sm tw:text-emerald-400 tw:font-medium">Schedule created successfully.</p>
    </div>
  );

  return (
    <div className="tw:rounded-2xl tw:border tw:border-cyan-500/20 tw:bg-zinc-900 tw:p-6 tw:space-y-5">
      <div className="tw:flex tw:items-center tw:justify-between">
        <h3 className="tw:text-sm tw:font-semibold tw:text-white">New Scheduled Report</h3>
        <button onClick={onCancel} className="tw:p-1 tw:text-zinc-600 hover:tw:text-white"><X size={14} /></button>
      </div>

      <div className="tw:grid tw:grid-cols-1 sm:tw:grid-cols-2 tw:gap-4">
        <div>
          <label className="tw:block tw:text-xs tw:uppercase tw:tracking-widest tw:text-zinc-600 tw:mb-2">Schedule Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Weekly KPI Digest"
            className="tw:w-full tw:px-3 tw:py-2.5 tw:rounded-xl tw:border tw:border-white/10 tw:bg-black/30 tw:text-white tw:text-sm focus:tw:outline-none focus:tw:border-cyan-500/40 tw:placeholder-zinc-700"
          />
        </div>
        <div>
          <label className="tw:block tw:text-xs tw:uppercase tw:tracking-widest tw:text-zinc-600 tw:mb-2">Recipient Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="team@yourcompany.com"
            className="tw:w-full tw:px-3 tw:py-2.5 tw:rounded-xl tw:border tw:border-white/10 tw:bg-black/30 tw:text-white tw:text-sm focus:tw:outline-none focus:tw:border-cyan-500/40 tw:placeholder-zinc-700"
          />
        </div>
      </div>

      <div>
        <label className="tw:block tw:text-xs tw:uppercase tw:tracking-widest tw:text-zinc-600 tw:mb-2">Frequency</label>
        <div className="tw:flex tw:gap-2">
          {FREQ_OPTIONS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFrequency(f.value)}
              className={`tw:px-4 tw:py-2 tw:rounded-xl tw:text-sm tw:border tw:font-medium tw:transition-colors ${frequency === f.value ? "tw:bg-cyan-500/15 tw:border-cyan-500/30 tw:text-cyan-400" : "tw:border-white/[0.07] tw:text-zinc-500 hover:tw:text-white"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="tw:block tw:text-xs tw:uppercase tw:tracking-widest tw:text-zinc-600 tw:mb-2">Reports to include</label>
        <div className="tw:grid tw:grid-cols-2 sm:tw:grid-cols-3 tw:gap-2">
          {REPORT_OPTIONS.map((r) => {
            const selected = reports.includes(r.value);
            return (
              <button
                key={r.value}
                onClick={() => toggleReport(r.value)}
                className={`tw:text-left tw:px-3 tw:py-2 tw:rounded-xl tw:text-sm tw:border tw:transition-colors ${selected ? "tw:bg-cyan-500/10 tw:border-cyan-500/30 tw:text-cyan-300" : "tw:border-white/[0.06] tw:text-zinc-500 hover:tw:text-white hover:tw:border-white/15"}`}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="tw:flex tw:justify-end tw:gap-3">
        <Button variant="outline" onClick={onCancel} className="tw:text-sm">Cancel</Button>
        <Button
          onClick={handleSave}
          disabled={!name || !reports.length || !email}
          className="tw:bg-cyan-500 tw:text-black hover:tw:bg-cyan-400 tw:font-semibold tw:text-sm"
        >
          Create Schedule
        </Button>
      </div>
    </div>
  );
}

export default function ScheduledReportsPage() {
  const [schedules, setSchedules] = useState(DEFAULT_SCHEDULES);
  const [showForm, setShowForm] = useState(false);

  const toggle = (id) => setSchedules((prev) => prev.map((s) => s.id === id ? { ...s, active: !s.active } : s));
  const del = (id) => setSchedules((prev) => prev.filter((s) => s.id !== id));
  const add = (s) => { setSchedules((prev) => [...prev, { ...s, id: Date.now(), active: true, lastSent: null }]); setShowForm(false); };

  return (
    <div className="tw:max-w-3xl tw:space-y-6">
      {/* Header */}
      <div className="tw:flex tw:items-start tw:justify-between tw:gap-4">
        <div>
          <div className="tw:flex tw:items-center tw:gap-2 tw:mb-1">
            <CalendarClock size={18} className="tw:text-zinc-500" />
            <h2 className="tw:text-xl tw:font-semibold tw:text-white">Scheduled Reports</h2>
          </div>
          <p className="tw:text-zinc-500 tw:text-sm">Configure automated email digests with PDF summaries for your team.</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="tw:gap-2 tw:bg-white/5 tw:border tw:border-white/10 hover:tw:bg-white/10 tw:text-white tw:text-sm tw:shrink-0">
            <Plus size={14} />
            New Schedule
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && <NewScheduleForm onSave={add} onCancel={() => setShowForm(false)} />}

      {/* Schedules list */}
      <div className="tw:space-y-3">
        {schedules.length === 0 ? (
          <div className="tw:text-center tw:py-16 tw:text-zinc-600 tw:text-sm">No schedules yet. Create one above.</div>
        ) : (
          schedules.map((s) => <ScheduleRow key={s.id} schedule={s} onToggle={toggle} onDelete={del} />)
        )}
      </div>

      {/* Info note */}
      <div className="tw:rounded-xl tw:border tw:border-white/[0.05] tw:bg-white/[0.02] tw:p-4 tw:text-xs tw:text-zinc-600 tw:leading-relaxed">
        <strong className="tw:text-zinc-500">Note:</strong> Email delivery requires a transactional email provider (e.g. Resend, SendGrid) configured via <code className="tw:bg-white/5 tw:px-1 tw:rounded">EMAIL_API_KEY</code> in your environment. PDF generation uses server-side rendering.
      </div>
    </div>
  );
}
