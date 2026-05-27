-- =========================================================================
-- Sridharan TTA — Team Seed Data + Admin Insert/Update/Delete policies
-- Wipes existing team_members and seeds 2 Founders, 3 Coaches, 8 Players
-- =========================================================================

-- -------------------------------------------------------------------------
-- Allow authorized scorers to manage team_members
-- -------------------------------------------------------------------------
do $$ begin
  drop policy if exists "team_insert_authorized" on public.team_members;
  drop policy if exists "team_update_authorized" on public.team_members;
  drop policy if exists "team_delete_authorized" on public.team_members;
exception when others then null; end $$;

create policy "team_insert_authorized" on public.team_members
  for insert with check (public.is_authorized_scorer());

create policy "team_update_authorized" on public.team_members
  for update using (public.is_authorized_scorer());

create policy "team_delete_authorized" on public.team_members
  for delete using (public.is_authorized_scorer());

-- -------------------------------------------------------------------------
-- Wipe and re-seed
-- -------------------------------------------------------------------------
delete from public.team_members;

-- Founders
insert into public.team_members (full_name, role, bio, achievements, photo_url, display_order, short_label, category, playing_style, age, years_training) values
('Founder 1', 'founder',
 'Founder 1 established the academy with the vision of bringing world-class table tennis training to Chennai. A former state competitor turned educator, they lead the academy''s strategic direction and long-term mission.',
 ARRAY['Founded Sridharan TTA in 2010', 'Former Tamil Nadu state-level player', '25+ years coaching experience'],
 null, 1, 'Founder', null, null, null, null),
('Founder 2', 'founder',
 'Founder 2 co-leads the academy with a focus on community programs and youth development. Brings deep operational experience and a commitment to making elite-level coaching accessible to every aspiring player.',
 ARRAY['Co-founder, Sridharan TTA', 'Community outreach lead', 'National-level umpire certification'],
 null, 2, 'Co-Founder', null, null, null, null);

-- Coaches
insert into public.team_members (full_name, role, bio, achievements, photo_url, display_order, short_label, category, playing_style, age, years_training) values
('Coach 1', 'coach',
 'Coach 1 specializes in technical fundamentals — grip, stance, and stroke mechanics. Patient, methodical, and trusted by parents of beginners.',
 ARRAY['ITTF Level 2 certified', '12 years coaching experience', 'Developed 5 state-ranked juniors'],
 null, 1, 'Senior Coach', null, null, null, null),
('Coach 2', 'coach',
 'Coach 2 focuses on competitive play — match strategy, mental conditioning, and tournament preparation. Drives the academy''s top performers.',
 ARRAY['Former national-level player', 'ITTF Level 3 certified', 'Tournament prep specialist'],
 null, 2, 'Head Coach', null, null, null, null),
('Coach 3', 'coach',
 'Coach 3 runs the youth and sub-youth programs. Known for an energetic, fun-first style that keeps young players engaged while building strong foundations.',
 ARRAY['Youth development specialist', '8 years coaching', 'Sub-youth district champion 2018'],
 null, 3, 'Youth Coach', null, null, null, null);

-- Players (8)
insert into public.team_members (full_name, role, bio, achievements, photo_url, display_order, short_label, category, playing_style, age, years_training) values
('Player 1', 'player',
 'Senior competitor with a strong attacking game. Known for aggressive forehand loops and quick footwork around the table.',
 ARRAY['District champion 2024', 'State quarterfinalist'],
 null, 1, null, 'senior', 'attacking', 22, 8),
('Player 2', 'player',
 'All-round senior player. Balanced offensive and defensive game; consistent in long rallies.',
 ARRAY['State doubles bronze 2023', 'Club champion 2022'],
 null, 2, null, 'senior', 'all_round', 24, 10),
('Player 3', 'player',
 'Junior with a powerful backhand and excellent serve variation. One of the academy''s rising stars.',
 ARRAY['Junior state semifinalist 2024', 'School nationals representative'],
 null, 3, null, 'junior', 'power', 17, 6),
('Player 4', 'player',
 'Defensive specialist — known for chopping and patient point construction. Frustrates attackers with consistency.',
 ARRAY['Junior district silver 2023', '5+ tournament finals'],
 null, 4, null, 'junior', 'defensive', 16, 5),
('Player 5', 'player',
 'Youth player with a spin-heavy game. Loves serve-receive battles and crafty point setups.',
 ARRAY['Youth district champion 2024', 'School inter-zone winner'],
 null, 5, null, 'youth', 'spin', 13, 4),
('Player 6', 'player',
 'Youth attacker. Quick reactions and aggressive third-ball play.',
 ARRAY['Youth state qualifier 2024'],
 null, 6, null, 'youth', 'attacking', 12, 3),
('Player 7', 'player',
 'Sub-youth with promising fundamentals. Trains six days a week and shows great technical discipline.',
 ARRAY['Sub-youth zonal medalist 2024'],
 null, 7, null, 'sub_youth', 'all_round', 10, 2),
('Player 8', 'player',
 'Sub-youth beginner-turned-competitor. Fast learner with a natural feel for spin.',
 ARRAY['First academy tournament 2024'],
 null, 8, null, 'sub_youth', 'spin', 9, 1);
