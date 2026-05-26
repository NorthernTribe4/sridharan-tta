# Sridharan Table Tennis Academy — Implementation Plan

> **For the executing agent (Sonnet 4.6):** This document is the single source of truth for the build. Follow it in order. If something is ambiguous, re-read the relevant section before improvising. The execution checklist in §10 is the granular, step-by-step build order.

---

## 1. Executive Summary

A 4-page Next.js 15 (App Router, TypeScript strict) site for Sridharan Table Tennis Academy in Chennai, deployed on Vercel with Supabase (Postgres + Auth). Public pages: `/` (intro + TT educational content), `/team` (cards grouped Founder → Manager → Coaches → Players), `/matches` (results, newest-first, grouped by month, filterable). Protected: `/admin/scores` (coach login + dynamic match entry; player picks are id-bound dropdowns, never free text).

Data model: `team_members`, `matches`, `match_sets`, `authorized_scorers`. Winner is computed server-side via a Postgres function `compute_match_winner` invoked by an AFTER trigger on `match_sets`, so the client cannot lie about results. RLS allows public SELECT on the three content tables and restricts writes to authenticated users present in `authorized_scorers`. Auth is two-gate: middleware redirects unauthenticated `/admin/*` traffic; the score-entry page re-checks `authorized_scorers` membership server-side.

UI uses Tailwind + shadcn/ui with a sport-energetic palette (deep navy + tournament red + chalk white) if no Figma file is supplied; otherwise the next agent imports via Figma MCP using `/figma-use`. Mobile-first because coaches enter scores courtside on phones.

---

## 2. Final Database Schema — `supabase/migrations/0001_init.sql`

Create the file at `supabase/migrations/0001_init.sql` with **exactly** this content:

