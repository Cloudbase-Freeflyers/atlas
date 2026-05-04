# Admin client accounts — local store and database handoff

## What this is

The **Admin → Client accounts** UI stores one record per client (account name, assigned managers, strategy summary, brand manifest, monthly budgets, ROAS/ACOS targets, main contact). It is intended for internal admins only (`user.role === 'admin'`), using the same login as the rest of Atlas.

## Local development (no shared database)

1. Run the Next app as usual (`npm run dev`). Log in as an admin user.
2. Open **Admin → Clients**. The app creates **`data/clients.json`** automatically on first save (the `data/` directory is listed in `.gitignore`).
3. Optional: set **`CLIENTS_DATA_PATH`** in `.env` to an absolute path if you want the file elsewhere (see `.env.example`).

## Files involved

| Piece | Location |
|--------|-----------|
| File store read/write | [`app/lib/clientsStore.js`](../../app/lib/clientsStore.js) |
| Server actions (admin check + CRUD) | [`app/lib/clientActions.js`](../../app/lib/clientActions.js) |
| UI | [`app/components/admin/ReportAdminClients.js`](../../app/components/admin/ReportAdminClients.js), [`ClientForm.js`](../../app/components/admin/ClientForm.js), etc. |
| Routes | `app/admin/clients/…` |

## Handoff: provision PostgreSQL (or compatible SQL)

1. Create a database and a role with least privilege (SELECT/INSERT/UPDATE/DELETE on the new tables).
2. Run the DDL in **[`admin-clients-schema.sql`](./admin-clients-schema.sql)** against that database.
3. Implement a small data layer (e.g. `pg` in Node or your API) that exposes the same fields as the JSON document:
   - One row per client in `clients`.
   - One row per client/month in `client_monthly_budgets` (`UNIQUE (client_id, month)`).
4. Replace the implementation inside [`clientsStore.js`](../../app/lib/clientsStore.js) (or swap `clientActions` to call your API) while keeping the **same object shape** the UI expects (see `normalizeClient` in `clientsStore.js`).

## Backup and migration

- **Before cutover:** copy `data/clients.json` from each environment that used the file store.
- Write a one-off script to INSERT into `clients` / `client_monthly_budgets` from that JSON, or import via your ORM.

## Security notes

- Do not commit `.env` or production `CLIENTS_DATA_PATH`.
- The file store is only safe if the **server** enforces admin checks (see `assertAdmin` in `clientActions.js`) and the host filesystem is trusted.
