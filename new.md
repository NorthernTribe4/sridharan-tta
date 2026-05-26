# Sridharan TTA — Aspire-Style Restructure Plan

> **Status:** Planning only. No code changes until this is reviewed and the open decisions in §3 are confirmed.
>
> **Goal:** Transform the current 4-page site into a premium, editorial, image-rich sports academy site modeled after [aspire.qa/about](https://www.aspire.qa/about). The new feel is dark, confident, content-dense, and modular — heavy use of imagery, stats, and modular card grids.
>
> **Audience for this plan:** the next implementing agent (and the user, who needs to validate the direction before build).

---

## 1. What this plan covers (and what it doesn't)

**In scope**
- Complete navigation overhaul (dropdown menus, "Our People" + "Media" groupings)
- A new dark, editorial design system (palette + typography refresh)
- Home page rebuild — 9 sections, Aspire-inspired
- 4 brand-new public routes under `/media` + a dynamic news article route
- A new `/players` page (separate from existing `/team`)
- Refactor of existing `/team` page to focus on coaches/founder/manager only
- 4 new admin sub-pages for media management
- New migration `0004_media.sql` with seeds
- Footer redesign
- Mobile responsiveness across everything new

**Out of scope (will not be touched)**
- `/matches` page — keep as-is
- `/admin/scores` score-entry flow — keep as-is
- `/admin/login`, `/admin/logout` — keep as-is
- Existing `contact_messages` and `reviews` features (added last round) — keep as-is, just re-style to new palette
- Postgres trigger / winner-computation logic — untouched
- Migrations `0001_init.sql` and `0002_contact_messages.sql` — frozen
- Authentication model — untouched

---

## 2. Current state inventory

### Existing routes
| Route | Status after restructure |
|---|---|
| `/` | **Rebuild** — 9-section Aspire-style home |
| `/team` | **Refactor** — filter to coaches + founder + manager only |
| `/matches` | Keep as-is, restyle to new palette only |
| `/admin/login` | Keep |
| `/admin/logout` | Keep |
| `/admin/scores` | Keep |
| `/admin/messages` | Restyle to new palette |
| `/admin/reviews` | Restyle to new palette |

### Existing tables
- `team_members` (founder/manager/coach/player) — reused, source of truth for `/players` and `/team`
- `matches`, `match_sets`, `authorized_scorers` — untouched
- `contact_messages`, `reviews` — untouched

### Existing home-page components that need decision (keep / merge / delete)
| Component | Decision |
|---|---|
| `components/home/hero.tsx` | **Rebuild** — full-bleed image hero |
| `components/home/founder-vision.tsx` | **Merge** into new "About" section |
| `components/home/tt-history.tsx` | **Delete** — content lives elsewhere now (could move to a future blog post) |
| `components/home/tt-benefits.tsx` | **Delete** — not part of Aspire layout |
| `components/home/what-to-expect.tsx` | **Delete** — replaced by Quick Links grid + About |
| `components/home/location-block.tsx` | **Rebuild as `find-us.tsx`** — keeps Google Maps but new editorial styling |
| `components/home/reviews-section.tsx` | **Keep, restyle** |
| `components/home/contact-modal.tsx` | **Keep** — still triggered by hero CTA |

---

## 3. Decisions required before build starts

These are conflicts or ambiguities in the brief. The plan assumes a default for each; please confirm or correct **before** Phase 1 starts.

### D1 — Color palette
- **Brief says:** "Use the existing color palette (dark theme, orange accent #F97316, blue secondary #3B82F6)"
- **Reality:** the *current* palette is light theme (chalk-white bg, navy + red accents)
- **Plan default:** introduce a NEW dark palette per the brief, migrate every existing component to it
- **Implication:** every CSS variable, every Tailwind class using `var(--tta-*)`, every page changes look. This is the single largest visual change in the project.

### D2 — Navigation final shape
- **Brief §1 says:** Home / Media / Players / Matches / Admin Login (no Team)
- **Brief §/players section says:** "rename Team → Our People with dropdown: Coaches & Staff (/team) and Players (/players)"
- **Plan default — final nav:**
  - **Home** → `/`
  - **Our People** ▾ (dropdown: Coaches & Staff → `/team`, Players → `/players`)
  - **Media** ▾ (dropdown: Photo Gallery → `/media/photos`, Video Gallery → `/media/videos`, News → `/media/news`, Magazines → `/media/magazines`)
  - **Matches** → `/matches`
  - **Admin Login** → `/admin/login` (hidden when already signed in; replaced by "Admin" link)

### D3 — Migration number gap
- **Brief says:** create `0004_media.sql`
- **Reality:** current migrations are `0001`, `0002` — there is no `0003`
- **Plan default:** create `0004_media.sql` as instructed, leaving `0003` as a deliberate gap for a future migration the user may already have in mind. Will flag in the README.

### D4 — Founder name
- **Brief says:** "founding in 2010 by Sridharan Murugan"
- **Current seed data:** founder is named just "Sridharan"
- **Plan default:** update the founder's `full_name` to "Sridharan Murugan" in the new migration (or via a small UPDATE statement included with `0004`). Confirm spelling.

### D5 — Founding year
- **Brief uses 2010** consistently ("since 2010", "15+ Years")
- **Plan default:** 2010 becomes the canonical founding year. Used in hero copy, stats counter, footer.

### D6 — Watch our story video
- **Brief says:** "Watch our story →" opens a video modal placeholder
- **Plan default:** placeholder uses `https://www.youtube.com/embed/dQw4w9WgXcQ` (same placeholder used elsewhere in brief)
- **Note:** user will need to replace this with a real video URL before launch

### D7 — `/players` filter taxonomies
- **Brief filter chips:** "All / Senior / Junior (U-19) / Youth (U-15) / Sub-Youth (U-12)" + "Attacking / All-round / Defensive / Power / Spin"
- **Reality:** the `team_members` table has no `category` or `playing_style` columns
- **Plan default:** add two new optional columns to `team_members` via the `0004` migration:
  - `category text` — nullable, values: `senior | junior | youth | sub_youth`
  - `playing_style text` — nullable, values: `attacking | all_round | defensive | power | spin`
  - `age int` — nullable (current schema has no age field)
  - `years_training int` — nullable
- **Filters degrade gracefully** when columns are NULL → player appears under "All" only.

### D8 — News article body
- **Brief says:** `content text (full article body, can be markdown)`
- **Plan default:** store as markdown; render with `react-markdown` (new dependency). If you prefer plain HTML or rich-text, say so now and I'll swap.

### D9 — Magazine PDFs
- **Brief:** "Download PDF button"
- **Plan default:** `<a href={pdf_url} target="_blank" rel="noopener" download>` — opens in new tab with download hint. PDFs themselves stored in Supabase Storage or a CDN (out of scope for migration — just stores the URL).

### D10 — Old home sections — what to keep
See §2 inventory table. **Default:** delete `tt-history`, `tt-benefits`, `what-to-expect`. Merge `founder-vision` content into the new About section.

### D11 — Stats section: 4 or 6 stats?
- **Brief says** "4-column stats grid" then lists 6 stats
- **Plan default:** 6 stats in a `2x3` mobile / `6x1` desktop responsive grid. Better visual rhythm than awkward 4+2.

### D12 — Admin nav growth
- **Brief:** add 4 new admin tabs (Photos, Videos, News, Magazines)
- **Reality:** admin nav already has 3 tabs (Score Entry, Messages, Reviews)
- **Plan default:** group admin into two tab rows or a single 7-tab scrolling row.
  - **Recommendation:** 7-tab single row on desktop, horizontally scrollable on mobile. Mobile gets a hamburger menu inside the admin shell as a fallback.

---

## 4. Design system update (Phase 2)

### 4.1 Palette (CSS variables in `globals.css`)

```css
:root {
  /* Dark editorial base */
  --bg-base: #0A0A0B;       /* near-black page bg */
  --bg-surface: #141416;    /* card surface */
  --bg-elevated: #1C1C20;   /* hover / elevated card */
  --border: #27272A;        /* subtle borders */
  --border-strong: #3F3F46;

  /* Text */
  --text-primary: #FAFAFA;
  --text-secondary: #A1A1AA;
  --text-muted: #71717A;

  /* Brand accents (per brief) */
  --accent-orange: #F97316;     /* primary CTA, active states, highlights */
  --accent-orange-hover: #EA580C;
  --accent-blue: #3B82F6;       /* secondary, links, info */
  --accent-blue-hover: #2563EB;

  /* Status (kept for forms) */
  --success: #22C55E;
  --warning: #EAB308;
  --danger: #EF4444;
}
```

Shadcn `--background`, `--foreground`, `--primary`, `--accent` etc. map onto the above. No legacy `--tta-navy`, `--tta-red`, `--tta-chalk` references survive Phase 2.

### 4.2 Typography
- Headings: keep **Manrope** (already loaded) — works well for editorial.
- Body: keep **Inter**.
- Add a display weight class — `.font-display` = Manrope 900, tight tracking, used for hero + section H2s.
- Display sizes: H1 hero `clamp(2.75rem, 6vw, 5.5rem)`, H2 section `clamp(2rem, 4vw, 3.25rem)`.

### 4.3 Reusable building blocks (new components, all in `components/site/`)
| Component | Purpose |
|---|---|
| `EditorialSection` | Vertical-rhythm wrapper with eyebrow + heading + optional intro |
| `QuickLinkCard` | Image-backed card with title + arrow, used 6× on home |
| `StatCounter` | Big number + label, animates on scroll into view (`IntersectionObserver`) |
| `ImageWithCaption` | Image + caption block (the Aspire side-by-side pattern) |
| `LightboxModal` | Full-screen image viewer for photo gallery |
| `VideoModal` | Embedded iframe modal for video gallery + "Watch our story" CTA |
| `Carousel` | Horizontally scrollable card row with snap + arrow controls — used for Featured Players + News Strip |
| `Eyebrow` | Small uppercase label above section headings |
| `Pill` | Filter chip (active/inactive states) — used on `/players`, `/media/photos` |

---

## 5. New routes and information architecture

### 5.1 Public routes after restructure

```
/                        Home (9 sections, embedded About)
/players                 NEW — players showcase
/team                    REFOCUS — coaches + founder + manager only
/matches                 unchanged
/media                   NEW — 4 tile landing
/media/photos            NEW — gallery grid + filter
/media/videos            NEW — video grid + modal player
/media/news              NEW — article list
/media/news/[slug]       NEW — full article view
/media/magazines         NEW — magazine grid + PDF links
```

### 5.2 Admin routes after restructure

```
/admin/login                 unchanged
/admin/logout                unchanged
/admin/scores                unchanged
/admin/messages              unchanged (restyle only)
/admin/reviews               unchanged (restyle only)
/admin/media/photos          NEW
/admin/media/videos          NEW
/admin/media/news            NEW
/admin/media/magazines       NEW
```

### 5.3 Navigation rendering rules
- **Desktop header:** horizontal nav with hover dropdowns for "Our People" and "Media". Dropdowns use the `--bg-surface` background with `--border` outline, descend 8px below the trigger.
- **Mobile header:** hamburger → full-screen slide-in menu. Dropdowns become expandable sections.
- **Active state:** orange underline (2px) under the active top-level item.
- **Admin pages:** their own secondary tab nav (already exists, extend to 7 tabs).

---

## 6. Database — `supabase/migrations/0004_media.sql`

### 6.1 Tables

```sql
-- media_photos
create table public.media_photos (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  photo_url   text not null,
  category    text not null check (category in ('training','matches','events','facilities')),
  uploaded_at timestamptz not null default now()
);

-- media_videos
create table public.media_videos (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  description   text,
  video_url     text not null,                 -- e.g. https://www.youtube.com/embed/XXX
  thumbnail_url text,
  uploaded_at   timestamptz not null default now()
);

-- news_articles
create table public.news_articles (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  slug            text not null unique,
  excerpt         text not null,
  content         text not null,                -- markdown
  featured_image  text,
  author          text not null default 'Sridharan TTA',
  is_published    boolean not null default true,
  published_at    timestamptz not null default now()
);

create index news_articles_published_idx
  on public.news_articles(is_published, published_at desc);

-- magazines
create table public.magazines (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  cover_image text not null,
  pdf_url     text not null,
  issue_date  date not null,
  description text,
  uploaded_at timestamptz not null default now()
);
```

### 6.2 Schema additions to existing tables (per §3 D7)

```sql
alter table public.team_members
  add column if not exists category        text check (category in ('senior','junior','youth','sub_youth')),
  add column if not exists playing_style   text check (playing_style in ('attacking','all_round','defensive','power','spin')),
  add column if not exists age             int  check (age between 5 and 99),
  add column if not exists years_training  int  check (years_training >= 0);
```

### 6.3 RLS policies (mirrors §3 brief)

```sql
-- enable RLS on all 4 new tables
alter table public.media_photos    enable row level security;
alter table public.media_videos    enable row level security;
alter table public.news_articles   enable row level security;
alter table public.magazines       enable row level security;

-- Public SELECT (with is_published filter on news)
create policy "media_photos_select_public"    on public.media_photos    for select using (true);
create policy "media_videos_select_public"    on public.media_videos    for select using (true);
create policy "news_articles_select_public"   on public.news_articles   for select using (is_published = true);
create policy "magazines_select_public"       on public.magazines       for select using (true);

-- Authorized scorers can read ALL news (including unpublished)
create policy "news_articles_select_authorized" on public.news_articles
  for select using (public.is_authorized_scorer());

-- Authorized scorers: full write access to all 4
-- (insert + update + delete policies generated for each, all gated on is_authorized_scorer())
```

### 6.4 Seed data (in same migration file)

- **8 photos** — categories mixed: training (3), matches (2), events (2), facilities (1). Image URLs:
  - `https://images.unsplash.com/photo-1534158914592-062992fbe900` (training)
  - `https://images.unsplash.com/photo-1611251135345-18c56206b863` (training)
  - 6 additional table-tennis-themed Unsplash URLs to be finalized in Phase 1 (will use confirmed Unsplash photo IDs after Phase 1 spot-check)
- **4 videos** — all using placeholder `https://www.youtube.com/embed/dQw4w9WgXcQ`, with realistic titles ("Academy Tour 2024", "Coaching Methodology Explained", "State Championship Highlights — December 2024", "Founder's Story: Sridharan Murugan")
- **3 news articles** — exact titles from brief:
  1. "Karthik Subramanian Wins State U-19 Championship" — slug `karthik-subramanian-state-u19-2024`
  2. "Academy Welcomes Three New Coaches" — slug `three-new-coaches-2025`
  3. "Annual Inter-Academy Tournament Results" — slug `inter-academy-tournament-2024`
  Each gets a 2–3 paragraph markdown body, an excerpt, a featured image URL.
- **2 magazines** — covers + placeholder PDF URLs (`https://example.com/magazine.pdf`):
  1. "Spin Quarterly — Q4 2024"
  2. "The Academy Annual — 2024"

### 6.5 Founder rename (per §3 D4)
```sql
update public.team_members
  set full_name = 'Sridharan Murugan'
  where role = 'founder' and full_name = 'Sridharan';
```

---

## 7. Page-by-page specifications

### 7.1 Home — `app/page.tsx`

Nine sections, in order:

#### Section 1 — Hero
- Full-bleed background image (Unsplash table-tennis action shot, ~1920×1080)
- Black gradient overlay: `linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.8) 100%)`
- Centered text block, left-aligned within container:
  - Eyebrow: "CHENNAI · SINCE 2010"
  - H1: "Where Chennai's champions are made."
  - Sub: "Premier table tennis training since 2010."
  - Two CTAs:
    - Primary (orange) → triggers `ContactModal` ("Message us")
    - Ghost outline → triggers `VideoModal` ("Watch our story →")
- Min-height `min-h-[90vh]`, scroll cue at bottom

#### Section 2 — About (embedded, NOT a separate route)
- Container: 2-column grid on desktop (text left, video right), stacks on mobile
- Eyebrow: "About"
- H2: "About Sridharan Academy"
- 2 paragraphs:
  - Founding paragraph (2010, by Sridharan Murugan, mission)
  - Growth/community paragraph
- Right column: 16:9 YouTube iframe (the same Watch-our-story placeholder)
- Below the 2-col block: two `ImageWithCaption` blocks side-by-side
  - Image 1 caption: "World-class facilities in the heart of Chennai. Six international-spec tables, dedicated training halls, and modern equipment."
  - Image 2 caption: "Our graduates have competed at district, state, and national levels — and gone on to careers in sport, education, and beyond."

#### Section 3 — Quick Links Grid
- Heading: "Explore the academy"
- 3-col × 2-row grid on desktop, 2-col on tablet, 1-col mobile
- Six `QuickLinkCard`s:
  1. **Our Coaches** → `/team`
  2. **Training Programmes** → opens a `ProgramsModal` (client component, lists 4–5 programs in a card list)
  3. **Facts & Figures** → `#stats` anchor on same page
  4. **Testimonials** → `#testimonials` anchor on same page
  5. **Visit Us** → `#find-us` anchor on same page
  6. **Latest News** → `/media/news`
- Each card: background image, dark overlay, title, arrow icon. Hover lifts the card and brightens overlay.

#### Section 4 — Facts & Figures (`#stats`)
- Heading: "Facts & Figures"
- 6 `StatCounter`s in a 2×3 mobile / 6×1 desktop grid (per §3 D11):
  - 15+ Years of excellence
  - 500+ Students trained
  - 50+ State champions
  - 12 National qualifiers
  - 6 International-spec tables
  - 4 Professional coaches
- Each counter animates from 0 to value over 1.2s when scrolled into view

#### Section 5 — Featured Players
- Heading: "Meet our players"
- `Carousel` of player cards (5–6 visible, drag/scroll to reveal more)
- Card content: portrait, name, age, playing style badge, latest achievement
- Data: `team_members where role='player' order by display_order limit 10`
- CTA at end of carousel: "View all players →" → `/players`

#### Section 6 — Latest News Strip
- Heading: "Latest news"
- 3 most recent published articles in a horizontal 3-col grid
- Each card: featured image (top), date, title, 2-line excerpt clamped
- "All news →" link → `/media/news`

#### Section 7 — Testimonials (`#testimonials`)
- Existing `ReviewsSection` component, restyled to dark theme
- No structural change

#### Section 8 — Find Us (`#find-us`)
- Replaces `LocationBlock`, renamed `FindUs`
- Left: address, phone, email, opening hours
- Right: Google Maps iframe (existing)

#### Section 9 — Footer (see §7.10)

### 7.2 `/media` landing — `app/media/page.tsx`
- Hero strip with H1 "Media" + small intro
- 4 large tile cards (2×2 grid), each linking to a sub-page
- Each tile: full-bleed preview image, title overlay, hover zoom
- Tiles: Photo Gallery, Video Gallery, News, Magazines

### 7.3 `/media/photos` — `app/media/photos/page.tsx`
- Server component fetches all photos
- Renders `<PhotoGalleryClient photos={...} />`
- Client component handles:
  - Filter chips at top: All / Training / Matches / Events / Facilities
  - 4-col grid (4 desktop / 3 tablet / 2 mobile)
  - Each photo: rounded square, hover zoom
  - Click opens `LightboxModal` with full-size image, title, description, navigation arrows

### 7.4 `/media/videos` — `app/media/videos/page.tsx`
- 3-col grid of video cards
- Each card: 16:9 thumbnail with play-icon overlay, title, description preview
- Click opens `VideoModal` with iframe player
- Thumbnail fallback if `thumbnail_url` is null: YouTube `https://img.youtube.com/vi/{id}/hqdefault.jpg` extracted from the embed URL

### 7.5 `/media/news` — `app/media/news/page.tsx`
- Heading: "News"
- List view (not grid) — newest first
- Each row: featured image (left, ~40% width), title + date + excerpt (right)
- Title is `Link` to `/media/news/[slug]`
- Pagination only if articles > 15 (not in initial seed)

### 7.6 `/media/news/[slug]` — `app/media/news/[slug]/page.tsx`
- Dynamic route, awaited `params` (Next 16 convention)
- Server component fetches article by slug
- 404 via `notFound()` if missing or not published
- Layout:
  - Featured image (full-width hero, ~50vh)
  - Container narrow (~720px)
  - Date + author meta
  - H1 title
  - Markdown content (rendered with `react-markdown`)
  - "← Back to news" link at bottom

### 7.7 `/media/magazines` — `app/media/magazines/page.tsx`
- 3-col grid of magazine cards
- Each card: cover image (portrait aspect), title, issue date, description, "Download PDF" button
- Button: `<a href={pdf_url} target="_blank" rel="noopener" download>`

### 7.8 `/players` — `app/players/page.tsx` (NEW)
- Hero: full-bleed player action shot, dark overlay
  - H1: "Our Players"
  - Sub: "Meet the athletes representing Sridharan Academy on local, state, and national stages."
  - Stats bar (3 stats below the hero, fetched live):
    - Active players: count of `team_members where role='player'`
    - Tournament wins this year: count of `matches where winner is a player and date in current year`
    - Currently ranked: hardcoded placeholder until we have a rankings table — defaults to "—"
- Filter chips (client component):
  - Row 1: All / Senior / Junior / Youth / Sub-Youth (category)
  - Row 2: Attacking / All-round / Defensive / Power / Spin (playing_style)
- 3-col grid of large player cards:
  - Big circular portrait (or initial-avatar fallback if `photo_url` null)
  - Name + age
  - Playing-style badge
  - Years training
  - 2–3 line bio
  - Last 3 achievements bulleted
  - "View profile →" link (links to `/players/[id]` — **deferred to Phase 6.5 — initial release will have the link disabled with `cursor-not-allowed` until profile pages are built**)

### 7.9 `/team` — `app/team/page.tsx` (REFOCUS)
- Same component structure as today (uses existing `TeamSection`)
- Query change: `where role in ('founder','manager','coach')` — exclude players
- Page H1 changes from "Our Team" to "Coaches & Staff"
- All other styling adapted to new dark palette

### 7.10 Footer — `components/site/site-footer.tsx`
Multi-column footer, dark with subtle orange accents:
- **Col 1 (wider):** Brand mark + tagline "Premier table tennis training in Chennai since 2010."
- **Col 2 — Site:** Home / Our People / Media / Matches
- **Col 3 — Media:** Photo Gallery / Video Gallery / News / Magazines
- **Col 4 — Contact:** address, phone, email, opening hours
- **Social icons row:** Facebook, Instagram, YouTube, X/Twitter (icon-only)
- **Bottom bar:** `© 2010–{currentYear} Sridharan Table Tennis Academy. All rights reserved.` + Privacy / Terms links (these can be stubs that render `<main>Coming soon</main>` for now)

---

## 8. Admin panel additions

### 8.1 Admin tab nav (extend `components/admin/admin-tab-nav.tsx`)
7 tabs:
1. Score Entry
2. Messages
3. Reviews
4. Photos (`/admin/media/photos`)
5. Videos (`/admin/media/videos`)
6. News (`/admin/media/news`)
7. Magazines (`/admin/media/magazines`)

On mobile: horizontal scroll. Active tab autoscrolls into view on mount.

### 8.2 `/admin/media/photos`
- List of all photos in a small grid
- "Add photo" button → opens an inline form (no full modal):
  - Inputs: title, description, photo_url (paste URL — no upload yet), category select
  - Submit → server action `createPhoto`
- Each photo card has Edit (inline) + Delete (with confirmation)
- All actions: `app/admin/media/photos/actions.ts`

### 8.3 `/admin/media/videos`
- Same shape as photos, but inputs are: title, description, video_url, thumbnail_url (optional)
- Server actions: `createVideo`, `updateVideo`, `deleteVideo`

### 8.4 `/admin/media/news`
- List of all articles (published + draft)
- "New article" button → opens a full-page editor at `/admin/media/news/new` (not a modal — too cramped)
- Editor form: title, slug (auto-generated from title via `slugify`, editable), excerpt, content (textarea, markdown), featured_image, author, is_published toggle
- Edit existing → `/admin/media/news/[id]/edit`
- Delete inline with confirmation
- Server actions: `createArticle`, `updateArticle`, `deleteArticle`, `togglePublished`

### 8.5 `/admin/media/magazines`
- Same shape as photos, inputs: title, cover_image, pdf_url, issue_date, description
- Server actions: `createMagazine`, `updateMagazine`, `deleteMagazine`

### 8.6 Auth on all admin sub-pages
- Same two-gate check used in existing admin pages:
  1. `auth.getUser()` → redirect to `/admin/login` if null
  2. `rpc('is_authorized_scorer')` → redirect to `/admin/scores` if false
- Extract this into a shared helper: `lib/admin-guard.ts` exporting `requireAuthorizedScorer()` that returns the supabase client + user, or redirects.

---

## 9. Component inventory — what gets built

### 9.1 New files (Phase mapping in parens)

```
app/
├── media/
│   ├── page.tsx                                  (P5)
│   ├── photos/
│   │   ├── page.tsx                              (P5)
│   │   └── photo-gallery-client.tsx              (P5)
│   ├── videos/
│   │   ├── page.tsx                              (P5)
│   │   └── video-gallery-client.tsx              (P5)
│   ├── news/
│   │   ├── page.tsx                              (P5)
│   │   └── [slug]/page.tsx                       (P5)
│   └── magazines/
│       └── page.tsx                              (P5)
├── players/
│   ├── page.tsx                                  (P6)
│   └── players-grid-client.tsx                   (P6)
├── admin/
│   └── media/
│       ├── photos/
│       │   ├── page.tsx                          (P8)
│       │   ├── actions.ts                        (P8)
│       │   └── photo-form.tsx                    (P8)
│       ├── videos/
│       │   ├── page.tsx                          (P8)
│       │   ├── actions.ts                        (P8)
│       │   └── video-form.tsx                    (P8)
│       ├── news/
│       │   ├── page.tsx                          (P8)
│       │   ├── actions.ts                        (P8)
│       │   ├── new/page.tsx                      (P8)
│       │   └── [id]/edit/page.tsx                (P8)
│       └── magazines/
│           ├── page.tsx                          (P8)
│           ├── actions.ts                        (P8)
│           └── magazine-form.tsx                 (P8)

components/
├── site/
│   ├── editorial-section.tsx                     (P2)
│   ├── eyebrow.tsx                               (P2)
│   ├── pill.tsx                                  (P2)
│   ├── carousel.tsx                              (P2)
│   ├── image-with-caption.tsx                    (P2)
│   ├── lightbox-modal.tsx                        (P2)
│   ├── video-modal.tsx                           (P2)
│   ├── stat-counter.tsx                          (P2)
│   └── quick-link-card.tsx                       (P2)
├── home/
│   ├── about-section.tsx                         (P4.2)
│   ├── quick-links-grid.tsx                      (P4.3)
│   ├── facts-and-figures.tsx                     (P4.4)
│   ├── featured-players.tsx                      (P4.5)
│   ├── latest-news.tsx                           (P4.6)
│   ├── find-us.tsx                               (P4.8)
│   └── programs-modal.tsx                        (P4.3)
└── nav/
    ├── desktop-nav.tsx                           (P3)
    └── mobile-nav.tsx                            (P3)

lib/
├── admin-guard.ts                                (P8)
├── slugify.ts                                    (P8)
└── youtube.ts                                    (extract video ID from embed URL, P2)

supabase/
└── migrations/
    └── 0004_media.sql                            (P1)
```

### 9.2 Files to delete

```
components/home/tt-history.tsx
components/home/tt-benefits.tsx
components/home/what-to-expect.tsx
components/home/location-block.tsx       (replaced by find-us.tsx)
components/home/founder-vision.tsx       (content merged into about-section.tsx)
```

### 9.3 Files to modify

```
app/page.tsx                       — full rewrite (P4)
app/team/page.tsx                  — query change + restyle (P7)
app/layout.tsx                     — new fonts? no — keep Manrope/Inter; restyle bg (P2)
app/globals.css                    — palette migration (P2)
components/site/site-header.tsx    — desktop + mobile nav (P3)
components/site/site-footer.tsx    — multi-column (P4.10)
components/site/logo.tsx           — adjust for dark bg (P2)
components/admin/admin-tab-nav.tsx — extend to 7 tabs (P8)
components/home/hero.tsx           — full rewrite (P4.1)
components/home/contact-modal.tsx  — restyle (P2)
components/home/reviews-section.tsx — restyle (P2)
lib/types.ts                       — add MediaPhoto, MediaVideo, NewsArticle, Magazine; extend TeamMember (P1)
supabase/README.md                 — add 0004 instructions (P1)
```

---

## 10. Implementation phases — ordered build plan

Each phase produces a runnable checkpoint. The user reviews before proceeding. **Each phase ends with `npm run build` passing.**

### Phase 0 — Decisions & confirmation
- User confirms or amends §3 decisions
- No code changes

### Phase 1 — Schema, types, README
- Write `supabase/migrations/0004_media.sql` with tables, RLS, seeds, founder rename, team_members column additions
- Extend `lib/types.ts`: `MediaPhoto`, `MediaVideo`, `NewsArticle`, `Magazine`, extend `TeamMember` with `category | playing_style | age | years_training`
- Update `supabase/README.md` with instructions for the new migration
- **Manual step for user:** paste `0004_media.sql` into Supabase SQL Editor and run
- `npm install react-markdown` (for news article rendering)

### Phase 2 — Design system migration
- Rewrite `app/globals.css` with new palette
- Add the 9 building-block components in `components/site/` (editorial-section, eyebrow, pill, carousel, image-with-caption, lightbox-modal, video-modal, stat-counter, quick-link-card)
- Restyle `contact-modal.tsx` and `reviews-section.tsx` for dark theme (visual only, no logic change)
- Restyle admin pages (messages, reviews) for dark theme
- Restyle `/matches` for dark theme
- **Checkpoint:** every existing page renders on the new dark palette without layout breakage

### Phase 3 — Navigation overhaul
- Build `components/nav/desktop-nav.tsx` with hover dropdowns for "Our People" and "Media"
- Build `components/nav/mobile-nav.tsx` with full-screen slide-in menu
- Replace `site-header.tsx` to use these
- **Checkpoint:** all 7 future routes navigable via nav (broken pages 404 cleanly until built)

### Phase 4 — Home page rebuild
Each sub-phase produces a working home page with that section live:
- **4.1** Hero (image bg + 2 CTAs, video modal wired)
- **4.2** About (text + video iframe + 2 image-caption blocks)
- **4.3** Quick Links Grid (6 cards, Programs modal)
- **4.4** Facts & Figures (6 animated stat counters)
- **4.5** Featured Players carousel (data from `team_members`)
- **4.6** Latest News strip (data from `news_articles`)
- **4.7** Testimonials (restyled existing)
- **4.8** Find Us (restyled existing)
- **4.9** Delete deprecated home components (`tt-history`, `tt-benefits`, `what-to-expect`, `location-block`, `founder-vision`)
- **4.10** Footer rebuild (multi-column)

### Phase 5 — Media routes
- 5.1 `/media` landing (4 tiles)
- 5.2 `/media/photos` (filter + grid + lightbox)
- 5.3 `/media/videos` (grid + video modal)
- 5.4 `/media/news` (list view)
- 5.5 `/media/news/[slug]` (article view with markdown)
- 5.6 `/media/magazines` (grid + download)

### Phase 6 — `/players` page
- 6.1 Hero + stats bar
- 6.2 Filter chips (category + playing_style)
- 6.3 Player card grid
- 6.4 Live stat queries (active, wins this year)
- 6.5 (deferred) `/players/[id]` profile pages — disabled link in initial release

### Phase 7 — `/team` page refocus
- Change query to exclude players
- Restyle to new palette (already done in P2, just verify)
- Rename H1

### Phase 8 — Admin media sub-pages
- 8.1 `lib/admin-guard.ts` (shared auth helper)
- 8.2 Extend `admin-tab-nav.tsx` to 7 tabs
- 8.3 `/admin/media/photos` (CRUD)
- 8.4 `/admin/media/videos` (CRUD)
- 8.5 `/admin/media/news` (CRUD with editor at `/new` and `/[id]/edit`)
- 8.6 `/admin/media/magazines` (CRUD)

### Phase 9 — Polish, responsive, build
- Mobile responsive audit on every new page (resize down to 360px)
- Accessibility audit (alt text, focus rings, keyboard nav on dropdowns)
- Final `npm run build` — zero TS/lint errors
- Manually test golden paths: home scroll, dropdown nav, lightbox, video modal, news article, admin CRUD

---

## 11. Seed data details (Phase 1)

### 11.1 Photo seeds (8 rows)
| Title | Category | Image URL |
|---|---|---|
| "Morning footwork drill" | training | `https://images.unsplash.com/photo-1534158914592-062992fbe900` |
| "Forehand technique session" | training | `https://images.unsplash.com/photo-1611251135345-18c56206b863` |
| "Junior camp 2024" | training | (to confirm in Phase 1) |
| "State qualifier — semifinal" | matches | (to confirm) |
| "District finals trophy" | matches | (to confirm) |
| "Annual awards night" | events | (to confirm) |
| "Open house weekend" | events | (to confirm) |
| "Main training hall" | facilities | (to confirm) |

For Phase 1, I'll spot-check Unsplash to confirm each URL renders a relevant image before committing it to the migration.

### 11.2 Video seeds (4 rows)
All using `https://www.youtube.com/embed/dQw4w9WgXcQ` as placeholder. Titles:
- "Academy Tour 2024"
- "Coaching Methodology Explained"
- "State Championship Highlights — December 2024"
- "Founder's Story: Sridharan Murugan"

### 11.3 News seeds (3 articles, all `is_published=true`)

**Article 1** — `karthik-subramanian-state-u19-2024`
> Title: "Karthik Subramanian Wins State U-19 Championship"
> Excerpt: "Academy player Karthik Subramanian claimed gold at the Tamil Nadu State U-19 Championship, defeating last year's champion in a five-set thriller."
> Body (markdown): ~3 paragraphs about the match, his training journey, what's next (Nationals in March).

**Article 2** — `three-new-coaches-2025`
> Title: "Academy Welcomes Three New Coaches"
> Excerpt: "We're delighted to announce three experienced coaches joining the Sridharan TTA family — bringing decades of competitive experience to our students."
> Body: introduce the coaches (placeholder names matching existing "Coach 1/2/3" or refresh to realistic names).

**Article 3** — `inter-academy-tournament-2024`
> Title: "Annual Inter-Academy Tournament Results"
> Excerpt: "Our annual inter-academy tournament concluded last weekend with strong performances across all age categories."
> Body: ~3 paragraphs of results recap.

### 11.4 Magazine seeds (2 rows)
1. Title: "Spin Quarterly — Q4 2024", `issue_date: 2024-10-01`, `pdf_url: https://example.com/spin-q4-2024.pdf`, cover_image: TBC Unsplash URL
2. Title: "The Academy Annual — 2024", `issue_date: 2024-12-01`, `pdf_url: https://example.com/annual-2024.pdf`, cover_image: TBC Unsplash URL

### 11.5 Player schema additions (UPDATE statements in migration)
For each of Player 1–6 in existing seed: set realistic `age`, `category`, `playing_style`, `years_training`. Example:
```sql
update public.team_members set age = 17, category = 'junior', playing_style = 'attacking', years_training = 8 where full_name = 'Player 1';
-- ... (5 more rows)
```

---

## 12. Acceptance criteria

A phase is "done" only when **all** these pass:

### Per-phase
- ✅ `npm run build` exits 0 with zero TS errors and zero lint warnings on changed files
- ✅ New routes return 200 and render visible content (not blank page)
- ✅ Mobile responsive — manual check at 360px, 768px, 1024px, 1440px
- ✅ Dark palette consistent — no leftover `var(--tta-navy)` etc. in changed files

### Whole-restructure done when
- ✅ Nav has exactly the 5 top-level items from §5.3
- ✅ Home page has all 9 sections in order with no broken images/links
- ✅ `/players`, `/team`, `/matches` all load with correct content
- ✅ All 6 `/media/*` routes load
- ✅ News article slug route renders markdown
- ✅ All 4 admin media CRUD pages work end-to-end (create, edit, delete) with an authorized scorer
- ✅ Anonymous user cannot access `/admin/media/*` (redirect to login)
- ✅ Public can only see `is_published=true` news; admin sees all
- ✅ Footer has all columns + social row + bottom bar
- ✅ `0004_media.sql` runs cleanly on a fresh Supabase project

---

## 13. Risks and mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Palette migration breaks visual consistency on existing pages | High | Phase 2 ends with a manual visual check on every existing page before P3 starts |
| `react-markdown` adds bundle weight to home page | Low | Only loaded on `/media/news/[slug]` — dynamic import keeps it out of home bundle |
| Stats counter animation on scroll causes hydration mismatch | Medium | Render static numbers SSR, animate only after `useEffect` mount + IntersectionObserver |
| Filter chips on `/players` produce empty results when seed data has null `category` | Medium | NULL filter behavior: "All" shows everyone; other chips only show rows where the column is non-null. Add seed UPDATE statements (§11.5). |
| News markdown allows XSS if a malicious admin inserts a `<script>` | Low (admins are trusted) | `react-markdown` by default does NOT render raw HTML — that's the safe default |
| Image URLs from Unsplash break (link rot) | Low | Use Unsplash's stable photo-ID URL form, not the editorial URLs that can change |
| Next.js `Image` component requires domains config for external URLs | High | Add `remotePatterns` for `images.unsplash.com` and `img.youtube.com` in `next.config.ts` during P1 |
| Carousel touch/drag UX on mobile | Medium | Use CSS scroll-snap (native), not a JS carousel library — degrades gracefully |
| Admin nav with 7 tabs overflows on small screens | High | Horizontal scroll with snap, visible scrollbar hidden, fade-out edges to indicate more content |

---

## 14. What I need from the user before Phase 1

1. **Confirm or amend each of the 12 decisions in §3.**
2. **Approve the navigation final shape (§5.3).**
3. **Approve the deletion of `tt-history`, `tt-benefits`, `what-to-expect` components.**
4. **Confirm the founder rename to "Sridharan Murugan".**
5. **Provide (or approve placeholder) real video URL for "Watch our story" — or accept `dQw4w9WgXcQ` placeholder.**
6. **Confirm the migration filename should be `0004_media.sql` (skipping `0003`).**

Once §14 is signed off, I'll execute Phase 1 → Phase 9 in order, pausing at each phase boundary for review.
