# StorageStack

The self storage community: forums for investors, operators and developers, plus a Deal Room
for facilities for sale, capital raises, partnerships and loans.

Built with **Next.js 15** (App Router, Server Components, Server Actions) and **Supabase**
(Postgres, Auth, Storage, Row Level Security). The UI implements design **A2 — Classic Community,
modernized** and its Deal Room screens.

## What's in it

| Area | Routes |
| --- | --- |
| Home | `/` |
| Forums (design A2) | `/forums` (topics, sort tabs, following, saved), `/forums/[id]`, `/forums/new` |
| Deal Room | `/deals` (deal types, filters, capital partners), `/deals/[id]`, `/deals/new` (6-step wizard) |
| Your deals | `/deals/mine` (approve or decline requests, close deals), `/deals/alerts`, `/deals/partners/join` |
| Members | `/u/[id]` profiles, `/settings` |
| Admin (admins only) | `/admin/members` (search, verify, roles, suspend, delete), `/admin/topics` (add, edit, reorder, delete forum topics) |
| Other | `/search`, `/login`, `/signup`, `/tools`, `/learn`, `/guidelines` |

### Privacy model

- Deal **addresses** live in `deal_private` and **documents** in the private `deal-docs` storage bucket.
  Both are readable only by the poster and members whose request the poster approved (or any verified
  member, if the poster chose that). This is enforced by Postgres RLS and storage policies, not the UI.
- Counters (likes, replies, interest) are maintained by triggers; members can only write the columns
  they own (column-level grants), so they cannot pin threads or inflate counts.
- Admins are members with `profiles.is_admin`. Admin changes go through `security definer` functions and
  RLS policies that check `is_admin()` in Postgres, so the admin panel is not the only gate. Members cannot
  set `is_admin` on themselves. Admins cannot demote, suspend or delete themselves, and must remove another
  admin's access before suspending or deleting them.

## Run it locally

Requirements: Node 20+, Docker (for the local Supabase stack).

```bash
npm install
npm run db:start          # starts Supabase locally, applies migrations and seed data
cp .env.example .env.local
# paste the API URL and anon key printed by db:start into .env.local
npm run dev               # http://localhost:3000
```

The seed creates sample discussions, deals and members from the design mockups, plus demo logins
(local only): `demo@storagestack.dev` / `storagestack-demo`, and `admin@storagestack.dev` /
`storagestack-admin` for the admin panel.

Useful scripts:

- `npm run db:reset` — rebuild the local database from migrations and `supabase/seed.sql`
- `npm run db:types` — regenerate `src/lib/database.types.ts` after changing the schema
- `npm run lint`, `npm run typecheck`, `npm run build`

## Deploy

1. Create a Supabase project and link it: `npx supabase link --project-ref <ref>`.
2. Push the schema: `npx supabase db push` (do not run the seed in production).
   Then make yourself an admin in the SQL editor:
   `update profiles set is_admin = true where id = (select id from auth.users where email = 'you@example.com');`
3. In Supabase Auth settings set the Site URL to your domain and add `https://<domain>/auth/confirm`
   as a redirect URL.
4. Deploy the Next.js app (e.g. Vercel) with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   and `NEXT_PUBLIC_SITE_URL`.

## Project layout

```
src/app/            routes, server actions (src/app/actions)
src/components/     UI: shell, forum, deals
src/lib/            Supabase clients, queries, config, formatting, generated DB types
supabase/           config, migrations, seed
```
