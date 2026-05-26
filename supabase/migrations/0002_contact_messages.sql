-- =========================================================================
-- Sridharan TTA — contact_messages + reviews
-- Run via: Supabase SQL Editor → paste → Run
-- =========================================================================

-- -------------------------------------------------------------------------
-- contact_messages
-- -------------------------------------------------------------------------
create table if not exists public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  phone       text,
  message     text not null,
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

-- Anyone (anon) can insert via the contact form
create policy "contact_insert_public" on public.contact_messages
  for insert with check (true);

-- Only authorized scorers can read messages
create policy "contact_select_authorized" on public.contact_messages
  for select using (public.is_authorized_scorer());

-- Only authorized scorers can mark messages as read
create policy "contact_update_authorized" on public.contact_messages
  for update using (public.is_authorized_scorer());

-- -------------------------------------------------------------------------
-- reviews
-- -------------------------------------------------------------------------
create table if not exists public.reviews (
  id              uuid primary key default gen_random_uuid(),
  reviewer_name   text not null,
  reviewer_role   text not null,
  rating          int  not null check (rating between 1 and 5),
  review_text     text not null,
  is_approved     boolean not null default false,
  created_at      timestamptz not null default now()
);

alter table public.reviews enable row level security;

-- Anyone can submit a review
create policy "reviews_insert_public" on public.reviews
  for insert with check (true);

-- Public can only read approved reviews
create policy "reviews_select_approved" on public.reviews
  for select using (is_approved = true);

-- Authorized scorers can read all reviews (approved + pending)
create policy "reviews_select_authorized" on public.reviews
  for select using (public.is_authorized_scorer());

-- Authorized scorers can approve / edit reviews
create policy "reviews_update_authorized" on public.reviews
  for update using (public.is_authorized_scorer());

-- Authorized scorers can delete reviews
create policy "reviews_delete_authorized" on public.reviews
  for delete using (public.is_authorized_scorer());

-- -------------------------------------------------------------------------
-- Seed: 5 approved reviews
-- -------------------------------------------------------------------------
insert into public.reviews (reviewer_name, reviewer_role, rating, review_text, is_approved) values
(
  'Priya Krishnamurthy',
  'Parent of student',
  5,
  'My son has been training here for two years and the transformation has been incredible. The coaches are patient, structured, and genuinely invested in every child''s progress. We couldn''t be happier.',
  true
),
(
  'Arjun Venkatesh',
  'Adult student',
  5,
  'I started at 32 with zero experience. The coaching style is welcoming and methodical — within six months I was competing in local tournaments. The community here is fantastic.',
  true
),
(
  'Meenakshi Rajan',
  'Parent of student',
  4,
  'Great facility and excellent coaching. My daughter improved significantly in her footwork and mental game. The coaches track progress meticulously and always keep parents in the loop.',
  true
),
(
  'Karthik Sundaram',
  'Club player',
  5,
  'Training at this academy elevated my game by leaps. The technical depth is exceptional — they break down every stroke, every serve, every return. Absolutely worth every rupee.',
  true
),
(
  'Divya Nair',
  'Parent of student',
  5,
  'We tried two other academies before finding Sridharan TTA. The difference is night and day. My son looks forward to every session, and the values of discipline and sportsmanship they instill mean just as much to us as the game itself.',
  true
);