```sql
-- =========================================================================
-- Sridharan Table Tennis Academy — initial schema
-- Run via: supabase db push   (or paste into SQL editor)
-- =========================================================================

create extension if not exists "pgcrypto";

-- -------------------------------------------------------------------------
-- Enums
-- -------------------------------------------------------------------------
do $$ begin
  create type team_role as enum ('founder', 'manager', 'coach', 'player');
exception when duplicate_object then null; end $$;

-- -------------------------------------------------------------------------
-- team_members
-- -------------------------------------------------------------------------
create table if not exists public.team_members (
  id              uuid primary key default gen_random_uuid(),
  full_name       text not null,
  role            team_role not null,
  bio             text not null default '',
  achievements    text[] not null default '{}',
  photo_url       text,
  display_order   int  not null default 0,
  -- disambiguator surfaced in dropdowns when two members share full_name
  short_label     text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists team_members_role_idx
  on public.team_members(role, display_order);

-- -------------------------------------------------------------------------
-- authorized_scorers  (whitelist of auth users allowed to write match data)
-- -------------------------------------------------------------------------
create table if not exists public.authorized_scorers (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  added_at    timestamptz not null default now(),
  note        text
);

-- -------------------------------------------------------------------------
-- matches
-- -------------------------------------------------------------------------
create table if not exists public.matches (
  id              uuid primary key default gen_random_uuid(),
  match_date      date not null,
  player1_id      uuid not null references public.team_members(id) on delete restrict,
  player2_id      uuid not null references public.team_members(id) on delete restrict,
  best_of         int  not null check (best_of in (3,5,7)),
  winner_id       uuid references public.team_members(id) on delete restrict,
  created_by      uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint matches_distinct_players check (player1_id <> player2_id),
  constraint matches_winner_is_a_player
    check (winner_id is null or winner_id in (player1_id, player2_id))
);

create index if not exists matches_match_date_idx     on public.matches(match_date desc);
create index if not exists matches_player1_idx        on public.matches(player1_id);
create index if not exists matches_player2_idx        on public.matches(player2_id);
create index if not exists matches_year_month_idx
  on public.matches(date_trunc('month', match_date));

-- -------------------------------------------------------------------------
-- match_sets
-- -------------------------------------------------------------------------
create table if not exists public.match_sets (
  id              uuid primary key default gen_random_uuid(),
  match_id        uuid not null references public.matches(id) on delete cascade,
  set_number      int  not null check (set_number between 1 and 7),
  player1_score   int  not null check (player1_score >= 0 and player1_score <= 30),
  player2_score   int  not null check (player2_score >= 0 and player2_score <= 30),
  created_at      timestamptz not null default now(),
  unique (match_id, set_number),
  -- A set must have a clear winner: not a tie, and at least one side at 11+
  -- with a 2-point lead (modern rules). Allow deuce up to 30.
  constraint match_sets_valid_score check (
    player1_score <> player2_score
    and (
      (player1_score >= 11 and player1_score - player2_score >= 2)
      or
      (player2_score >= 11 and player2_score - player1_score >= 2)
    )
  )
);

create index if not exists match_sets_match_id_idx on public.match_sets(match_id, set_number);

-- -------------------------------------------------------------------------
-- updated_at trigger helper
-- -------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists trg_team_members_updated_at on public.team_members;
create trigger trg_team_members_updated_at
before update on public.team_members
for each row execute function public.set_updated_at();

drop trigger if exists trg_matches_updated_at on public.matches;
create trigger trg_matches_updated_at
before update on public.matches
for each row execute function public.set_updated_at();

-- -------------------------------------------------------------------------
-- compute_match_winner(match_id)
-- Returns the team_members.id of whichever player won the majority of sets,
-- or NULL if the match is incomplete (sets entered < ceil(best_of/2)+...)
-- or if neither player has yet reached the win threshold.
-- -------------------------------------------------------------------------
create or replace function public.compute_match_winner(p_match_id uuid)
returns uuid
language plpgsql
stable
as $$
declare
  v_p1            uuid;
  v_p2            uuid;
  v_best_of       int;
  v_threshold     int;
  v_p1_sets       int;
  v_p2_sets       int;
begin
  select player1_id, player2_id, best_of
    into v_p1, v_p2, v_best_of
  from public.matches
  where id = p_match_id;

  if not found then
    return null;
  end if;

  v_threshold := (v_best_of / 2) + 1;  -- 2 for bo3, 3 for bo5, 4 for bo7

  select
    count(*) filter (where player1_score > player2_score),
    count(*) filter (where player2_score > player1_score)
    into v_p1_sets, v_p2_sets
  from public.match_sets
  where match_id = p_match_id;

  if v_p1_sets >= v_threshold and v_p1_sets > v_p2_sets then
    return v_p1;
  elsif v_p2_sets >= v_threshold and v_p2_sets > v_p1_sets then
    return v_p2;
  else
    return null;
  end if;
end $$;

-- -------------------------------------------------------------------------
-- Trigger: recompute matches.winner_id whenever match_sets change
-- -------------------------------------------------------------------------
create or replace function public.refresh_match_winner()
returns trigger
language plpgsql
as $$
declare
  v_match_id uuid;
begin
  v_match_id := coalesce(new.match_id, old.match_id);
  update public.matches
     set winner_id = public.compute_match_winner(v_match_id),
         updated_at = now()
   where id = v_match_id;
  return null;  -- AFTER trigger, return value ignored
end $$;

drop trigger if exists trg_match_sets_refresh_winner on public.match_sets;
create trigger trg_match_sets_refresh_winner
after insert or update or delete on public.match_sets
for each row execute function public.refresh_match_winner();

-- -------------------------------------------------------------------------
-- Helper: is_authorized_scorer()
-- -------------------------------------------------------------------------
create or replace function public.is_authorized_scorer()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.authorized_scorers
    where user_id = auth.uid()
  );
$$;

grant execute on function public.is_authorized_scorer() to anon, authenticated;

-- =========================================================================
-- Row Level Security
-- =========================================================================
alter table public.team_members        enable row level security;
alter table public.matches             enable row level security;
alter table public.match_sets          enable row level security;
alter table public.authorized_scorers  enable row level security;

-- team_members ------------------------------------------------------------
drop policy if exists team_members_select_public on public.team_members;
create policy team_members_select_public
  on public.team_members for select
  using (true);

drop policy if exists team_members_write_scorers on public.team_members;
create policy team_members_write_scorers
  on public.team_members for all
  to authenticated
  using (public.is_authorized_scorer())
  with check (public.is_authorized_scorer());

-- matches ------------------------------------------------------------------
drop policy if exists matches_select_public on public.matches;
create policy matches_select_public
  on public.matches for select
  using (true);

drop policy if exists matches_write_scorers on public.matches;
create policy matches_write_scorers
  on public.matches for all
  to authenticated
  using (public.is_authorized_scorer())
  with check (public.is_authorized_scorer());

-- match_sets ---------------------------------------------------------------
drop policy if exists match_sets_select_public on public.match_sets;
create policy match_sets_select_public
  on public.match_sets for select
  using (true);

drop policy if exists match_sets_write_scorers on public.match_sets;
create policy match_sets_write_scorers
  on public.match_sets for all
  to authenticated
  using (public.is_authorized_scorer())
  with check (public.is_authorized_scorer());

-- authorized_scorers -------------------------------------------------------
-- Only the row's own user can SELECT their row (so a coach can check status).
-- Writes are denied to everyone via RLS — service_role bypasses RLS, so the
-- Supabase dashboard / a server function with service key handles inserts.
drop policy if exists authorized_scorers_select_self on public.authorized_scorers;
create policy authorized_scorers_select_self
  on public.authorized_scorers for select
  to authenticated
  using (user_id = auth.uid());

-- No INSERT/UPDATE/DELETE policies => RLS denies them for anon/authenticated.

-- =========================================================================
-- Seed data
-- =========================================================================
insert into public.team_members (full_name, role, bio, achievements, display_order, short_label) values
  (
    'Sridharan',
    'founder',
    'Founder of Sridharan Table Tennis Academy. A lifelong table tennis enthusiast based in Chennai, Sridharan started the academy to give young players in Tamil Nadu access to structured, world-class coaching close to home.',
    array['Founded the academy in Chennai','25+ years in competitive and grassroots table tennis','Mentored multiple state-level junior players'],
    1,
    'Founder'
  ),
  (
    'Manager 1',
    'manager',
    'Operations and academy manager. Handles scheduling, tournament entries, player onboarding, and day-to-day running of the academy floor.',
    array['10+ years of sports academy administration','Manages a roster of 40+ active trainees'],
    1,
    'Manager'
  ),
  (
    'Coach 1',
    'coach',
    'Head coach focused on technique fundamentals for beginners and intermediates. Specialises in footwork drills and serve variation.',
    array['National-level player','Coached the academy''s U-13 batch to two district medals'],
    1,
    'Head Coach'
  ),
  (
    'Coach 2',
    'coach',
    'Assistant coach for the advanced batch. Focus areas: spin reading, third-ball attack, and match-play strategy.',
    array['State-ranked open singles player','TTFI Level-2 certified'],
    2,
    'Asst. Coach'
  ),
  (
    'Coach 3',
    'coach',
    'Junior development coach. Works with new joinees aged 6–10 on grip, stance, and bat-ball coordination.',
    array['Former state junior champion','Specialist in early-childhood TT pedagogy'],
    3,
    'Junior Coach'
  ),
  (
    'Player 1', 'player',
    'Top of the academy''s advanced batch. Aggressive looper with a strong forehand.',
    array['District U-17 silver','Academy ranking #1 — 2026 season'],
    1, 'U-17 Boys'
  ),
  (
    'Player 2', 'player',
    'Steady defender known for long rallies and tactical patience.',
    array['District U-15 bronze','Won the academy''s 2025 inter-batch league'],
    2, 'U-15 Boys'
  ),
  (
    'Player 3', 'player',
    'Two-handed backhand specialist. Improved fastest on the ladder this year.',
    array['Most-improved player 2025','Runner-up academy U-13 championship'],
    3, 'U-13 Boys'
  ),
  (
    'Player 4', 'player',
    'Newest member of the advanced batch. Strong serve-and-attack pattern.',
    array['Promoted to advanced batch in 2026','Academy doubles champion 2025'],
    4, 'U-17 Girls'
  ),
  (
    'Player 5', 'player',
    'Junior batch standout. Excellent placement and footwork.',
    array['District U-11 quarter-finalist','Academy ladder top-10'],
    5, 'U-11 Boys'
  ),
  (
    'Player 6', 'player',
    'All-rounder with consistent results across the season''s monthly ladders.',
    array['Three monthly-ladder wins in 2025','Selected for state U-15 trials'],
    6, 'U-15 Girls'
  );
```

