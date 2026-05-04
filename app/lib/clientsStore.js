/**
 * Local file-backed store for admin client accounts (no remote DB required).
 * See docs/handoff/admin-clients.md for migrating to Postgres.
 */

import { existsSync } from "fs";
import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

function dataFilePath() {
  const override = process.env.CLIENTS_DATA_PATH;
  if (override) return path.resolve(override);
  return path.join(process.cwd(), "data", "clients.json");
}

/** @returns {Promise<{ clients: object[] }>} */
async function readRaw() {
  const file = dataFilePath();
  if (!existsSync(file)) {
    return { clients: [] };
  }
  const raw = await fs.readFile(file, "utf8");
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.clients)) {
      return { clients: [] };
    }
    return parsed;
  } catch {
    return { clients: [] };
  }
}

async function writeRaw(db) {
  const file = dataFilePath();
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(db, null, 2), "utf8");
  await fs.rename(tmp, file);
}

export function normalizeClient(row) {
  if (!row || typeof row !== "object") return null;
  return {
    id: String(row.id),
    name: row.name ?? "",
    brand_manager_user_id:
      row.brand_manager_user_id === null || row.brand_manager_user_id === undefined
        ? null
        : Number(row.brand_manager_user_id),
    advertising_manager_user_id:
      row.advertising_manager_user_id === null ||
      row.advertising_manager_user_id === undefined
        ? null
        : Number(row.advertising_manager_user_id),
    strategy_summary: row.strategy_summary ?? "",
    brand_manifest: row.brand_manifest ?? "",
    monthly_budgets: Array.isArray(row.monthly_budgets)
      ? row.monthly_budgets.map((b) => ({
          month: String(b.month),
          amount: Number(b.amount) || 0,
        }))
      : [],
    target_roas:
      row.target_roas === null || row.target_roas === undefined
        ? null
        : Number(row.target_roas),
    target_acos:
      row.target_acos === null || row.target_acos === undefined
        ? null
        : Number(row.target_acos),
    contact_name: row.contact_name ?? "",
    contact_email: row.contact_email ?? "",
    created_at: row.created_at ?? new Date().toISOString(),
    updated_at: row.updated_at ?? new Date().toISOString(),
  };
}

export async function listClients() {
  const db = await readRaw();
  return db.clients.map(normalizeClient).filter(Boolean);
}

export async function getClient(id) {
  if (!id) return null;
  const db = await readRaw();
  const row = db.clients.find((c) => String(c.id) === String(id));
  return normalizeClient(row);
}

export async function createClient(payload) {
  const db = await readRaw();
  const now = new Date().toISOString();
  const id = randomUUID();
  const row = normalizeClient({
    ...payload,
    id,
    created_at: now,
    updated_at: now,
  });
  db.clients.push(row);
  await writeRaw(db);
  return row;
}

export async function updateClient(id, payload) {
  const db = await readRaw();
  const idx = db.clients.findIndex((c) => String(c.id) === String(id));
  if (idx === -1) return null;
  const prev = normalizeClient(db.clients[idx]);
  const now = new Date().toISOString();
  const next = normalizeClient({
    ...prev,
    ...payload,
    id: prev.id,
    created_at: prev.created_at,
    updated_at: now,
  });
  db.clients[idx] = next;
  await writeRaw(db);
  return next;
}

export async function deleteClient(id) {
  const db = await readRaw();
  const before = db.clients.length;
  db.clients = db.clients.filter((c) => String(c.id) !== String(id));
  if (db.clients.length === before) return false;
  await writeRaw(db);
  return true;
}
