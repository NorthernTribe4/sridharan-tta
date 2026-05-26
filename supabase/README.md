# Supabase Setup

Follow these steps to connect the app to a real Supabase database.

---

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign in.
2. Click **New project**. Choose a name (e.g. `sridharan-tta`), set a strong database password, and pick region **ap-south-1 (Mumbai)** for lowest latency from Chennai.
3. Wait ~2 minutes for the project to spin up.

---

## 2. Run the migration

### Option A — SQL Editor (easiest)

1. In the Supabase dashboard, go to **SQL Editor → New query**.
2. Open `supabase/migrations/0001_init.sql` from this repo.
3. Paste the entire file into the editor and click **Run**.
4. Repeat with `supabase/migrations/0002_contact_messages.sql` — this adds the contact messages table, reviews table, RLS policies, and seeds 5 approved reviews.

### Option B — Supabase CLI

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

The migrations create all tables, RLS policies, the winner-computation trigger, seeds the initial team members, and seeds 5 approved reviews for the home page testimonials section.

---

## 3. Fill in `.env.local`

1. In the Supabase dashboard, go to **Settings → API**.
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret — never expose it client-side)

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 4. Create a coach user

1. In the dashboard, go to **Authentication → Users → Add user**.
2. Enter the coach's email and a temporary password. Click **Create user**.
3. Copy the **User UID** (shown in the users table).
4. Go to **SQL Editor** and run:

```sql
insert into public.authorized_scorers (user_id, note)
values ('<paste-user-uid-here>', 'Coach 1');
```

The coach can now log in at `/admin/login` and enter match scores.

---

## 5. (Optional) Regenerate TypeScript types

After any schema changes, refresh the auto-generated types:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_REF \
  > lib/supabase/database.types.ts
```

---

## 6. Auth URL configuration (for deployment)

When deploying to Vercel, add your production URL to:

**Supabase → Authentication → URL Configuration**
- **Site URL**: `https://your-production-domain.com`
- **Additional Redirect URLs**: `http://localhost:3000`
