# CineMint 2.0 — Web Preview

This folder contains the new Next.js application being developed alongside the existing V1 static website.

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

This is the Phase 1 UI and application-foundation preview. It includes a premium visual system, shared navigation/footer, homepage, discovery page, sample movie detail pages, comparison placeholder, and MintBot interface preview.

The current catalogue is a small V1-derived sample in `src/data/movies.ts`. It is not the complete 83-movie dataset. Authentication, database access, live AI requests, subscriptions, and personalized recommendations are intentionally not connected yet.

## Environment variables

Copy `.env.example` to `.env.local` only when the relevant backend phase begins. Server credentials must never use the `NEXT_PUBLIC_` prefix or be committed.

## Deployment

Configure Vercel Root Directory as `apps/web`. Keep the existing GitHub Pages project pointed at the repository root until the V2 launch and domain cutover are approved.