> Note on RLS: writes to `authorized_scorers` happen via the Supabase dashboard (service_role bypasses RLS). The owner of the project manually inserts a coach's `auth.users.id` there after signup.

---

## 3. TypeScript Type Definitions — `lib/types.ts`

```ts
export type TeamRole = 'founder' | 'manager' | 'coach' | 'player';

export interface TeamMember {
  id: string;                 // uuid
  full_name: string;
  role: TeamRole;
  bio: string;
  achievements: string[];
  photo_url: string | null;
  display_order: number;
  short_label: string | null; // disambiguator surfaced in dropdowns
  created_at: string;         // ISO
  updated_at: string;
}

export interface MatchSet {
  id: string;
  match_id: string;
  set_number: number;         // 1..7
  player1_score: number;
  player2_score: number;
  created_at: string;
}

export interface Match {
  id: string;
  match_date: string;         // YYYY-MM-DD
  player1_id: string;
  player2_id: string;
  best_of: 3 | 5 | 7;
  winner_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// Joined/derived shapes used by the UI ------------------------------------

export interface MatchWithSets extends Match {
  sets: MatchSet[];
  player1: Pick<TeamMember, 'id' | 'full_name' | 'short_label' | 'photo_url'>;
  player2: Pick<TeamMember, 'id' | 'full_name' | 'short_label' | 'photo_url'>;
  winner: Pick<TeamMember, 'id' | 'full_name'> | null;
}

export interface ScoreEntryFormValues {
  match_date: string;
  player1_id: string;
  player2_id: string;
  best_of: 3 | 5 | 7;
  sets: Array<{ player1_score: number; player2_score: number }>;
}

export interface AuthorizedScorer {
  user_id: string;
  added_at: string;
  note: string | null;
}

// Grouping helpers --------------------------------------------------------

export interface MatchesByMonth {
  monthLabel: string;         // "March 2026"
  monthKey: string;           // "2026-03"
  matches: MatchWithSets[];
}

export interface TeamByRole {
  founders: TeamMember[];
  managers: TeamMember[];
  coaches: TeamMember[];
  players: TeamMember[];
}
```

---

## 4. File Tree

