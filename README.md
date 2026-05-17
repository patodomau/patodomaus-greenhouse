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

## Data

The current catalog was generated from:

- `../WIP/plant-probe-2026-05-17-142127.csv`

Generated files:

- `src/data/plants.ts`
- `public/plant-art/*.png`

To rebuild the catalog from the workspace root:

```bash
python tools\build_greenhouse_catalog.py
```

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
