# Patodomau's Greenhouse

Private UO Outlands plant catalog.

The app displays the current plant collection by exact graphic ID, not just by
item name. This matters because several plants share the same label while using
different sprites.

## Features

- Discord login through `next-auth`
- allowlist-only access by Discord user ID
- static plant catalog generated from the ClassicUO probe journal
- card grid with sprite, origin, quantity, source label, and graphic ID
- filters by name, label, ID, and origin
- deployable to Vercel without a database

## Roadmap

- Add a plantation-control tab for operational gardening state.
- Use the site as the primary visualization layer for plantation control instead
  of depending on the spreadsheet UI.
- Use the existing Padaria Postgres/Neon infrastructure for persistence when the
  mutable view is added, but keep Greenhouse isolated under the `greenhouse`
  schema or Greenhouse-specific tables.
- Keep unknown plant IDs first-class. New probe rows should be imported even if
  the label, source, or sprite classification is still pending.

## Data

The current catalog was generated from:

- `../WIP/plant-probe-2026-05-17-142127.csv`

Generated files:

- `src/data/plants.ts`
- `public/plant-art/*.png`
- `../WIP/greenhouse-catalog-summary.json`
- `../WIP/greenhouse-catalog-import.json`

To rebuild the catalog from the workspace root:

```bash
python tools\build_greenhouse_catalog.py
```

`greenhouse-catalog-import.json` is the handoff format for the future database
importer. It contains:

- `plantVarieties`: one row per exact graphic ID plus label.
- `inventoryEntries`: one row per observed in-game item serial.
- `unknownVarieties`: anything that still needs classification or sprite work.

## Database

The initial database scaffold lives in:

- `db/greenhouse-schema.sql`

Apply it to the same Postgres/Neon database used by Padaria when persistence is
enabled. It creates a separate `greenhouse` schema with:

- `greenhouse.plant_varieties` for exact graphic ID plus label definitions.
- `greenhouse.plant_inventory_snapshots` for each probe/import run.
- `greenhouse.plant_inventory_entries` for the observed plants in a snapshot.
- `greenhouse.plant_discovery_queue` for new IDs that still need classification.
- `greenhouse.plant_collection_current` for the latest collection view.

## Authentication

The app uses the same Discord allowlist pattern as Padaria do Seu Jorge, but
with its own independent allowlist.

Hardcoded bootstrap IDs live in:

- `src/lib/env.ts`

The Greenhouse bootstrap currently includes only `patodomau`. Additional IDs can
be added with:

- `AUTHORIZED_DISCORD_IDS`

Local mock login can be enabled with:

- `MOCK_AUTH=true`

## Environment

Use `.env.example` as the base.

Required for production:

- `MOCK_AUTH=false`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`

Optional:

- `AUTHORIZED_DISCORD_IDS`

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Deployment

Create a Vercel project for this directory and configure the Discord OAuth
callback:

```text
https://<your-domain>/api/auth/callback/discord
```

Then set the production environment variables listed above and deploy.
