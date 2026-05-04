-- Canonical schema for client accounts (PostgreSQL-oriented).
-- Adjust types/names for your environment. Local dev currently uses data/clients.json.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  -- Optional FK to your app user table (e.g. users.id); add when both live in this DB.
  brand_manager_user_id INTEGER,
  advertising_manager_user_id INTEGER,
  strategy_summary TEXT NOT NULL DEFAULT '',
  brand_manifest TEXT NOT NULL DEFAULT '',
  target_roas DOUBLE PRECISION,
  target_acos DOUBLE PRECISION,
  contact_name TEXT NOT NULL DEFAULT '',
  contact_email TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- If your users table is not named "users" or uses BIGINT ids, drop FKs above and use plain INTEGER/BIGINT without REFERENCES.

CREATE TABLE IF NOT EXISTS client_monthly_budgets (
  id BIGSERIAL PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients (id) ON DELETE CASCADE,
  month CHAR(7) NOT NULL, -- YYYY-MM
  amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  UNIQUE (client_id, month)
);

CREATE INDEX IF NOT EXISTS idx_client_monthly_budgets_client ON client_monthly_budgets (client_id);
CREATE INDEX IF NOT EXISTS idx_clients_brand_manager ON clients (brand_manager_user_id);
CREATE INDEX IF NOT EXISTS idx_clients_ads_manager ON clients (advertising_manager_user_id);

COMMENT ON TABLE clients IS 'Admin-managed client / account records for Atlas UI';
COMMENT ON COLUMN clients.target_roas IS 'Sales / ad spend';
COMMENT ON COLUMN clients.target_acos IS 'Ad spend / sales (decimal, e.g. 0.25 = 25%)';
