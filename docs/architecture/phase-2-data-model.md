# CineMint 2.0 — Phase 2 data model draft

**Status:** design only; not applied to any Supabase project.

## Project boundary

CineMint must use its own Supabase project. The currently connected Supabase project contains another application's profiles, purchases, and subscription data. Do not run CineMint DDL, grants, policies, or seed operations against that project.

## Proposed tables

### `profiles`

- `user_id uuid primary key references auth.users(id) on delete cascade`
- `display_name text not null default ''` (2–60 characters)
- `avatar_url text null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### `user_preferences`

- `user_id uuid primary key references auth.users(id) on delete cascade`
- `preferred_genres text[] not null default '{}'`
- `favorite_moods text[] not null default '{}'`
- `preferred_language text not null default 'th'` (allow `th` and `en`)
- `onboarding_completed boolean not null default false`
- `updated_at timestamptz not null default now()`

### `watchlist`

- `user_id uuid references auth.users(id) on delete cascade`
- `movie_slug text not null` (references the stable slug in the V2 seed catalogue at application level)
- `status text not null default 'want_to_watch'` (allow `want_to_watch` and `watched`)
- `personal_note text null` (maximum 500 characters)
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- Composite primary key: `(user_id, movie_slug)`

The catalogue remains static/read-only for this phase. User-specific rows must not become a source of truth for film descriptions, ratings, or editorial scores.

## Required Row Level Security

Enable RLS on every table. Grant table access to the `authenticated` role only. Each policy must include the row owner:

- SELECT: `(select auth.uid()) = user_id`
- INSERT: `with check ((select auth.uid()) = user_id)`
- UPDATE: both `using ((select auth.uid()) = user_id)` and `with check ((select auth.uid()) = user_id)`
- DELETE: `using ((select auth.uid()) = user_id)`

Do not use `user_metadata` or editable profile fields as an authorization source. Do not create public `SECURITY DEFINER` functions for ordinary profile or watchlist CRUD.

## Migration procedure

When a dedicated CineMint Supabase project is ready:

1. Confirm its project reference and environment are CineMint-only.
2. Use the Supabase CLI to create a named migration.
3. Add the approved DDL and policies to that generated migration.
4. Apply it to the CineMint development database, inspect table definitions, and run security advisors.
5. Verify cross-user access is denied before considering production deployment.

This document is a reviewed design draft, not an executable migration.