```
sridharan-tta/
├─ app/
│  ├─ layout.tsx                     # Root layout: fonts, Tailwind globals, <SiteHeader/><SiteFooter/>
│  ├─ globals.css                    # Tailwind base + CSS vars for theme
│  ├─ page.tsx                       # / — Home (server component)
│  ├─ sitemap.ts                     # SEO sitemap
│  ├─ robots.ts                      # robots.txt
│  ├─ opengraph-image.tsx            # OG image generator
│  ├─ team/
│  │  └─ page.tsx                    # /team — server component, fetches team_members
│  ├─ matches/
│  │  └─ page.tsx                    # /matches — server component w/ search params for filters
│  └─ admin/
│     ├─ layout.tsx                  # Admin shell + auth boundary
│     ├─ login/
│     │  └─ page.tsx                 # /admin/login — client form, uses supabase-js browser client
│     ├─ logout/
│     │  └─ route.ts                 # POST -> sign out + redirect
│     └─ scores/
│        ├─ page.tsx                 # /admin/scores — server component, runs is_authorized_scorer gate
│        ├─ score-entry-form.tsx     # 'use client' — dynamic set inputs, react-hook-form + zod
│        ├─ player-combobox.tsx      # 'use client' — searchable shadcn Combobox
│        └─ actions.ts               # 'use server' — submitMatch() server action
├─ components/
│  ├─ ui/                            # shadcn primitives (button, input, dialog, combobox, etc.)
│  │  ├─ button.tsx
│  │  ├─ input.tsx
│  │  ├─ label.tsx
│  │  ├─ card.tsx
│  │  ├─ select.tsx
│  │  ├─ command.tsx
│  │  ├─ popover.tsx
│  │  ├─ dialog.tsx
│  │  ├─ form.tsx
│  │  ├─ table.tsx
│  │  ├─ badge.tsx
│  │  ├─ separator.tsx
│  │  ├─ toast.tsx / sonner.tsx
│  │  └─ skeleton.tsx
│  ├─ site/
│  │  ├─ site-header.tsx             # Top nav (Home, Team, Matches, Admin)
│  │  ├─ site-footer.tsx
│  │  ├─ hero.tsx                    # Home hero section
│  │  ├─ section.tsx                 # Layout wrapper w/ consistent padding
│  │  └─ logo.tsx
│  ├─ home/
│  │  ├─ founder-vision.tsx
│  │  ├─ location-block.tsx          # Chennai location, optional embedded map
│  │  ├─ tt-history.tsx
│  │  ├─ tt-benefits.tsx
│  │  └─ what-to-expect.tsx
│  ├─ team/
│  │  ├─ team-section.tsx            # Section header per role + grid of cards
│  │  └─ team-card.tsx               # photo, name, role, bio, achievements
│  └─ matches/
│     ├─ matches-filter-bar.tsx      # 'use client' — month/year + player filter
│     ├─ matches-month-group.tsx
│     ├─ match-row.tsx               # date, players, sets, winner highlighted
│     └─ set-score-pill.tsx
├─ lib/
│  ├─ types.ts                       # Domain types (above)
│  ├─ env.ts                         # Zod-validated env reader
│  ├─ utils.ts                       # cn(), formatDate(), etc.
│  ├─ tt-rules.ts                    # isValidSetScore(), winnerOfSet(), matchWinnerFromSets()
│  ├─ groupMatchesByMonth.ts
│  └─ supabase/
│     ├─ server.ts                   # createServerClient (cookies from next/headers)
│     ├─ browser.ts                  # createBrowserClient
│     ├─ middleware.ts               # createMiddlewareClient + session refresh helper
│     └─ admin.ts                    # service_role client (server-only, used by seed scripts)
├─ middleware.ts                     # Next.js middleware — gates /admin/*
├─ supabase/
│  ├─ migrations/
│  │  └─ 0001_init.sql               # The migration in §2
│  └─ config.toml                    # Supabase CLI project config
├─ public/
│  ├─ favicon.ico
│  ├─ og-default.png
│  └─ players/                       # Optional uploaded photos (or use Supabase Storage)
├─ scripts/
│  └─ seed.ts                        # Optional: programmatic re-seed (uses service_role)
├─ .env.example
├─ .env.local                        # gitignored
├─ next.config.ts
├─ tailwind.config.ts
├─ postcss.config.mjs
├─ components.json                   # shadcn config
├─ tsconfig.json                     # strict: true
├─ eslint.config.mjs
├─ package.json
├─ README.md
└─ .gitignore
```

---

## 5. Page-by-Page Component Plan

### `/` — Home (`app/page.tsx`, server component)
No data fetching required. All static prose. Optionally fetch the founder row to populate `FounderVision`.

| Component | Type | Props | Purpose |
|---|---|---|---|
| `Hero` | Server | `{ headline, sub, ctaHref }` | Big intro, photo background, "Visit / Join" CTAs |
| `FounderVision` | Server | `{ founder: TeamMember }` (optional, fetched server-side) | Sridharan's vision quote + portrait |
| `LocationBlock` | Server | `{ address, mapEmbedUrl }` | Chennai address, optional embedded map iframe |
| `TtHistory` | Server | none | Prose: origins of table tennis, growth in India |
| `TtBenefits` | Server | none | Health + cognitive benefits, 3-col grid |
| `WhatToExpect` | Server | none | Training schedule, age groups, what parents should know |

### `/team` — Team directory (`app/team/page.tsx`, server component)
Fetches all `team_members` ordered by role then `display_order`.

| Component | Type | Props | Purpose |
|---|---|---|---|
| `TeamSection` | Server | `{ title: string; members: TeamMember[] }` | Renders one role group with header |
| `TeamCard` | Server | `{ member: TeamMember }` | Photo, name, role label (`short_label` if set), bio, achievements bullet list |
| `EmptyState` | Server | `{ message }` | Shown when DB has no members |

Render order enforced in page: Founder → Manager → Coaches → Players.

### `/admin/login` (`app/admin/login/page.tsx`, client)
| Component | Type | Props | Purpose |
|---|---|---|---|
| `LoginForm` | Client (`'use client'`) | none | Email/password form → `supabase.auth.signInWithPassword`. **Reason for `'use client'`:** needs browser-side supabase client + onSubmit handler. |

### `/admin/scores` — Score entry (`app/admin/scores/page.tsx`, server)
Server component runs gate: get session, call `is_authorized_scorer()`. If false, render `<NotAuthorized/>`. Else render `<ScoreEntryForm/>` and pass `players` (server-fetched).

