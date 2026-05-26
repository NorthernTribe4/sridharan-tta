-- =========================================================================
-- Sridharan TTA — media tables + team_members schema additions
-- Run via: Supabase SQL Editor → paste → Run
-- Note: migration 0003 is intentionally reserved for future use
-- =========================================================================

-- -------------------------------------------------------------------------
-- Extend team_members with player-profile columns
-- -------------------------------------------------------------------------
alter table public.team_members
  add column if not exists category       text check (category in ('senior','junior','youth','sub_youth')),
  add column if not exists playing_style  text check (playing_style in ('attacking','all_round','defensive','power','spin')),
  add column if not exists age            int  check (age between 5 and 99),
  add column if not exists years_training int  check (years_training >= 0);

-- Rename founder to full name
update public.team_members
  set full_name = 'Sridharan Murugan'
  where role = 'founder' and full_name = 'Sridharan';

-- Seed player profile data
update public.team_members set age = 17, category = 'junior',   playing_style = 'attacking',  years_training = 8  where full_name = 'Player 1';
update public.team_members set age = 15, category = 'youth',    playing_style = 'all_round',   years_training = 5  where full_name = 'Player 2';
update public.team_members set age = 20, category = 'senior',   playing_style = 'power',       years_training = 10 where full_name = 'Player 3';
update public.team_members set age = 13, category = 'sub_youth',playing_style = 'spin',        years_training = 3  where full_name = 'Player 4';
update public.team_members set age = 22, category = 'senior',   playing_style = 'defensive',   years_training = 12 where full_name = 'Player 5';
update public.team_members set age = 16, category = 'junior',   playing_style = 'attacking',   years_training = 6  where full_name = 'Player 6';

-- -------------------------------------------------------------------------
-- media_photos
-- -------------------------------------------------------------------------
create table if not exists public.media_photos (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  photo_url   text not null,
  category    text not null check (category in ('training','matches','events','facilities')),
  uploaded_at timestamptz not null default now()
);

alter table public.media_photos enable row level security;

create policy "media_photos_select_public" on public.media_photos
  for select using (true);

create policy "media_photos_insert_authorized" on public.media_photos
  for insert with check (public.is_authorized_scorer());

create policy "media_photos_update_authorized" on public.media_photos
  for update using (public.is_authorized_scorer());

create policy "media_photos_delete_authorized" on public.media_photos
  for delete using (public.is_authorized_scorer());

-- -------------------------------------------------------------------------
-- media_videos
-- -------------------------------------------------------------------------
create table if not exists public.media_videos (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  description   text,
  video_url     text not null,
  thumbnail_url text,
  uploaded_at   timestamptz not null default now()
);

alter table public.media_videos enable row level security;

create policy "media_videos_select_public" on public.media_videos
  for select using (true);

create policy "media_videos_insert_authorized" on public.media_videos
  for insert with check (public.is_authorized_scorer());

create policy "media_videos_update_authorized" on public.media_videos
  for update using (public.is_authorized_scorer());

create policy "media_videos_delete_authorized" on public.media_videos
  for delete using (public.is_authorized_scorer());

-- -------------------------------------------------------------------------
-- news_articles
-- -------------------------------------------------------------------------
create table if not exists public.news_articles (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  slug           text not null unique,
  excerpt        text not null,
  content        text not null,
  featured_image text,
  author         text not null default 'Sridharan TTA',
  is_published   boolean not null default true,
  published_at   timestamptz not null default now()
);

create index if not exists news_articles_published_idx
  on public.news_articles(is_published, published_at desc);

alter table public.news_articles enable row level security;

create policy "news_articles_select_public" on public.news_articles
  for select using (is_published = true);

create policy "news_articles_select_authorized" on public.news_articles
  for select using (public.is_authorized_scorer());

create policy "news_articles_insert_authorized" on public.news_articles
  for insert with check (public.is_authorized_scorer());

create policy "news_articles_update_authorized" on public.news_articles
  for update using (public.is_authorized_scorer());

create policy "news_articles_delete_authorized" on public.news_articles
  for delete using (public.is_authorized_scorer());

