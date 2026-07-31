# Che, Speak!

**Stop studying Spanish. Start living Argentina.**

An AI-powered platform for acquiring an authentic Rioplatense (Argentine)
Spanish accent, vocabulary, and cultural fluency — through conversation,
shadowing, pronunciation coaching, and content that stays current.

## Status

Foundation stage: architecture, database schema, API design, and a working
project scaffold are in place. Feature modules (auth, dashboard, practice,
conversation, ...) are implemented one at a time — see
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) §4 for the build order.

## Docs

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — product analysis, system
  architecture, AI provider abstraction, personalization model
- [`docs/API.md`](docs/API.md) — REST API design
- [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) —
  database schema

## Project structure

```
apps/
  web/      React + Vite + TypeScript + Tailwind + shadcn/ui + Framer Motion
  api/      Node + Express + TypeScript
packages/
  shared-types/   Domain types shared by web and api
supabase/
  migrations/     Versioned SQL schema
docs/               Architecture, database, API design
```

## Getting started

Requires Node 20+.

```bash
npm install

cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env

npm run dev:web   # http://localhost:5173
npm run dev:api   # http://localhost:4000
```

Fill in Supabase and AI provider keys in the env files to enable auth, data
persistence, and AI features — the app degrades gracefully (features report
"unavailable" rather than crashing) when a key is missing.

## Scripts

- `npm run build` — build shared-types, api, and web
- `npm run typecheck` — typecheck all workspaces
- `npm run test` — run tests across workspaces