| Component | Type | Props | Purpose |
|---|---|---|---|
| `ScoreEntryForm` | Client | `{ players: TeamMember[] }` | RHF + zod. Dynamic set-row inputs based on `best_of`. Submits via server action. **Reason:** form state, dynamic inputs, optimistic UI. |
| `PlayerCombobox` | Client | `{ players: TeamMember[]; value: string; onChange(id): void; excludeId?: string }` | shadcn Command-in-Popover. Disambiguates duplicate names with `short_label`. Excludes the other player. **Reason:** keyboard nav, controlled state. |
| `SetRow` | Client | `{ index, control, disabled? }` | One row of two number inputs. |
| `ScoreEntryResult` | Client | `{ status, computedWinnerName? }` | Toast/inline success or failure. |
| `NotAuthorized` | Server | `{ email }` | Static "Your account is not authorized to enter scores. Contact admin." |

**Server action `submitMatch(values)` in `actions.ts` flow:**
1. Re-validates Zod schema.
2. Re-checks `is_authorized_scorer()`.
3. Inserts `matches` row (without `winner_id`).
4. Inserts N `match_sets` rows.
5. Trigger fires → `winner_id` filled.
6. Re-reads the match, returns `MatchWithSets` to client for confirmation.
7. `revalidatePath('/matches')`.

### `/matches` — Public results (`app/matches/page.tsx`, server)
Fetches matches joined with sets + both players, applies filters from `searchParams`.

| Component | Type | Props | Purpose |
|---|---|---|---|
| `MatchesFilterBar` | Client | `{ players: TeamMember[]; initial: { month?, year?, playerId? } }` | Controls update URL via `router.push`. **Reason:** interactive selects. |
| `MatchesMonthGroup` | Server | `{ group: MatchesByMonth }` | Header "March 2026" + list of `MatchRow` |
| `MatchRow` | Server | `{ match: MatchWithSets }` | Date, both players, set-by-set, winner highlighted |
| `SetScorePill` | Server | `{ p1: number; p2: number; winnerSide: 1 \| 2 }` | One badge like `11–7` with winner side bolded |
| `EmptyState` | Server | `{ message }` | Shown when no matches match filters |

---

## 6. Auth & RLS Flow

```
                      ┌────────────────────────────────────────┐
                      │            Browser request             │
                      └──────────────────┬─────────────────────┘
                                         │
                                         ▼
                      ┌────────────────────────────────────────┐
                      │  middleware.ts  (every request)        │
                      │  - refresh Supabase session via        │
                      │    lib/supabase/middleware.ts          │
                      │  - if path starts with /admin/         │
                      │      and no user -> redirect           │
                      │      to /admin/login                   │
                      └──────────────────┬─────────────────────┘
                                         │
            (authenticated user, /admin/scores requested)
                                         ▼
                ┌────────────────────────────────────────────────┐
                │ app/admin/scores/page.tsx  (Server Component)  │
                │  1. createServerClient (lib/supabase/server)   │
                │  2. await supabase.auth.getUser()              │
                │  3. await supabase.rpc('is_authorized_scorer') │
                │     - if false → render <NotAuthorized/>       │
                │     - if true  → render <ScoreEntryForm/>      │
                └──────────────────┬─────────────────────────────┘
                                   │ form submit
                                   ▼
                ┌────────────────────────────────────────────────┐
                │ app/admin/scores/actions.ts   'use server'     │
                │  submitMatch():                                │
                │   - zod validate                               │
                │   - re-check is_authorized_scorer (defense    │
                │     in depth — RLS will reject anyway)        │
                │   - insert matches + match_sets                │
                │   - Postgres trigger computes winner_id        │
                │   - revalidatePath('/matches')                 │
                └──────────────────┬─────────────────────────────┘
                                   │
                                   ▼
                ┌────────────────────────────────────────────────┐
                │ Postgres RLS gate (final authority)            │
                │  matches/match_sets write policies require     │
                │  public.is_authorized_scorer() = true          │
                └────────────────────────────────────────────────┘

  Public paths (/, /team, /matches) bypass everything;
  SELECT policies are `using (true)`.
```

**Which file does which check:**
- `middleware.ts` → "is there a session?" gate for `/admin/*`.
- `lib/supabase/middleware.ts` → cookie refresh helper, called from middleware.
- `app/admin/scores/page.tsx` → "is this user in `authorized_scorers`?" gate (server-side `rpc`).
- `app/admin/scores/actions.ts` → re-checks both, defense in depth.
- Postgres RLS → final, authoritative check; even a compromised client cannot bypass.

---

## 7. Winner Computation Logic

The function body is in `0001_init.sql` (§2). Algorithm:

```
threshold = floor(best_of / 2) + 1     -- bo3→2, bo5→3, bo7→4
p1_sets   = count(sets where p1 > p2)
p2_sets   = count(sets where p2 > p1)

if p1_sets >= threshold AND p1_sets > p2_sets : return player1_id
if p2_sets >= threshold AND p2_sets > p1_sets : return player2_id
otherwise: return NULL                  -- match incomplete or ambiguous
```

The AFTER trigger on `match_sets` (INSERT/UPDATE/DELETE) calls this and writes `matches.winner_id`. **The client never sets `winner_id` directly.**