-- -------------------------------------------------------------------------
-- magazines
-- -------------------------------------------------------------------------
create table if not exists public.magazines (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  cover_image text not null,
  pdf_url     text not null,
  issue_date  date not null,
  description text,
  uploaded_at timestamptz not null default now()
);

alter table public.magazines enable row level security;

create policy "magazines_select_public" on public.magazines
  for select using (true);

create policy "magazines_insert_authorized" on public.magazines
  for insert with check (public.is_authorized_scorer());

create policy "magazines_update_authorized" on public.magazines
  for update using (public.is_authorized_scorer());

create policy "magazines_delete_authorized" on public.magazines
  for delete using (public.is_authorized_scorer());

-- -------------------------------------------------------------------------
-- Seed: 8 photos
-- -------------------------------------------------------------------------
insert into public.media_photos (title, description, photo_url, category) values
(
  'Morning footwork drill',
  'Players warming up with footwork patterns before the main coaching session.',
  'https://images.unsplash.com/photo-1534158914592-062992fbe900?w=1200',
  'training'
),
(
  'Forehand topspin technique',
  'Coach demonstrating the forehand topspin — the foundation of modern table tennis.',
  'https://images.unsplash.com/photo-1611251135345-18c56206b863?w=1200',
  'training'
),
(
  'Junior camp 2024',
  'Students at the summer junior development camp, working on multi-ball drills.',
  'https://images.unsplash.com/photo-1609710728851-30a82a8de9fe?w=1200',
  'training'
),
(
  'State qualifier — semifinal',
  'Tense semifinal action at the Tamil Nadu State qualifier tournament.',
  'https://images.unsplash.com/photo-1551698618-1dfc2d98685a?w=1200',
  'matches'
),
(
  'District finals trophy ceremony',
  'Our players receiving awards at the district finals.',
  'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1200',
  'matches'
),
(
  'Annual awards night 2024',
  'Celebrating excellence at the annual Sridharan TTA awards evening.',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200',
  'events'
),
(
  'Open house weekend',
  'Families and prospective students exploring the academy during our open house.',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
  'events'
),
(
  'Main training hall',
  'Six international-spec tables in our main hall, built for serious competition practice.',
  'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200',
  'facilities'
);

-- -------------------------------------------------------------------------
-- Seed: 4 videos
-- -------------------------------------------------------------------------
insert into public.media_videos (title, description, video_url, thumbnail_url) values
(
  'Academy Tour 2024',
  'Take a guided tour of our facilities, meet the coaches, and see what makes Sridharan TTA special.',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  null
),
(
  'Coaching Methodology Explained',
  'Our head coach explains the structured, science-backed approach that drives our students'' improvement.',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  null
),
(
  'State Championship Highlights — December 2024',
  'Highlights from the Tamil Nadu State Championship where our players put in outstanding performances.',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  null
),
(
  'Founder''s Story: Sridharan Murugan',
  'Sridharan Murugan shares the journey from a small coaching hall in 2010 to one of Chennai''s premier academies.',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  null
);

