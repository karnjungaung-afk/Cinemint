# CineMint 2.0 — Web Preview

This Next.js application is developed alongside the existing V1 static website. Keep V1 on GitHub Pages until the V2 production cutover is separately reviewed and approved.

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

- Premium Cinema design system and responsive layouts.
- Home, discovery, movie detail, compare, watchlist preview, and MintBot preview.
- All 83 V1 movie records retained in the typed seed dataset.
- Supabase SSR client foundation for browser and server components.
- Next.js 16 `proxy.ts` session refresh using the Supabase cookie adapter.
- Email/password sign-up, sign-in, email-confirmation callback, sign-out, and protected account page.

## Still preview-only

- Watchlist remains browser Local Storage; account sync is not connected.
- MintBot is a UI preview; no messages are sent to an LLM.
- Movie editorial scores and reviews are stored V1 content, not generated live.
- User preferences and watchlist database tables are designed but not provisioned.
- Google/Apple OAuth, subscription billing, payment verification, and personalized recommendations are not connected.

## Supabase setup

Use a **dedicated CineMint Supabase project**. Do not reuse the existing Supabase project for another application.

1. Create or select the isolated CineMint project.
2. Copy `.env.example` to `.env.local`.
3. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `NEXT_PUBLIC_SITE_URL`.
4. In Supabase Auth, configure the Site URL and allowed redirect URL for the local and deployed CineMint origins.
5. Apply a reviewed CineMint schema migration only to that isolated project.

The app deliberately renders a setup notice and skips session refresh when Supabase environment variables are absent. No service-role/secret key is needed by this phase; do not add one to the browser environment.

## Movie data parity

To verify that the seed file matches V1:

```bash
node ../../scripts/export-legacy-movies.mjs --check
```

To regenerate it after an approved V1 data change:

```bash
node ../../scripts/export-legacy-movies.mjs
```

## Deployment

Configure Vercel Root Directory as `apps/web` when a Preview project is available. Keep the existing GitHub Pages project pointed at the repository root until V2 launch and domain cutover are separately reviewed and approved.