Client-side mirror in `lib/tt-rules.ts` is only for live preview ("Match complete — winner: Player 1") while filling the form. It is never sent to the server as the winner.

---

## 8. Edge Case Decisions

| # | Case | Decision |
|---|---|---|
| 1 | Two team members share `full_name` | Selection by `id`. Combobox label = `full_name` + ` · ${short_label}` if `short_label` set; otherwise append a short `id` suffix like `· #a1b2`. Cards on `/team` show `short_label` as a subtitle. |
| 2 | Set score where neither side hits the 11-with-2 rule | **Rejected.** Enforced both client-side (Zod refinement) and DB-side (`match_sets_valid_score` CHECK). Old 21-point rules are out of scope — current ITTF rules only. Deuce allowed up to 30 by the check. |
| 3 | Best-of-5 where Player 1 wins first 3 sets | Remaining set rows are **hidden/disabled** in the form once the live preview detects a winner. Submission requires `sets.length` between `threshold` and `best_of`. |
| 4 | Sets entered don't yield a winner (e.g. 2–2 in best-of-5) | Submission **blocked** with inline error "Match is not yet decided — enter the remaining set(s)." Both client validation and the server action enforce this by calling the same `matchWinnerFromSets()` helper before insert. The DB trigger will compute `winner_id = NULL` if somehow inserted; the server action checks the returned `winner_id` after insert and, if NULL, rolls back (delete the match) and returns an error. |
| 5 | Player deleted while they have matches | `ON DELETE RESTRICT` on `matches.player1_id`, `player2_id`, `winner_id`. **Justification:** match history is the academy's record of truth; losing player identity makes historical rows meaningless. Admin must reassign or hard-delete matches first. (SET NULL would orphan rows; CASCADE would silently wipe history.) |
| 6 | Date in the future | Soft-blocked: Zod rule `match_date <= today` with override checkbox "Confirm future-dated entry" for unusual cases (e.g. an exhibition pre-announced). Server action respects the same. No DB check — keeps flexibility. |
| 7 | Same player both slots | Zod refinement + DB CHECK `matches_distinct_players`. Combobox for Player 2 also `excludeId={player1_id}` so the same person isn't even selectable. |
| 8 | Coach refreshes mid-entry | Persist draft form state to `sessionStorage` keyed by `tta-score-draft`. Restored on mount with a "Restore previous draft?" toast offering Restore / Discard. Cleared on successful submit. **No** server-side draft storage. |
| 9 | Mobile / courtside | Mobile-first layout. Score inputs use `inputMode="numeric"` and `pattern="[0-9]*"` to trigger numeric keypads. Tap targets ≥ 44px. Sticky Submit button on small screens. Combobox uses a full-screen sheet on `< sm` breakpoint. |
| 10 | Empty `/team` or `/matches` | Render `<EmptyState/>` with friendly copy ("No matches recorded yet — check back soon" / "Team roster is being updated"). No crash, no 404. |
| 11 | SEO | `app/layout.tsx` exports `metadata` with title template, description, OG image, locale `en_IN`. Each page exports its own `metadata`. `app/sitemap.ts` and `app/robots.ts` generated. `opengraph-image.tsx` for default OG. `/matches` is indexable; `/admin/*` returns `metadata.robots = { index: false }`. |

---

## 9. Figma Integration Plan

**Branch A — Figma URL provided at execution time**

1. Call `/figma-use` (MANDATORY before any `use_figma` call) to load the skill.
2. For each page route, call `get_design_context` on the corresponding Figma node URL (Home frame, Team frame, Matches frame, Admin/Scores frame).
3. Call `get_variable_defs` to pull design tokens (colors, spacing, type scale) and write them as CSS variables in `globals.css` and Tailwind theme extension.
4. Call `get_code_connect_map` first; if components are already mapped, prefer those imports.
5. For unmapped components, translate the design context output to Tailwind + shadcn primitives. Do not copy raw pixel values — map to the nearest Tailwind scale or a token.
6. Call `get_screenshot` on each top-level frame only when ambiguity remains, to verify visual fidelity.
7. Asset uploads (player photos, logo) via `upload_assets` if assets are referenced but not yet in the Figma file; otherwise drop into `public/`.

**Branch B — No Figma file**

Design direction:

- **Palette (sport-energetic, suitable for a TT academy):**
  - `--color-primary`: `#0B1F3A` (Deep Navy — backbone, headers)
  - `--color-accent`: `#E63946` (Tournament Red — CTA, winner highlight)
  - `--color-secondary`: `#F1C40F` (Ball Yellow — small accents, badges)
  - `--color-bg`: `#FAFAF7` (Chalk White)
  - `--color-fg`: `#0E0E10`
  - `--color-muted`: `#6B7280`
  - Neutrals on Tailwind's `zinc` scale.
- **Typography:** Headings — **Manrope** 700 (geometric, sporty). Body — **Inter** 400/500. Numerics in score tables use Inter `tabular-nums`.
- **Shape & feel:** Rounded-2xl on cards, subtle shadow `shadow-sm`, generous whitespace, ample line-height (1.65 body). Photo cards use 4:5 aspect ratio. Winner row in `/matches` gets a left accent bar in `--color-accent` and the winner's name in `font-semibold`.
- **Iconography:** `lucide-react` (already a shadcn dep).
- **Hero:** Full-bleed photo with diagonal red accent stripe; primary CTA "Visit the Academy", secondary "See our players".
- **Score-entry visual style:** Big number inputs (`text-2xl`), one row per set, color-coded per player (navy vs red).