-- -------------------------------------------------------------------------
-- Seed: 3 news articles
-- -------------------------------------------------------------------------
insert into public.news_articles (title, slug, excerpt, content, featured_image, author, is_published) values
(
  'Karthik Subramanian Wins State U-19 Championship',
  'karthik-subramanian-state-u19-2024',
  'Academy player Karthik Subramanian claimed gold at the Tamil Nadu State U-19 Championship, defeating last year''s champion in a five-set thriller.',
  E'## A Championship to Remember\n\nIn a match that had spectators on the edge of their seats, Sridharan TTA''s Karthik Subramanian defeated defending champion Arjun Pillai in five hard-fought sets at the Tamil Nadu State U-19 Championship held in Coimbatore last weekend. The final scoreline — 11-9, 9-11, 11-7, 8-11, 11-8 — tells only part of the story.\n\n## The Journey to Gold\n\nKarthik has been training at Sridharan TTA since the age of 9. Over eight years of structured coaching, he has developed an attacking game built on explosive forehand loops and a deceptive short game. "He never settles," says his coach. "Every session, he''s looking for the next level."\n\nThe state championship win follows a breakthrough year that included a district title in March and a silver at the South India Open in September. Karthik is now ranked 4th in the U-19 national rankings.\n\n## What''s Next\n\nWith Nationals scheduled for March in Pune, the entire academy is rallying behind Karthik. Training has intensified, with additional multi-ball sessions and video analysis now part of his weekly routine. We couldn''t be prouder — and we can''t wait to see what he does on the national stage.',
  'https://images.unsplash.com/photo-1551698618-1dfc2d98685a?w=1200',
  'Sridharan TTA',
  true
),
(
  'Academy Welcomes Three New Coaches',
  'three-new-coaches-2025',
  'We''re delighted to announce three experienced coaches joining the Sridharan TTA family — bringing decades of competitive experience to our students.',
  E'## Growing Our Coaching Team\n\nSridharan TTA is entering 2025 with renewed ambition — and a significantly strengthened coaching team. We are proud to welcome three new coaches who bring a combined four decades of competitive and coaching experience to our programme.\n\n## Meet the New Coaches\n\n**Coach Ramesh Balaji** joins us from the National Academy in Patiala, where he spent six years developing junior talent. A former national-level player himself, Ramesh specialises in serve-and-receive tactics and has coached two players to national rankings in the top 10.\n\n**Coach Priya Sundaram** is a former state champion with a passion for developing junior and youth players. Her analytical approach — using video review and data-driven training loads — is already making an impact in our junior batches.\n\n**Coach Vikram Nair** brings expertise in physical conditioning and injury prevention. A certified strength and conditioning specialist, Vikram will lead our new fitness programme, ensuring our players are as physically prepared as they are technically skilled.\n\n## A New Chapter\n\nWith this addition, Sridharan TTA now has a full-time coaching staff of four, enabling us to offer dedicated batches for sub-youth, youth, junior, and senior players simultaneously. Batch registrations for 2025 are now open.',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200',
  'Sridharan TTA',
  true
),
(
  'Annual Inter-Academy Tournament Results',
  'inter-academy-tournament-2024',
  'Our annual inter-academy tournament concluded last weekend with strong performances across all age categories.',
  E'## Inter-Academy Tournament 2024 Wrap-Up\n\nThe 5th Annual Sridharan TTA Inter-Academy Tournament wrapped up last Sunday with participation from 14 academies across Tamil Nadu and Andhra Pradesh. Over 200 players competed across six age categories over two action-packed days.\n\n## Key Results\n\nOur players delivered exceptional performances at home:\n\n- **Sub-Youth (U-12):** Gold — Arun Krishnaswamy; Silver — Meena Pillai\n- **Youth (U-15):** Gold — Divya Lakshmi; Bronze — Rajan Murugan\n- **Junior (U-19):** Silver — Karthik Subramanian (fresh off his state title); Bronze — Suresh Babu\n- **Senior Open:** our players reached the quarterfinals, falling to ranked opponents from Bangalore\n\n## Beyond the Scores\n\nTournaments like this are about more than results. For our youngest players, it was their first competitive experience — learning to manage nerves, adapt to unfamiliar opponents, and carry themselves with sportsmanship. That''s what we build here.\n\nWe thank every competing academy, every parent who traveled to support, and every volunteer who helped run the event. See you at the 6th edition in 2025.',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
  'Sridharan TTA',
  true
);

-- -------------------------------------------------------------------------
-- Seed: 2 magazines
-- -------------------------------------------------------------------------
insert into public.magazines (title, cover_image, pdf_url, issue_date, description) values
(
  'Spin Quarterly — Q4 2024',
  'https://images.unsplash.com/photo-1611251135345-18c56206b863?w=600',
  'https://example.com/spin-q4-2024.pdf',
  '2024-10-01',
  'Our Q4 2024 magazine covers the state championship season, coaching philosophy features, and a profile of rising star Karthik Subramanian.'
),
(
  'The Academy Annual — 2024',
  'https://images.unsplash.com/photo-1534158914592-062992fbe900?w=600',
  'https://example.com/annual-2024.pdf',
  '2024-12-01',
  'A full-year retrospective: highlights, statistics, player journeys, and a look ahead at our ambitions for 2025.'
);
