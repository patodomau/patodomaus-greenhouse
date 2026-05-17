# Patodomau's Greenhouse Instructions

This is a Next.js app for a private UO Outlands plant catalog.

- Keep auth aligned with the Discord allowlist pattern in `src/lib/auth.ts` and `src/lib/env.ts`.
- Keep catalog data generated from the workspace CSV with `python ..\tools\build_greenhouse_catalog.py` from the workspace root.
- Do not commit `.env*`, `.next`, `node_modules`, Vercel metadata, private journals, or ClassicUO logs.
- Treat plant identity as `graphic ID + label`; do not merge cards only by name.