Either branch must produce a polished result — **no Tailwind defaults visible** (no untouched `bg-gray-100` cards, no default shadcn slate).

---

## 10. Execution Checklist (Run in order)

### Phase 0 — Bootstrap
1. `npx create-next-app@latest sridharan-tta --typescript --tailwind --eslint --app --src-dir=false --import-alias "@/*"`. Choose `Yes` for Turbopack. Verify Next.js 15.
2. Set `tsconfig.json` → `"strict": true`, `"noUncheckedIndexedAccess": true`.
3. `cd sridharan-tta` and `git init`.
4. Install runtime deps:
   `npm i @supabase/supabase-js @supabase/ssr zod react-hook-form @hookform/resolvers date-fns lucide-react sonner`.
5. Install dev deps: `npm i -D @types/node`.
6. Initialise shadcn: `npx shadcn@latest init`. Choose Tailwind v4 if available, otherwise v3. Style: default. Base color: neutral. CSS variables: yes.
7. Add shadcn primitives: `npx shadcn@latest add button input label card select command popover dialog form table badge separator sonner skeleton`.

### Phase 1 — Supabase project & schema
8. Create a Supabase project (region: `ap-south-1` Mumbai). Note `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
9. Install Supabase CLI locally if not present. `npx supabase init` inside the repo.
10. Create `supabase/migrations/0001_init.sql` with the full SQL from §2. Verbatim.
11. Apply to remote: either `npx supabase db push` (after `supabase link`) **or** paste the SQL into the Supabase SQL editor and run.
12. In Supabase Dashboard → Authentication → Providers, enable Email/Password. Disable email confirmations for now (coach accounts are created by admin).

### Phase 2 — Project plumbing
13. Create `.env.example` (see §11). Copy to `.env.local` and fill in real values.
14. Create `lib/env.ts` that uses Zod to parse `process.env` and exports a typed `env`.
15. Create `lib/supabase/server.ts`, `lib/supabase/browser.ts`, `lib/supabase/middleware.ts` using the `@supabase/ssr` pattern from Supabase's Next.js App Router guide.
16. Create `lib/supabase/admin.ts` — service_role client; export only from a file guarded by `import 'server-only'`.
17. Create `middleware.ts` at repo root: call the middleware helper to refresh session, then if `pathname.startsWith('/admin')` and no user, redirect to `/admin/login?next=${pathname}`.
18. Create `lib/types.ts` from §3.
19. Create `lib/tt-rules.ts` with: `isValidSetScore(p1,p2)`, `setWinnerSide(p1,p2)`, `matchWinnerFromSets(sets, p1Id, p2Id, bestOf)`, `threshold(bestOf)`.
20. Create `lib/groupMatchesByMonth.ts`.
21. Create `lib/utils.ts` with `cn` (already from shadcn) plus `formatMatchDate(date)`.

### Phase 3 — Global layout & styling
22. Edit `app/layout.tsx`: load Manrope + Inter via `next/font`, set `<html lang="en-IN">`, set metadata (title template, description, OG), mount `<Sonner/>`. Include `<SiteHeader/>` and `<SiteFooter/>`.
23. Edit `app/globals.css`: add the CSS variables from §9 Branch B (or from Figma tokens if Branch A). Tailwind theme extension in `tailwind.config.ts` references the variables.
24. Build `components/site/site-header.tsx` (nav: Home, Team, Matches, Admin). Mobile menu via shadcn Sheet.
25. Build `components/site/site-footer.tsx`.
26. Build `components/site/section.tsx` and `components/site/logo.tsx`.

### Phase 4 — `/` Home
27. Build `app/page.tsx` as a server component. Compose `Hero`, `FounderVision`, `LocationBlock`, `TtHistory`, `TtBenefits`, `WhatToExpect`.
28. Optionally fetch the founder row to populate `FounderVision` with the seeded bio.
29. Write the educational prose with parents-of-prospective-students in mind. Sections: brief history of TT, physical benefits (hand-eye, reaction time, cardio), cognitive benefits (focus, strategy, working memory), why kids 6–14 benefit most, what to expect (batch sizes, equipment, schedule, tournament pathway).

### Phase 5 — `/team`
30. Build `app/team/page.tsx`. Fetch all `team_members` ordered by role + `display_order`.
31. Group in code: founders, managers, coaches, players.
32. Render four `TeamSection` blocks in that order. Each renders a grid of `TeamCard`.
33. Handle empty state.

### Phase 6 — Auth pages
34. Build `app/admin/login/page.tsx` (client component). Form: email, password. On submit call `supabase.auth.signInWithPassword`. On success, `router.push(searchParams.get('next') ?? '/admin/scores')`.
35. Build `app/admin/logout/route.ts` (POST) that calls `supabase.auth.signOut()` and redirects to `/`.
36. Build `app/admin/layout.tsx`: a thin admin shell with a sign-out button (POSTs to `/admin/logout`).

### Phase 7 — `/admin/scores`
37. Build `app/admin/scores/page.tsx` (server component). Steps:
    1. Get user via `supabase.auth.getUser()`. If none, `redirect('/admin/login?next=/admin/scores')`.
    2. Call `supabase.rpc('is_authorized_scorer')`. If false, render `<NotAuthorized/>`.
    3. Otherwise fetch all `team_members` where `role = 'player'`. Pass as prop to `<ScoreEntryForm/>`.
38. Build `app/admin/scores/score-entry-form.tsx` (`'use client'`):
    - React Hook Form + Zod schema mirroring `ScoreEntryFormValues`.
    - Field array for sets, size driven by `best_of`.
    - Live preview of computed winner using `matchWinnerFromSets`.
    - Show error when match not decided. Disable submit until valid.
    - Persist draft to `sessionStorage`.
    - On submit, call server action `submitMatch`.
    - On success, toast "Match saved — winner: X", reset form for next entry.
39. Build `app/admin/scores/player-combobox.tsx` (`'use client'`): shadcn Command-in-Popover; on `< sm` open in a full-screen Sheet. Filter by `full_name` and `short_label`. Display secondary line = `short_label ?? id.slice(0,6)`.
40. Build `app/admin/scores/actions.ts` (`'use server'`):
    - Re-validate Zod.
    - Re-check `is_authorized_scorer`.
    - Insert match; insert sets in a single RPC call **or** sequentially (sequentially is fine — the trigger runs per row).
    - Re-fetch `match.winner_id`; if NULL, delete the match (incomplete) and return `{ error: 'Match not decided' }`.
    - `revalidatePath('/matches')`.
    - Return `{ ok: true, match: MatchWithSets }`.

### Phase 8 — `/matches`
41. Build `app/matches/page.tsx` (server). Read `searchParams`: `month`, `year`, `playerId`. Fetch `matches` joined with `match_sets` and both players. Apply filters in the query (`match_date >= start AND match_date < end`, `player1_id = X OR player2_id = X`).
42. Group by month using `groupMatchesByMonth`.
43. Render `<MatchesFilterBar/>` (client) above the list. Pass available years + players. Bar updates URL via `router.push`.
44. Render `MatchesMonthGroup` → `MatchRow` → `SetScorePill`s.
45. Empty state when no matches.

### Phase 9 — SEO & polish
46. Add `app/sitemap.ts`, `app/robots.ts`, `app/opengraph-image.tsx`.
47. `metadata` exports per page; `/admin/*` opts out of indexing.
48. Add favicon and `og-default.png` to `public/`.
49. Lighthouse mobile pass (target ≥ 90 for performance/SEO/a11y).

### Phase 10 — Figma (only if URL supplied)
50. Invoke `/figma-use` skill.
51. For each route's frame, fetch design context + variable defs. Refactor styles to match.
52. If Code Connect map exists, use mapped components.

### Phase 11 — Local verification
53. `npm run dev`. Manually walk through: Home, Team, Login (with a created auth user), add that user to `authorized_scorers` via Supabase dashboard, enter a best-of-5 match, see it on `/matches`, filter it by month and by player.
54. Test the negative paths: unauthorized user lands on `/admin/scores` and sees the NotAuthorized panel; same-player block; incomplete-match block; invalid set score block.
55. Test on a mobile viewport (Chrome DevTools, then a real phone via local network).

### Phase 12 — Deploy
56. Push repo to GitHub.
57. Import into Vercel. Framework: Next.js. Set env vars (see §11).
58. Add Vercel production domain to Supabase → Auth → URL Configuration → Site URL and Additional Redirect URLs.
59. Verify production with a real coach signup.

---

## 11. Environment Variables — `.env.example`

```
# Public — exposed to the browser
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY

# Server-only — never expose
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY

# Site config
NEXT_PUBLIC_SITE_URL=https://sridharantta.example.com
```

`lib/env.ts` parses these with Zod; missing values throw at boot.

---

## 12. Deployment Notes — Vercel + Supabase

**Vercel**
- Framework preset: Next.js. Node 20.
- Env vars: all four above, set for Production + Preview + Development. `SUPABASE_SERVICE_ROLE_KEY` is *not* prefixed `NEXT_PUBLIC_` so it stays server-only.
- Build command: `next build`. Output: default.
- Image domains: add the Supabase storage host if photos are served from Supabase Storage. `next.config.ts` → `images.remotePatterns`.
- Vercel project → Settings → Functions → Region: `bom1` (Mumbai) to match Supabase region.

**Supabase**
- Region: `ap-south-1` (Mumbai) — lowest latency for Chennai users.
- Auth → URL Configuration: Site URL = production URL. Additional Redirect URLs include `http://localhost:3000` for local dev and any Vercel preview URLs you care about.
- Auth → Email Templates: customise sign-in templates with academy branding (optional).
- Storage (optional): a `team-photos` bucket if photos aren't kept in `public/`. Make it public-read.
- Database → Replication / Backups: enable daily backups (default on paid tier).
- Add coaches: create their user in Auth → Users, then `insert into authorized_scorers(user_id) values ('<their uid>')` via SQL editor.

**Operational checks before launch**
- Confirm RLS is `enabled` on all four tables (Supabase dashboard shows shield icons).
- Confirm `compute_match_winner` and `is_authorized_scorer` exist and are executable by `anon, authenticated`.
- Run a smoke test: anonymous user can SELECT `matches`, cannot INSERT.
- Test login flow on production domain end-to-end.

---

*End of plan. The executing agent (Sonnet 4.6) should follow §10 in order and refer back to the other sections as needed.*
