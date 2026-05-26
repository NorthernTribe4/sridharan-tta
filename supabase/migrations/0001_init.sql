-- =========================================================================
-- Sridharan Table Tennis Academy — initial schema
-- Run via: supabase db push   (or paste into Supabase SQL editor and run)
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
  short_label     text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists team_members_role_idx
  on public.team_members(role, display_order);

-- -------------------------------------------------------------------------
-- authorized_scorers
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
-- compute_match_winner
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

  v_threshold := (v_best_of / 2) + 1;

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
-- Trigger: recompute winner after set changes
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
  return null;
end $$;

drop trigger if exists trg_match_sets_refresh_winner on public.match_sets;
create trigger trg_match_sets_refresh_winner
after insert or update or delete on public.match_sets
for each row execute function public.refresh_match_winner();

-- -------------------------------------------------------------------------
-- is_authorized_scorer helper
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

-- team_members
drop policy if exists team_members_select_public on public.team_members;
create policy team_members_select_public
  on public.team_members for select using (true);

drop policy if exists team_members_write_scorers on public.team_members;
create policy team_members_write_scorers
  on public.team_members for all to authenticated
  using (public.is_authorized_scorer())
  with check (public.is_authorized_scorer());

-- matches
drop policy if exists matches_select_public on public.matches;
create policy matches_select_public
  on public.matches for select using (true);

drop policy if exists matches_write_scorers on public.matches;
create policy matches_write_scorers
  on public.matches for all to authenticated
  using (public.is_authorized_scorer())
  with check (public.is_authorized_scorer());

-- match_sets
drop policy if exists match_sets_select_public on public.match_sets;
create policy match_sets_select_public
  on public.match_sets for select using (true);

drop policy if exists match_sets_write_scorers on public.match_sets;
create policy match_sets_write_scorers
  on public.match_sets for all to authenticated
  using (public.is_authorized_scorer())
  with check (public.is_authorized_scorer());

-- authorized_scorers (own row only, no writes via RLS)
drop policy if exists authorized_scorers_select_self on public.authorized_scorers;
create policy authorized_scorers_select_self
  on public.authorized_scorers for select to authenticated
  using (user_id = auth.uid());

-- =========================================================================
-- Seed data
-- =========================================================================
insert into public.team_members (full_name, role, bio, achievements, display_order, short_label) values
  (
    'Sridharan',
    'founder',
    'Founder of Sridharan Table Tennis Academy. A lifelong table tennis enthusiast based in Chennai, Sridharan started the academy to give young players in Tamil Nadu access to structured, world-class coaching close to home.',
    array['Founded the academy in Chennai','25+ years in competitive and grassroots table tennis','Mentored multiple state-level junior players'],
    1, 'Founder'
  ),
  (
    'Manager 1',
    'manager',
    'Operations and academy manager. Handles scheduling, tournament entries, player onboarding, and day-to-day running of the academy floor.',
    array['10+ years of sports academy administration','Manages a roster of 40+ active trainees'],
    1, 'Manager'
  ),
  (
    'Coach 1',
    'coach',
    'Head coach focused on technique fundamentals for beginners and intermediates. Specialises in footwork drills and serve variation.',
    array['National-level player','Coached the academy''s U-13 batch to two district medals'],
    1, 'Head Coach'
  ),
  (
    'Coach 2',
    'coach',
    'Assistant coach for the advanced batch. Focus areas: spin reading, third-ball attack, and match-play strategy.',
    array['State-ranked open singles player','TTFI Level-2 certified'],
    2, 'Asst. Coach'
  ),
  (
    'Coach 3',
    'coach',
    'Junior development coach. Works with new joinees aged 6–10 on grip, stance, and bat-ball coordination.',
    array['Former state junior champion','Specialist in early-childhood TT pedagogy'],
    3, 'Junior Coach'
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
