# Patodomau's Greenhouse

Patodomau's Greenhouse is a private UO Outlands plant catalog. It tracks plants
by exact in-game graphic ID plus label, so plants that share the same name but
use different sprites remain separate.

## Requirements

- Node.js 20 or newer
- npm
- Discord OAuth application for real authentication
- Optional: Postgres-compatible database for runtime catalog reads and imports

The production deployment currently uses Vercel and Neon Postgres, but the app
itself is a standard Next.js application. Without `DATABASE_URL`, it falls back
to the generated static catalog.

## Setup

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

Required local values for real Discord auth:

```env
MOCK_AUTH=false
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace-with-a-long-random-secret
DISCORD_CLIENT_ID=replace-with-discord-client-id
DISCORD_CLIENT_SECRET=replace-with-discord-client-secret
```

For local development without Discord:

```env
MOCK_AUTH=true
NEXTAUTH_SECRET=local-development-secret
```

Optional database value:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
```

## Run

Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

Build for production:

```bash
npm run build
npm run start
```

## Database

Apply the Greenhouse schema:

```bash
npm run db:schema
```

Seed bootstrap Discord users:

```bash
npm run db:seed-users
```

Import the generated catalog payload:

```bash
npm run db:import-catalog
```

Check database counts:

```bash
npm run db:status
```

All database commands require `DATABASE_URL`. The schema is isolated under
`greenhouse.*`. Runtime authentication uses `greenhouse.authorized_users` when
`DATABASE_URL` is configured, with bootstrap users as a local/fallback path.

## Catalog Generation

The app consumes generated static files:

- `src/data/plants.ts`
- `public/plant-art/*.png`

From the workspace root, rebuild them with:

```bash
npm run greenhouse:catalog
```

The generator also writes:

- `../WIP/greenhouse-catalog-summary.json`
- `../WIP/greenhouse-catalog-import.json`

`greenhouse-catalog-import.json` is the database import payload and includes
known varieties, inventory entries, and unknown varieties that need
classification.

## Quality Checks

Format code:

```bash
npm run format
```

Run checks:

```bash
npm run check
```

Install Git hooks with `pre-commit`:

```bash
pipx install pre-commit
pre-commit install
```

The hooks run Black for Python files, plus Prettier, ESLint, and TypeScript
checks before commit.

Prettier uses a 100-character print width. The line-length check enforces a
120-character hard limit for non-generated, non-class-string lines.

## Deployment

Set these environment variables on the hosting provider:

```env
MOCK_AUTH=false
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
NEXTAUTH_URL=https://your-domain.example
NEXTAUTH_SECRET=replace-with-a-long-random-secret
DISCORD_CLIENT_ID=replace-with-discord-client-id
DISCORD_CLIENT_SECRET=replace-with-discord-client-secret
```

Configure the Discord OAuth redirect URL:

```text
https://your-domain.example/api/auth/callback/discord
```

## License

MIT
