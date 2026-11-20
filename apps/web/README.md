# CineMint 2.0 — Web Preview

This folder contains the new Next.js application developed alongside the existing V1 static website.

## Requirements

- Node.js 20.9 or newer
- npm

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Useful scripts

```bash
npm run lint
npm run typecheck
npm run build
npm run start
```

## Current scope

This is the Phase 1 UI and application-foundation preview. It includes:

- Premium Cinema design tokens and responsive layout
- Shared navigation, footer, film cards, and reusable film rows
- Homepage and discovery page with local title/story search and genre filters
- Dynamic movie detail routes generated from the migrated catalogue
- Side-by-side comparison preview
- Browser-only watchlist preview
- MintBot interface preview (not connected to an LLM)

The V1 movie catalogue has been migrated as a typed seed dataset containing all 83 movie records. The full original record is retained in `src/data/movies.seed.json`; `src/data/movies.ts` maps it into the V2 UI model.

To verify that the seed file matches V1:

```bash
node ../../scripts/export-legacy-movies.mjs --check
```

To regenerate it after an approved V1 data change:

```bash
node ../../scripts/export-legacy-movies.mjs
```

## Preview-only behavior

- Search and genre filters run locally against the seed dataset.
- Watchlist entries are stored in this browser's Local Storage. They are not linked to an account and do not sync between devices.
- Compare uses the scores stored in V1. It is not a personal recommendation.
- MintBot is a static UI preview. Messages are not sent to an AI service and no chat history is collected here.
- Authentication, Supabase, live LLM requests, subscription billing, and server-side recommendation logic are not connected yet.

## Environment variables

Copy `.env.example` to `.env.local` only when the relevant backend phase begins. Server credentials must never use the `NEXT_PUBLIC_` prefix or be committed.

## Deployment

Configure Vercel Root Directory as `apps/web` when a Preview project is available. Keep the existing GitHub Pages project pointed at the repository root until V2 launch and domain cutover are separately reviewed and approved.
